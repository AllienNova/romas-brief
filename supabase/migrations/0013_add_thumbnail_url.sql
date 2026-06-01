-- 0013_add_thumbnail_url.sql · ROMAS Wire
-- SSOT decision 22 (2026-05-31): every launch article ships a thumbnail
-- (The Imaging Wire scannability parity). Reader cards + next/image already
-- consume `articles.thumbnail_url`; this adds the column. Nullable — cards
-- degrade gracefully (text-only) when null. Public-readable: covered by the
-- existing public_read_published RLS policy (no policy change needed).

alter table articles add column if not exists thumbnail_url text;

comment on column articles.thumbnail_url is
  'Public CDN/R2 URL of the article hero/thumbnail image (SSOT decision 22). Optional; reader cards fall back to text-only when null.';
