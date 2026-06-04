#!/usr/bin/env node
// =====================================================================
// seed-to-db.mjs — load Docs/content/catalog/seed.ndjson into public.articles.
//
// Emits a single idempotent INSERT … SELECT FROM jsonb_to_recordset, with the
// catalog wrapped in a dollar-quoted ($seed$…$seed$) JSON literal so no
// apostrophe/quote escaping is needed. ON CONFLICT (slug) DO NOTHING → safe to
// re-run. Rows land as status='draft' (Rule 1: real primary_source_url only,
// enforced by the articles_primary_source_required CHECK).
//
// --emit  : write the {"query": SQL} payload to tools/content/.seed-payload.json
//           and the raw SQL to tools/content/seed-insert.sql (review artifacts).
// (apply is done by the caller via the Supabase Management API using the payload.)
// =====================================================================
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const NDJSON = resolve(__dirname, "../../Docs/content/catalog/seed.ndjson");
const SQL_OUT = resolve(__dirname, "seed-insert.sql");
const PAYLOAD_OUT = resolve(__dirname, ".seed-payload.json");

const rows = readFileSync(NDJSON, "utf8").trim().split("\n").map((l) => JSON.parse(l));
if (!rows.length) { console.error("no rows in seed.ndjson"); process.exit(1); }

// Guard: dollar-quote token must not appear in the JSON.
const json = JSON.stringify(rows);
if (json.includes("$seed$")) { console.error("token collision: $seed$ in data"); process.exit(1); }

const SQL = `insert into public.articles (
  slug, archetype, tier, category, subcategory, content_type, source_language,
  title, standfirst, body_md, romas_insight, romas_insight_labeled, status,
  primary_source_url, primary_source_type,
  region, audience_tags, modality_tags, disease_site_tags,
  composite_score, signal_scores, embargoed, embargo_until
)
select
  x.slug, x.archetype, x.tier, x.category, x.subcategory, x.content_type, x.source_language,
  x.title, x.standfirst, x.body_md, x.romas_insight, x.romas_insight_labeled, x.status,
  x.primary_source_url, x.primary_source_type,
  coalesce(x.region, '{}'::text[]), coalesce(x.audience_tags, '{}'::text[]),
  coalesce(x.modality_tags, '{}'::text[]), coalesce(x.disease_site_tags, '{}'::text[]),
  x.composite_score, x.signal_scores, coalesce(x.embargoed, false), x.embargo_until
from jsonb_to_recordset($seed$${json}$seed$::jsonb) as x(
  slug text, archetype text, tier text, category text, subcategory text, content_type text, source_language text,
  title text, standfirst text, body_md text, romas_insight text, romas_insight_labeled boolean, status text,
  primary_source_url text, primary_source_type text,
  region text[], audience_tags text[], modality_tags text[], disease_site_tags text[],
  composite_score numeric, signal_scores jsonb, embargoed boolean, embargo_until timestamptz
)
on conflict (slug) do nothing;`;

writeFileSync(SQL_OUT, SQL + "\n", "utf8");
writeFileSync(PAYLOAD_OUT, JSON.stringify({ query: SQL }), "utf8");
console.log(`Built INSERT for ${rows.length} rows.`);
console.log(`  SQL     → ${SQL_OUT}`);
console.log(`  payload → ${PAYLOAD_OUT}`);
