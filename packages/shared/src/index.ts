export type Region = "us" | "eu" | "uk" | "ca" | "jp" | "au" | "cn" | "global";

export interface RawItem {
  source_slug: string;
  source_url: string;
  source_identifier?: string;
  title: string;
  published_at: string;
  region: Region;
  abstract?: string;
  raw?: unknown;
}

export interface SourceHealthEntry {
  source_slug: string;
  status_code: number;
  error?: string;
  items_returned?: number;
  latency_ms: number;
}
