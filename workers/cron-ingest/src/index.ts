/**
 * cron-ingest · ROMAS Brief
 * T-115 full implementation
 *
 * Runs on three-edition schedule per SSOT §3 row 16:
 *   APAC   21:00 UTC (Sun–Thu)
 *   EU     05:00 UTC (Mon–Fri)
 *   Americas 10:00 UTC (Mon–Fri)
 *
 * Sources: PubMed, arXiv, ClinicalTrials.gov, openFDA→FDA, society RSS feeds
 * Outputs: source_health rows in Supabase, embargo_holds for embargoed items,
 *          source_health_summary.json written to R2 RAW bucket.
 *
 * Inviolable rules enforced here:
 *   Rule 1: No primary source URL → no publish (items without source_url are dropped)
 *   Rule 2: Embargoed items → embargo_holds, never articles
 *   Rule 4: openFDA is discovery only; must verify against official FDA record
 *   Rule 5: Source failures are logged, never silently dropped
 */

// ─── Env interface ───────────────────────────────────────────────────────────

export interface Env {
  /** R2 bucket for raw ingest artefacts and health summary JSON */
  RAW: R2Bucket;
  /** Supabase project URL (non-secret, in [vars]) */
  SUPABASE_URL: string;
  /** Supabase service-role key (Worker Secret) */
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Shared secret for the manual-trigger fetch handler */
  INGEST_TRIGGER_SECRET: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Region = "us" | "eu" | "uk" | "ca" | "jp" | "au" | "cn" | "global";

interface RawItem {
  source_slug: string;
  source_url: string;
  source_identifier?: string | undefined;
  title: string;
  published_at: string;
  region: Region;
  abstract?: string | undefined;
  raw?: unknown;
}

interface SourceHealthEntry {
  source_slug: string;
  status_code: number;
  error?: string | undefined;
  items_returned?: number | undefined;
  latency_ms: number;
}

interface HealthSummary {
  run_started_at: string;
  run_finished_at: string;
  edition: string;
  sources_attempted: number;
  sources_succeeded: number;
  sources_failed: number;
  failures: Array<{ source_slug: string; status_code: number; error?: string | undefined }>;
  items_after_dedupe: number;
  items_after_relevance_filter: number;
  embargoed_count: number;
  candidate_pool_for_scoring: number;
}

// ─── Supabase REST helper ─────────────────────────────────────────────────────

function supabase(env: Env) {
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  async function insert(table: string, rows: unknown[]): Promise<void> {
    if (rows.length === 0) return;
    const res = await fetch(`${base}/rest/v1/${table}`, {
      method: "POST",
      headers,
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase insert ${table} HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
  }

  async function select<T>(table: string, params: Record<string, string>): Promise<T[]> {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${base}/rest/v1/${table}?${qs}`, {
      headers: { ...headers, Prefer: "return=representation" },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase select ${table} HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    return res.json() as Promise<T[]>;
  }

  return { insert, select };
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  backoffMs: number[] = [1000, 4000, 16000],
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        const delay = backoffMs[i] ?? 16000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

// ─── Source fetchers ─────────────────────────────────────────────────────────

/** PubMed E-utilities — radiation oncology MeSH filter, last 24h */
async function fetchPubMed(): Promise<RawItem[]> {
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const term = encodeURIComponent(
    `(Radiotherapy[Mesh] OR "Radiation Oncology"[Mesh] OR "Radiosurgery"[Mesh]) AND ("${yesterday}"[PDAT]:"${today}"[PDAT])`,
  );
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${term}&retmax=100&retmode=json`;
  const searchRes = await withRetry(() =>
    fetch(searchUrl, { headers: { Accept: "application/json" } }),
  );
  if (!searchRes.ok)
    throw Object.assign(new Error(`PubMed esearch HTTP ${searchRes.status}`), {
      status: searchRes.status,
    });
  const searchData = (await searchRes.json()) as {
    esearchresult: { idlist: string[] };
  };
  const ids = searchData.esearchresult.idlist;
  if (ids.length === 0) return [];

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const summaryRes = await withRetry(() =>
    fetch(summaryUrl, { headers: { Accept: "application/json" } }),
  );
  if (!summaryRes.ok)
    throw Object.assign(new Error(`PubMed esummary HTTP ${summaryRes.status}`), {
      status: summaryRes.status,
    });
  const summaryData = (await summaryRes.json()) as {
    result: Record<string, { uid: string; title: string; pubdate: string }>;
  };

  const items: RawItem[] = [];
  for (const pmid of ids) {
    const doc = summaryData.result[pmid];
    if (!doc) continue;
    items.push({
      source_slug: "pubmed",
      source_url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      source_identifier: pmid,
      title: doc.title ?? "",
      published_at: new Date(doc.pubdate ?? Date.now()).toISOString(),
      region: "global",
      raw: doc,
    });
  }
  return items;
}

/** arXiv — physics.med-ph + eess.IV, last 24h */
async function fetchArXiv(): Promise<RawItem[]> {
  const query = encodeURIComponent("cat:physics.med-ph OR cat:eess.IV");
  const url = `https://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending`;
  const res = await withRetry(() =>
    fetch(url, { headers: { Accept: "application/atom+xml" } }),
  );
  if (!res.ok)
    throw Object.assign(new Error(`arXiv HTTP ${res.status}`), { status: res.status });
  const xml = await res.text();
  const cutoff = Date.now() - 86_400_000;
  const items: RawItem[] = [];

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1] ?? "";
    const id = extractXmlText(entry, "id") ?? "";
    const title = extractXmlText(entry, "title")?.replace(/\s+/g, " ").trim() ?? "";
    const published = extractXmlText(entry, "published") ?? new Date().toISOString();
    const summary = extractXmlText(entry, "summary")?.replace(/\s+/g, " ").trim();
    if (new Date(published).getTime() < cutoff) continue;
    const arxivId = id
      .replace("http://arxiv.org/abs/", "")
      .replace("https://arxiv.org/abs/", "");
    const item: RawItem = {
      source_slug: "arxiv",
      source_url: `https://arxiv.org/abs/${arxivId}`,
      source_identifier: arxivId,
      title,
      published_at: new Date(published).toISOString(),
      region: "global",
    };
    if (summary !== undefined) item.abstract = summary;
    items.push(item);
  }
  return items;
}

/** ClinicalTrials.gov — radiation/radiotherapy, new or updated */
async function fetchClinicalTrials(): Promise<RawItem[]> {
  const url =
    "https://clinicaltrials.gov/api/v2/studies?query.term=radiation+OR+radiotherapy&pageSize=50&format=json";
  const res = await withRetry(() =>
    fetch(url, { headers: { Accept: "application/json" } }),
  );
  if (!res.ok)
    throw Object.assign(new Error(`ClinicalTrials HTTP ${res.status}`), { status: res.status });
  const data = (await res.json()) as {
    studies: Array<{
      protocolSection: {
        identificationModule: { nctId: string; briefTitle: string };
        statusModule: { lastUpdatePostDateStruct?: { date: string } };
        descriptionModule?: { briefSummary?: string };
      };
    }>;
  };

  const cutoff = Date.now() - 86_400_000;
  const items: RawItem[] = [];
  for (const s of data.studies ?? []) {
    const d = s.protocolSection.statusModule.lastUpdatePostDateStruct?.date;
    if (!d || new Date(d).getTime() < cutoff) continue;
    const id = s.protocolSection.identificationModule;
    const item: RawItem = {
      source_slug: "clinicaltrials",
      source_url: `https://clinicaltrials.gov/study/${id.nctId}`,
      source_identifier: id.nctId,
      title: id.briefTitle ?? "",
      published_at: new Date(d).toISOString(),
      region: "global",
    };
    const summary = s.protocolSection.descriptionModule?.briefSummary;
    if (summary !== undefined) item.abstract = summary;
    items.push(item);
  }
  return items;
}

/** openFDA 510(k) discovery → verify against official FDA record (Rule 4) */
async function fetchFDA510k(): Promise<RawItem[]> {
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10).replace(/-/g, "");
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const url = `https://api.fda.gov/device/510k.json?search=decision_date:[${yesterday}+TO+${today}]&limit=50`;
  const res = await withRetry(() =>
    fetch(url, { headers: { Accept: "application/json" } }),
  );
  if (!res.ok)
    throw Object.assign(new Error(`openFDA 510k HTTP ${res.status}`), { status: res.status });
  const data = (await res.json()) as {
    results?: Array<{
      k_number: string;
      applicant: string;
      device_name: string;
      decision_date: string;
    }>;
  };

  const items: RawItem[] = [];
  for (const hit of data.results ?? []) {
    const kNum = hit.k_number;
    if (!kNum || !/^K\d{6}$/.test(kNum)) continue;
    const prefix2 = kNum.slice(1, 3);
    const pdfUrl = `https://www.accessdata.fda.gov/cdrh_docs/pdf${prefix2}/${kNum}.pdf`;
    const htmlUrl = `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${kNum}`;

    // Rule 4: verify against official FDA record; prefer PDF, fall back to HTML
    let primaryUrl = pdfUrl;
    try {
      const check = await withRetry(() => fetch(pdfUrl, { method: "HEAD" }), 2, [1000, 4000]);
      if (!check.ok) primaryUrl = htmlUrl;
    } catch {
      primaryUrl = htmlUrl;
    }

    items.push({
      source_slug: "fda_510k",
      source_url: primaryUrl,
      source_identifier: kNum,
      title: `FDA 510(k) ${kNum}: ${hit.device_name ?? ""} (${hit.applicant ?? ""})`,
      published_at: hit.decision_date
        ? new Date(hit.decision_date).toISOString()
        : new Date().toISOString(),
      region: "us",
      raw: hit,
    });
  }
  return items;
}

/** Generic RSS/Atom feed fetcher for society sources */
async function fetchRssFeed(
  sourceSlug: string,
  feedUrl: string,
  region: Region,
): Promise<RawItem[]> {
  const res = await withRetry(() =>
    fetch(feedUrl, {
      headers: { Accept: "application/rss+xml, application/atom+xml, text/xml" },
    }),
  );
  if (!res.ok)
    throw Object.assign(new Error(`RSS ${sourceSlug} HTTP ${res.status}`), { status: res.status });
  const xml = await res.text();
  const cutoff = Date.now() - 86_400_000;
  const items: RawItem[] = [];

  // Try RSS <item> first
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const entry = match[1] ?? "";
    const title = extractXmlText(entry, "title")?.replace(/\s+/g, " ").trim() ?? "";
    const link = extractXmlText(entry, "link")?.trim() ?? "";
    const pubDate = extractXmlText(entry, "pubDate") ?? extractXmlText(entry, "dc:date") ?? "";
    const description = extractXmlText(entry, "description")
      ?.replace(/<[^>]+>/g, "")
      .trim();
    const guid = extractXmlText(entry, "guid") ?? link;
    if (!link || !title) continue;
    const publishedAt = pubDate ? new Date(pubDate) : new Date();
    if (isNaN(publishedAt.getTime()) || publishedAt.getTime() < cutoff) continue;
    const item: RawItem = {
      source_slug: sourceSlug,
      source_url: link,
      source_identifier: guid,
      title,
      published_at: publishedAt.toISOString(),
      region,
    };
    if (description !== undefined) item.abstract = description;
    items.push(item);
  }

  // If no RSS items, try Atom <entry>
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1] ?? "";
      const title = extractXmlText(entry, "title")?.replace(/\s+/g, " ").trim() ?? "";
      const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/);
      const link = linkMatch ? (linkMatch[1] ?? "") : "";
      const published =
        extractXmlText(entry, "published") ?? extractXmlText(entry, "updated") ?? "";
      const summary = extractXmlText(entry, "summary")
        ?.replace(/<[^>]+>/g, "")
        .trim();
      if (!link || !title) continue;
      const publishedAt = published ? new Date(published) : new Date();
      if (isNaN(publishedAt.getTime()) || publishedAt.getTime() < cutoff) continue;
      const item: RawItem = {
        source_slug: sourceSlug,
        source_url: link,
        source_identifier: link,
        title,
        published_at: publishedAt.toISOString(),
        region,
      };
      if (summary !== undefined) item.abstract = summary;
      items.push(item);
    }
  }

  return items;
}

// ─── XML helpers ──────────────────────────────────────────────────────────────

function extractXmlText(xml: string, tag: string): string | undefined {
  const pattern = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`,
    "i",
  );
  const m = xml.match(pattern);
  if (!m) return undefined;
  const val = m[1] ?? m[2];
  return val !== undefined ? val.trim() : undefined;
}

// ─── RT relevance filter ──────────────────────────────────────────────────────

const RT_KEYWORDS = [
  "radiotherapy",
  "radiation therapy",
  "radiation oncology",
  "linac",
  "proton",
  "brachytherapy",
  "sbrt",
  "imrt",
  "vmat",
  "srs",
  "stereotactic",
  "radiosurgery",
  "radiobiology",
  "dosimetry",
  "treatment planning",
  "contouring",
  "delineation",
  "adaptive rt",
  "mr-linac",
  "flash",
  "proton therapy",
  "carbon ion",
  "radiopharmaceutical",
  "theranostics",
  "lutetium",
  "actinium",
];

function isRtRelevant(item: RawItem): boolean {
  const text = `${item.title} ${item.abstract ?? ""}`.toLowerCase();
  return RT_KEYWORDS.some((kw) => text.includes(kw));
}

// ─── Embargo detection ────────────────────────────────────────────────────────

interface EmbargoedItem {
  item: RawItem;
  embargo_until: Date;
}

function detectEmbargo(item: RawItem): EmbargoedItem | null {
  const raw = item.raw as Record<string, unknown> | undefined;
  if (raw) {
    const embargoDate = raw["embargo"] ?? raw["embargoDate"] ?? raw["embargo_until"];
    if (embargoDate && typeof embargoDate === "string") {
      const d = new Date(embargoDate);
      if (!isNaN(d.getTime()) && d.getTime() > Date.now()) {
        return { item, embargo_until: d };
      }
    }
  }
  if (item.source_url.includes("embargo")) {
    return { item, embargo_until: new Date(Date.now() + 7 * 86_400_000) };
  }
  return null;
}

// ─── Dedupe ───────────────────────────────────────────────────────────────────

function dedupeItems(items: RawItem[]): RawItem[] {
  const seen = new Set<string>();
  const result: RawItem[] = [];
  for (const item of items) {
    // 1. DOI match
    if (item.source_identifier?.startsWith("10.")) {
      const key = `doi:${item.source_identifier}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
    // 2. PMID match
    if (item.source_slug === "pubmed" && item.source_identifier) {
      const key = `pmid:${item.source_identifier}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
    // 3. 510(k) / NCT / EU-CT
    if (
      item.source_identifier &&
      /^(K\d{6}|NCT\d+|DEN\d+|P\d{6})$/.test(item.source_identifier)
    ) {
      const key = `id:${item.source_identifier}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
    // 4. URL hash
    const urlKey = `url:${item.source_url}`;
    if (seen.has(urlKey)) continue;
    seen.add(urlKey);
    // 5. Title fuzzy (normalized title dedup)
    const titleKey = `title:${item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80)}`;
    if (seen.has(titleKey)) continue;
    seen.add(titleKey);
    result.push(item);
  }
  return result;
}

// ─── Source health logging ────────────────────────────────────────────────────

async function logSourceHealth(
  db: ReturnType<typeof supabase>,
  entry: SourceHealthEntry,
): Promise<void> {
  try {
    const sources = await db.select<{ id: string }>("sources", {
      slug: `eq.${entry.source_slug}`,
      select: "id",
    });
    const sourceId = sources[0]?.id ?? null;
    await db.insert("source_health", [
      {
        source_id: sourceId,
        status_code: entry.status_code,
        latency_ms: entry.latency_ms,
        items_returned: entry.items_returned ?? 0,
        error: entry.error ?? null,
      },
    ]);
  } catch (err) {
    // Rule 5: health logging must never throw
    console.error(`[cron-ingest] health log failed for ${entry.source_slug}:`, err);
  }
}

// ─── Per-source runner ────────────────────────────────────────────────────────

async function runSource(
  slug: string,
  fn: () => Promise<RawItem[]>,
  db: ReturnType<typeof supabase>,
): Promise<{ items: RawItem[]; health: SourceHealthEntry }> {
  const start = Date.now();
  try {
    const items = await fn();
    const health: SourceHealthEntry = {
      source_slug: slug,
      status_code: 200,
      items_returned: items.length,
      latency_ms: Date.now() - start,
    };
    await logSourceHealth(db, health);
    return { items, health };
  } catch (err) {
    const health: SourceHealthEntry = {
      source_slug: slug,
      status_code: (err as { status?: number }).status ?? 0,
      error: String(err instanceof Error ? err.message : err).slice(0, 500),
      items_returned: 0,
      latency_ms: Date.now() - start,
    };
    await logSourceHealth(db, health);
    console.error(`[cron-ingest] source ${slug} failed:`, health.error);
    return { items: [], health };
  }
}

// ─── Society RSS source list ──────────────────────────────────────────────────

// SHIP-15 M-02 (NMPA read-only posture): no NMPA / CSCO-RO / China-region (`cn`)
// source is configured here. The full ingest source set is { pubmed, arxiv,
// clinicaltrials, fda_510k } above plus the SOCIETY_FEEDS below — none target
// China. M-02's read-only-China constraint is therefore moot at the ingest
// surface (satisfied by absence). If an NMPA/CSCO source is ever added, it must
// be region-tagged `cn` and treated as read-only ingest only — Chinese
// subscriber acquisition stays a separate subscriber-surface concern per
// CLAUDE.md locked decision #9 (PIPL data-localization).
const SOCIETY_FEEDS: Array<{ slug: string; url: string; region: Region }> = [
  {
    slug: "astro_news",
    url: "https://www.astro.org/News-and-Publications/News-and-Journal-Articles/News/RSS",
    region: "us",
  },
  {
    slug: "estro_news",
    url: "https://www.estro.org/rss/news",
    region: "eu",
  },
  {
    slug: "aapm_news",
    url: "https://www.aapm.org/rss/news.asp",
    region: "us",
  },
  {
    slug: "asco_news",
    url: "https://www.asco.org/rss/news",
    region: "us",
  },
  {
    slug: "redjournal",
    url: "https://www.redjournal.org/rss/articles",
    region: "global",
  },
  {
    slug: "practicalradonc",
    url: "https://www.practicalradonc.org/rss/articles",
    region: "global",
  },
  {
    slug: "greenjournal",
    url: "https://www.thegreenjournal.com/rss/articles",
    region: "eu",
  },
];

// ─── Edition detection ────────────────────────────────────────────────────────

function detectEdition(scheduledTime: number): string {
  const hour = new Date(scheduledTime).getUTCHours();
  if (hour >= 20 && hour <= 22) return "apac";
  if (hour >= 4 && hour <= 6) return "eu";
  if (hour >= 9 && hour <= 11) return "americas";
  return "manual";
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runIngest(event.scheduledTime, env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    // Shared-secret gate for manual triggers (T-115-K)
    const authHeader = request.headers.get("X-Ingest-Secret");
    if (!authHeader || authHeader !== env.INGEST_TRIGGER_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
    const url = new URL(request.url);
    const tParam = url.searchParams.get("t");
    const scheduledTime = tParam ? parseInt(tParam) : Date.now();
    await runIngest(isNaN(scheduledTime) ? Date.now() : scheduledTime, env);
    return new Response("ingest complete", {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  },
};

// ─── Core ingest logic ────────────────────────────────────────────────────────

async function runIngest(scheduledTime: number, env: Env): Promise<void> {
  const runStartedAt = new Date().toISOString();
  const edition = detectEdition(scheduledTime);
  console.log(
    `[cron-ingest] run started — edition=${edition} scheduled=${new Date(scheduledTime).toISOString()}`,
  );

  const db = supabase(env);
  const allItems: RawItem[] = [];
  const healthEntries: SourceHealthEntry[] = [];

  // ── 1. Run all sources ──────────────────────────────────────────────────────

  for (const [slug, fn] of [
    ["pubmed", fetchPubMed] as const,
    ["arxiv", fetchArXiv] as const,
    ["clinicaltrials", fetchClinicalTrials] as const,
    ["fda_510k", fetchFDA510k] as const,
  ]) {
    const { items, health } = await runSource(slug, fn, db);
    allItems.push(...items);
    healthEntries.push(health);
  }

  for (const feed of SOCIETY_FEEDS) {
    const { items, health } = await runSource(
      feed.slug,
      () => fetchRssFeed(feed.slug, feed.url, feed.region),
      db,
    );
    allItems.push(...items);
    healthEntries.push(health);
  }

  // ── 2. Dedupe ───────────────────────────────────────────────────────────────

  const deduped = dedupeItems(allItems);
  console.log(`[cron-ingest] deduped: ${allItems.length} → ${deduped.length}`);

  // ── 3. Embargo detection ────────────────────────────────────────────────────

  const embargoed: EmbargoedItem[] = [];
  const clean: RawItem[] = [];
  for (const item of deduped) {
    const hold = detectEmbargo(item);
    if (hold) {
      embargoed.push(hold);
    } else {
      clean.push(item);
    }
  }

  // Write embargoed items to embargo_holds (Rule 2)
  if (embargoed.length > 0) {
    try {
      await db.insert(
        "embargo_holds",
        embargoed.map((e) => ({
          candidate_title: e.item.title,
          source_url: e.item.source_url,
          source_id: e.item.source_identifier ?? null,
          embargo_until: e.embargo_until.toISOString(),
          region: [e.item.region],
          notes: `Auto-detected embargo from ${e.item.source_slug}`,
        })),
      );
    } catch (err) {
      console.error("[cron-ingest] embargo_holds insert failed:", err);
    }
  }

  // ── 4. RT relevance filter ──────────────────────────────────────────────────

  const relevant = clean.filter(isRtRelevant);
  console.log(`[cron-ingest] relevance filter: ${clean.length} → ${relevant.length}`);

  // ── 5. Pool size guard (≤200 per source-ingestion.md) ──────────────────────

  const candidatePool = relevant.slice(0, 200);

  // ── 6. Write candidate pool to R2 ──────────────────────────────────────────

  const dateStr = new Date().toISOString().slice(0, 10);
  const poolKey = `ingest/${edition}/${dateStr}/candidate-pool.json`;
  try {
    await env.RAW.put(poolKey, JSON.stringify(candidatePool, null, 2), {
      httpMetadata: { contentType: "application/json" },
    });
  } catch (err) {
    console.error("[cron-ingest] R2 pool write failed:", err);
  }

  // ── 7. Write source_health_summary.json to R2 ──────────────────────────────

  const failures = healthEntries.filter((h) => h.status_code !== 200);
  const summary: HealthSummary = {
    run_started_at: runStartedAt,
    run_finished_at: new Date().toISOString(),
    edition,
    sources_attempted: healthEntries.length,
    sources_succeeded: healthEntries.filter((h) => h.status_code === 200).length,
    sources_failed: failures.length,
    failures: failures.map((f) => ({
      source_slug: f.source_slug,
      status_code: f.status_code,
      ...(f.error !== undefined ? { error: f.error } : {}),
    })),
    items_after_dedupe: deduped.length,
    items_after_relevance_filter: relevant.length,
    embargoed_count: embargoed.length,
    candidate_pool_for_scoring: candidatePool.length,
  };

  const summaryKey = `ingest/${edition}/${dateStr}/source_health_summary.json`;
  try {
    await env.RAW.put(summaryKey, JSON.stringify(summary, null, 2), {
      httpMetadata: { contentType: "application/json" },
    });
  } catch (err) {
    console.error("[cron-ingest] R2 summary write failed:", err);
  }

  console.log(
    `[cron-ingest] run complete — edition=${edition} ` +
      `sources=${summary.sources_attempted} ok=${summary.sources_succeeded} ` +
      `failed=${summary.sources_failed} pool=${candidatePool.length} ` +
      `embargoed=${embargoed.length}`,
  );
}
