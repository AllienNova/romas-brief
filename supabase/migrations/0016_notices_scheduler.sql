-- =========================================================================
-- 0016_notices_scheduler.sql · NoticeBoard v2 — NB-5 scheduler (spec §10)
--
-- notices_run_scheduler() flips notice lifecycle states on a cron cadence:
--   scheduled → published   when publish_at ≤ now
--   published → expired     when expires_at ≤ now
-- and keeps the one-live-featured invariant (index one_live_featured, 0015)
-- intact across the transition, inside pg_advisory_xact_lock(
-- hashtext('notices_featured_publish')) — the lock 0015 reserves for exactly
-- this race. The notice-scheduler Cloudflare cron worker calls this every
-- 1–5 min, then revalidates the board cache tag.
-- =========================================================================

create or replace function notices_run_scheduler()
  returns table (promoted integer, expired integer)
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_promoted integer := 0;
  v_expired  integer := 0;
  v_winner   uuid;
begin
  -- Serialize scheduler runs + the featured READ-COMMITTED race (0015 review M-03).
  perform pg_advisory_xact_lock(hashtext('notices_featured_publish'));

  -- 1. Expire due published notices first (this can free the featured slot).
  with ex as (
    update notices
       set status = 'expired'
     where status = 'published'
       and expires_at is not null
       and expires_at <= now()
    returning 1
  )
  select count(*) into v_expired from ex;

  -- 2. Resolve the single featured slot among DUE scheduled rows. Only one may
  --    go live featured; the latest-scheduled wins, the rest demote to 'high',
  --    and any currently-published featured yields the lead to the incoming one.
  select id into v_winner
    from notices
   where status = 'scheduled'
     and publish_at <= now()
     and priority = 'featured'
   order by publish_at desc, id desc
   limit 1;

  if v_winner is not null then
    update notices
       set priority = 'high'
     where status = 'published'
       and priority = 'featured';

    update notices
       set priority = 'high'
     where status = 'scheduled'
       and publish_at <= now()
       and priority = 'featured'
       and id <> v_winner;
  end if;

  -- 3. Promote all due scheduled rows. The featured invariant now holds, so the
  --    one_live_featured unique index cannot be violated by this update.
  with up as (
    update notices
       set status = 'published'
     where status = 'scheduled'
       and publish_at <= now()
    returning 1
  )
  select count(*) into v_promoted from up;

  promoted := v_promoted;
  expired  := v_expired;
  return next;
end;
$$;

comment on function notices_run_scheduler() is
  'NB-5 scheduler (§10). Inside pg_advisory_xact_lock(notices_featured_publish): expires due published notices, resolves the single live-featured (latest due-scheduled featured wins; losers + any published featured demote to high — honors one_live_featured), then promotes all due scheduled→published. Returns (promoted, expired). Called every 1–5 min by the notice-scheduler cron worker, which then revalidates the board tag.';

-- Only the service role (the cron worker) may run the scheduler — never anon.
revoke all on function notices_run_scheduler() from public;
grant execute on function notices_run_scheduler() to service_role;
