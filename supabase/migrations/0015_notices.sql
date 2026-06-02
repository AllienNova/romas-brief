-- 0015_notices.sql · ROMAS Wire · NoticeBoard v2 (NB-2)
-- Spec: Docs/specs/ROMAS-NoticeBoard-Spec-v2-Production.md §5.
-- The spec assumes Prisma; ROMAS is Supabase, so this is the SQL migration
-- with the §5 CHECK constraints VERBATIM (the DB layer of the sponsor
-- firewall) plus RLS (deny-by-default, anon reads published-only).
-- RUNTIME (gated): applying this is a DB op (Kimal/CMS).

-- ── Enums ───────────────────────────────────────────────────────────────
create type notice_type     as enum ('announcement','news','event','partner','advertise','system','trial','conference');
create type notice_priority as enum ('featured','high','normal','low');
create type notice_status   as enum ('draft','pending_review','scheduled','published','expired','archived');
create type slot_kind       as enum ('homepage_partner','conference_partner','newsletter_companion','workflow_message','vendor_event');
create type notice_event_kind as enum ('impression','click');

-- ── Sponsors ────────────────────────────────────────────────────────────
create table sponsors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_email text,
  created_at    timestamptz not null default now()
);

-- ── Notices ─────────────────────────────────────────────────────────────
create table notices (
  id               uuid primary key default gen_random_uuid(),
  type             notice_type not null,
  title            text not null check (char_length(title)  between 1 and 90),
  summary          text not null check (char_length(summary) between 1 and 220),
  cta_label        text check (cta_label is null or char_length(cta_label) <= 24),
  cta_url          text,
  date_label       text,
  starts_at        timestamptz,
  ends_at          timestamptz,
  timezone         text,                 -- IANA, required when type in (event, conference)
  publish_at       timestamptz not null,
  expires_at       timestamptz,
  priority         notice_priority not null default 'normal',
  status           notice_status   not null default 'draft',
  pinned           boolean not null default false,
  audience         text[],
  region           text[],
  conference_key   text,
  is_sponsored     boolean not null default false,
  sponsor_id       uuid references sponsors(id),
  sponsor_disclosure text,
  created_by       uuid not null,
  approved_by      uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- FIREWALL ENFORCED AT THE DB LEVEL (§5):
  constraint sponsored_requires_partner_type
    check (is_sponsored = false or type = 'partner'),
  constraint sponsored_requires_disclosure
    check (is_sponsored = false or (sponsor_id is not null and sponsor_disclosure is not null)),
  constraint partner_is_sponsored
    check (type <> 'partner' or is_sponsored = true),
  constraint sponsored_cannot_be_featured
    check (is_sponsored = false or priority <> 'featured'),
  constraint event_requires_timezone
    check (type not in ('event','conference') or timezone is not null)
);

-- Only one featured notice may be live at a time:
create unique index one_live_featured
  on notices ((true))
  where priority = 'featured' and status = 'published';

create index notices_board_lookup on notices (status, publish_at, expires_at, priority);
create index notices_conference   on notices (conference_key) where conference_key is not null;

-- updated_at maintenance (reuse the shared trigger fn from 0009).
create trigger notices_set_updated_at
  before update on notices
  for each row execute function set_updated_at();

-- ── Inventory slots (sellable positions) ────────────────────────────────
create table inventory_slots (
  id          uuid primary key default gen_random_uuid(),
  kind        slot_kind not null,
  notice_id   uuid references notices(id),  -- null = unsold/empty
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ── Telemetry (no PII; §12) ─────────────────────────────────────────────
create table notice_events (
  id          bigserial primary key,
  notice_id   uuid not null references notices(id),
  kind        notice_event_kind not null,
  occurred_at timestamptz not null default now(),
  surface     text                          -- 'homepage' | 'archive' | 'conference'
);
create index notice_events_rollup on notice_events (notice_id, kind, occurred_at);

-- =========================================================================
-- RLS — deny-by-default; anon reads published-only (mirrors public_read_published)
-- Writes have NO anon/authenticated policy → only the service-role (CMS) can
-- write. contact_email is never exposed to anon (sponsors base table denied;
-- the public board joins the column-limited sponsor_public view).
-- =========================================================================
alter table notices         enable row level security;
alter table sponsors        enable row level security;
alter table inventory_slots enable row level security;
alter table notice_events   enable row level security;

create policy notices_public_read_published on notices
  for select to anon, authenticated
  using (
    status = 'published'
    and publish_at <= now()
    and (expires_at is null or expires_at > now())
  );

-- Inventory slots are not sensitive; the board engine needs them to resolve state.
create policy inventory_slots_public_read on inventory_slots
  for select to anon, authenticated
  using (true);

-- Telemetry: anon may INSERT events (no PII), but never read them.
create policy notice_events_public_insert on notice_events
  for insert to anon, authenticated
  with check (true);

-- Column-safe public sponsor exposure (id + name only; contact_email stays private).
create view sponsor_public as
  select id, name from sponsors;
grant select on sponsor_public to anon, authenticated;

comment on table notices is
  'NoticeBoard v2 (spec §5). Sponsor firewall enforced by CHECK constraints — sponsored rows MUST be type=partner, carry sponsor_id+disclosure, and can never be featured. RLS exposes published, in-window rows to anon.';
