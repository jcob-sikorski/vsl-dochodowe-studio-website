-- ===========================================================================
--  2026-10-07 — show rate from the real call history, not first-stamp columns
--
--  The Marketing Pipeline is a loop, not a line:
--
--    For Qualification → (Qualified) → Booked Call → No Show
--                                                  → Lost
--                                                  → Proposal Sent → Won / Lost
--                                                  → Won
--    …and a lead can go BACK to For Qualification from Booked Call, No Show
--    or Proposal Sent, get rebooked, and have another call.
--
--  `leads` keeps only the FIRST time each stage was reached, so it cannot see
--  a second booking, a second call, or a card sent back before its call. And
--  the old report treated Lost as a no-show, although closers move held calls
--  that went nowhere to Lost.
--
--  This migration:
--    1. lead_stage_events — every stage move, append-only. Backfilled from the
--       existing stamps (first occurrences only; history before today can't
--       show loops).
--    2. record_lead_event — what /api/conversion calls now. Stamps the stage
--       exactly like record_lead_stage, logs the event, and says whether this
--       is the lead's FIRST time at the stage, so Meta conversions are not
--       re-sent when a lead loops back through Qualified or Booked Call.
--       record_lead_stage stays as a wrapper, so the running app keeps working.
--    3. lead_calls() — replays each lead's events into calls:
--         Booked Call → No Show                      missed
--         Booked Call → Lost / Proposal Sent / Won   held
--         Booked Call → For Qualification / Qualified returned (call never
--                                                    happened; not in show rate)
--         still in Booked Call                       pending
--         No Show → Proposal Sent / Won              held (they talked later)
--         Proposal Sent → Won / Lost                 a decision, not a new call
--         Lost before any booking                    a drop-off, not a call
--    4. funnel_report / ab_report count bookings and shows from lead_calls().
--       Show rate = held calls ÷ (held + missed calls).
--    5. Server-only: anon/authenticated lose EXECUTE on every function here.
--
--  Run the WHOLE file in one go in the Supabase SQL editor.
-- ===========================================================================

-- 1. event log ---------------------------------------------------------------
create table if not exists public.lead_stage_events (
  id          bigint generated always as identity primary key,
  lead_id     uuid        not null references public.leads (id) on delete cascade,
  stage       text        not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  source      text        not null default 'webhook'   -- 'webhook' | 'backfill'
);

create index if not exists lead_stage_events_lead_idx
  on public.lead_stage_events (lead_id, occurred_at, id);

alter table public.lead_stage_events enable row level security;
revoke all on public.lead_stage_events from anon, authenticated;
grant select, insert on public.lead_stage_events to service_role;

-- Backfill once from the stamps we have.
insert into public.lead_stage_events (lead_id, stage, occurred_at, source)
select l.id, s.stage, s.at, 'backfill'
from public.leads l
cross join lateral (values
  (1, 'for_qualification', l.for_qualification_at),
  (2, 'qualified',         l.qualified_at),
  (3, 'booked',            l.booked_at),
  (4, 'rescheduled',       l.rescheduled_at),
  (5, 'no_show',           l.no_show_at),
  (6, 'showed',            l.showed_at),
  (7, 'proposal_sent',     l.proposal_sent_at),
  (8, 'lost',              l.lost_at),
  (9, 'disqualified',      l.disqualified_at),
  (10, 'won',              l.won_at)
) as s(ord, stage, at)
where s.at is not null
  and not exists (select 1 from public.lead_stage_events e where e.source = 'backfill')
order by l.id, s.at, s.ord;

-- 2. record_lead_event --------------------------------------------------------
create or replace function public.record_lead_event(
  p_contact_id text,
  p_email      text,
  p_stage      text,
  p_at         timestamptz default now(),
  p_revenue    numeric default null,
  p_currency   text default null
)
returns table (lead_id uuid, first_time boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id    uuid;
  v_first boolean;
begin
  select l.id into v_id
  from public.leads l
  where (p_contact_id is not null and l.ghl_contact_id = p_contact_id)
     or (p_contact_id is null and p_email is not null and lower(l.email) = lower(p_email))
  order by l.opted_in_at asc
  limit 1;

  -- A lead that predates this table (or came in another way) still gets a row.
  if v_id is null then
    insert into public.leads (ghl_contact_id, email, opted_in_at, traffic_type, last_stage)
    values (nullif(p_contact_id,''), nullif(p_email,''), p_at, 'organic', p_stage)
    returning id into v_id;
  end if;

  v_first := not exists (
    select 1 from public.lead_stage_events e where e.lead_id = v_id and e.stage = p_stage
  );

  insert into public.lead_stage_events (lead_id, stage, occurred_at)
  values (v_id, p_stage, coalesce(p_at, now()));

  -- First-occurrence stamps, unchanged: they still feed the cohort funnel.
  update public.leads set
    for_qualification_at = case when p_stage = 'for_qualification' then coalesce(for_qualification_at, p_at) else for_qualification_at end,
    qualified_at     = case when p_stage = 'qualified'     then coalesce(qualified_at, p_at)     else qualified_at end,
    booked_at        = case when p_stage = 'booked'        then coalesce(booked_at, p_at)        else booked_at end,
    rescheduled_at   = case when p_stage = 'rescheduled'   then coalesce(rescheduled_at, p_at)   else rescheduled_at end,
    showed_at        = case when p_stage = 'showed'        then coalesce(showed_at, p_at)        else showed_at end,
    proposal_sent_at = case when p_stage = 'proposal_sent' then coalesce(proposal_sent_at, p_at) else proposal_sent_at end,
    no_show_at       = case when p_stage = 'no_show'       then coalesce(no_show_at, p_at)       else no_show_at end,
    won_at           = case when p_stage = 'won'           then coalesce(won_at, p_at)           else won_at end,
    lost_at          = case when p_stage = 'lost'          then coalesce(lost_at, p_at)          else lost_at end,
    disqualified_at  = case when p_stage = 'disqualified'  then coalesce(disqualified_at, p_at)  else disqualified_at end,
    revenue          = case when p_stage = 'won' and p_revenue is not null then p_revenue else revenue end,
    currency         = coalesce(nullif(p_currency,''), currency),
    last_stage       = p_stage,
    updated_at       = now()
  where id = v_id;

  lead_id    := v_id;
  first_time := v_first;
  return next;
end;
$$;

-- The running app calls this; it now goes through the event log too.
create or replace function public.record_lead_stage(
  p_contact_id text,
  p_email      text,
  p_stage      text,
  p_at         timestamptz default now(),
  p_revenue    numeric default null,
  p_currency   text default null
)
returns uuid
language sql
security definer
set search_path = public
as $$
  select r.lead_id from public.record_lead_event(p_contact_id, p_email, p_stage, p_at, p_revenue, p_currency) r;
$$;

-- 3. lead_calls ---------------------------------------------------------------
create or replace function public.lead_calls()
returns table (
  lead_id    uuid,
  call_no    integer,
  booked_at  timestamptz,
  outcome    text,          -- 'held' | 'no_show' | 'returned' | 'pending'
  outcome_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r      record;
  v_lead uuid;
  v_open timestamptz;          -- booking time of the call in progress, if any
  v_n    integer := 0;
  v_last text;                 -- outcome of the most recent call: held | no_show
begin
  for r in
    select e.lead_id as lid, e.stage as st, e.occurred_at as at
    from public.lead_stage_events e
    order by e.lead_id, e.occurred_at, e.id
  loop
    if v_lead is distinct from r.lid then
      if v_open is not null then
        lead_id := v_lead; call_no := v_n; booked_at := v_open; outcome := 'pending'; outcome_at := null;
        return next;
      end if;
      v_lead := r.lid; v_open := null; v_n := 0; v_last := null;
    end if;

    if r.st in ('booked', 'rescheduled') then
      -- A repeat webhook for the same booking changes nothing.
      if v_open is null then
        v_open := r.at; v_n := v_n + 1;
      end if;

    elsif r.st = 'no_show' then
      if v_open is not null then
        lead_id := v_lead; call_no := v_n; booked_at := v_open; outcome := 'no_show'; outcome_at := r.at;
        return next;
        v_open := null; v_last := 'no_show';
      elsif v_last is distinct from 'no_show' then
        -- Straight to No Show without a Booked Call event: still a missed call.
        v_n := v_n + 1;
        lead_id := v_lead; call_no := v_n; booked_at := r.at; outcome := 'no_show'; outcome_at := r.at;
        return next;
        v_last := 'no_show';
      end if;

    elsif r.st in ('proposal_sent', 'won', 'lost', 'showed', 'disqualified') then
      if v_open is not null then
        lead_id := v_lead; call_no := v_n; booked_at := v_open; outcome := 'held'; outcome_at := r.at;
        return next;
        v_open := null; v_last := 'held';
      elsif v_last = 'no_show' and r.st in ('proposal_sent', 'won', 'showed') then
        -- No Show → Proposal Sent / Won: they talked after all.
        v_n := v_n + 1;
        lead_id := v_lead; call_no := v_n; booked_at := r.at; outcome := 'held'; outcome_at := r.at;
        return next;
        v_last := 'held';
      end if;
      -- Otherwise a decision on an earlier call, or a drop-off before booking.

    elsif r.st in ('for_qualification', 'qualified') then
      if v_open is not null then
        lead_id := v_lead; call_no := v_n; booked_at := v_open; outcome := 'returned'; outcome_at := r.at;
        return next;
        v_open := null;
      end if;
      v_last := null;
    end if;
  end loop;

  if v_open is not null then
    lead_id := v_lead; call_no := v_n; booked_at := v_open; outcome := 'pending'; outcome_at := null;
    return next;
  end if;
end;
$$;

-- 4a. funnel_report -----------------------------------------------------------
drop function if exists public.funnel_report(date, date, text);

create or replace function public.funnel_report(
  p_from    date,
  p_to      date,
  p_traffic text default 'paid'
)
returns table (
  ad_id             text,
  ad_name           text,
  adset_name        text,
  campaign_name     text,
  spend             numeric,
  impressions       bigint,
  clicks            bigint,
  leads             bigint,
  for_qualification bigint,
  qualified         bigint,
  booked            bigint,   -- leads with at least one call booked
  rescheduled       bigint,   -- leads booked more than once
  showed            bigint,   -- leads with at least one held call
  no_shows          bigint,   -- leads that missed at least one call
  no_shows_final    bigint,   -- leads whose every resolved call was missed
  proposal_sent     bigint,
  proposals_open    bigint,   -- card sitting in Proposal Sent right now
  won               bigint,
  revenue           numeric,
  calls             bigint,   -- every booking
  calls_held        bigint,
  calls_no_show     bigint,
  calls_pending     bigint,
  calls_returned    bigint,   -- sent back to For Qualification before the call
  calls_stale       bigint    -- pending 7+ days after booking: card probably not moved
)
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select
      a.ad_id,
      max(a.ad_name)       as ad_name,
      max(a.adset_name)    as adset_name,
      max(a.campaign_name) as campaign_name,
      sum(a.spend)::numeric      as spend,
      sum(a.impressions)::bigint as impressions,
      sum(a.clicks)::bigint      as clicks
    from public.ad_spend a
    where a.date >= p_from and a.date <= p_to
    group by a.ad_id
  ),
  x as (
    select ld.*
    from public.leads ld
    where ld.opted_in_at >= p_from::timestamptz
      and ld.opted_in_at <  (p_to + 1)::timestamptz
      and (p_traffic = 'all' or ld.traffic_type = p_traffic)
  ),
  c as (
    select
      lc.lead_id,
      count(*)                                          as n,
      count(*) filter (where lc.outcome = 'held')       as held,
      count(*) filter (where lc.outcome = 'no_show')    as no_show,
      count(*) filter (where lc.outcome = 'pending')    as pending,
      count(*) filter (where lc.outcome = 'returned')   as returned,
      count(*) filter (where lc.outcome = 'pending'
                         and lc.booked_at < now() - interval '7 days') as stale
    from public.lead_calls() lc
    where lc.lead_id in (select x.id from x)
    group by 1
  ),
  l as (
    select
      coalesce(x.ad_id, '(no ad id)') as ad_id,
      count(*)::bigint as leads,
      -- Every lead in the pipeline passes through For Qualification.
      count(*) filter (where x.for_qualification_at is not null
                          or x.qualified_at is not null
                          or c.n > 0
                          or x.lost_at is not null)::bigint                    as for_qualification,
      count(*) filter (where x.qualified_at is not null or c.n > 0)::bigint   as qualified,
      count(*) filter (where c.n > 0)::bigint                                  as booked,
      count(*) filter (where c.n > 1)::bigint                                  as rescheduled,
      count(*) filter (where c.held > 0)::bigint                               as showed,
      count(*) filter (where c.no_show > 0)::bigint                            as no_shows,
      count(*) filter (where c.no_show > 0 and c.held = 0 and c.pending = 0)::bigint as no_shows_final,
      count(x.proposal_sent_at)::bigint                                        as proposal_sent,
      count(*) filter (where x.last_stage = 'proposal_sent')::bigint           as proposals_open,
      count(x.won_at)::bigint                                                  as won,
      coalesce(sum(x.revenue) filter (where x.won_at is not null), 0)::numeric as revenue,
      coalesce(sum(c.n), 0)::bigint        as calls,
      coalesce(sum(c.held), 0)::bigint     as calls_held,
      coalesce(sum(c.no_show), 0)::bigint  as calls_no_show,
      coalesce(sum(c.pending), 0)::bigint  as calls_pending,
      coalesce(sum(c.returned), 0)::bigint as calls_returned,
      coalesce(sum(c.stale), 0)::bigint    as calls_stale
    from x
    left join c on c.lead_id = x.id
    group by 1
  )
  select
    coalesce(s.ad_id, l.ad_id)       as ad_id,
    coalesce(s.ad_name, l.ad_id)     as ad_name,
    s.adset_name,
    s.campaign_name,
    coalesce(s.spend, 0)             as spend,
    coalesce(s.impressions, 0)       as impressions,
    coalesce(s.clicks, 0)            as clicks,
    coalesce(l.leads, 0)             as leads,
    coalesce(l.for_qualification, 0) as for_qualification,
    coalesce(l.qualified, 0)         as qualified,
    coalesce(l.booked, 0)            as booked,
    coalesce(l.rescheduled, 0)       as rescheduled,
    coalesce(l.showed, 0)            as showed,
    coalesce(l.no_shows, 0)          as no_shows,
    coalesce(l.no_shows_final, 0)    as no_shows_final,
    coalesce(l.proposal_sent, 0)     as proposal_sent,
    coalesce(l.proposals_open, 0)    as proposals_open,
    coalesce(l.won, 0)               as won,
    coalesce(l.revenue, 0)           as revenue,
    coalesce(l.calls, 0)             as calls,
    coalesce(l.calls_held, 0)        as calls_held,
    coalesce(l.calls_no_show, 0)     as calls_no_show,
    coalesce(l.calls_pending, 0)     as calls_pending,
    coalesce(l.calls_returned, 0)    as calls_returned,
    coalesce(l.calls_stale, 0)       as calls_stale
  from s
  full outer join l on s.ad_id = l.ad_id
  order by coalesce(s.spend, 0) desc, coalesce(l.leads, 0) desc;
$$;

-- 4b. ab_report: same booking/show rules -------------------------------------
create or replace function public.ab_report(
  p_from       date,
  p_to         date,
  p_traffic    text default 'all',
  p_experiment text default null
)
returns table (
  experiment_id  text,
  variant_id     text,
  views          bigint,
  excluded_views bigint,
  leads          bigint,
  qualified      bigint,
  booked         bigint,
  showed         bigint,
  won            bigint,
  revenue        numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with v as (
    select
      x.experiment_id,
      x.variant_id,
      count(*) filter (where not x.is_review_burst)::bigint as views,
      count(*) filter (where x.is_review_burst)::bigint     as excluded_views
    from public.ab_views_scored x
    where x.first_seen_at >= p_from::timestamptz
      and x.first_seen_at <  (p_to + 1)::timestamptz
      and (p_traffic = 'all' or x.traffic_type = p_traffic)
      and (p_experiment is null or x.experiment_id = p_experiment)
    group by 1, 2
  ),
  c as (
    select lc.lead_id, count(*) as n, count(*) filter (where lc.outcome = 'held') as held
    from public.lead_calls() lc
    group by 1
  ),
  l as (
    select
      x.ab_experiment_id as experiment_id,
      x.ab_variant_id    as variant_id,
      count(*)::bigint                                                         as leads,
      count(*) filter (where x.qualified_at is not null or c.n > 0)::bigint   as qualified,
      count(*) filter (where c.n > 0)::bigint                                  as booked,
      count(*) filter (where c.held > 0)::bigint                               as showed,
      count(x.won_at)::bigint                                                  as won,
      coalesce(sum(x.revenue) filter (where x.won_at is not null), 0)::numeric as revenue
    from public.leads x
    left join c on c.lead_id = x.id
    where x.opted_in_at >= p_from::timestamptz
      and x.opted_in_at <  (p_to + 1)::timestamptz
      and (p_traffic = 'all' or x.traffic_type = p_traffic)
      and x.ab_variant_id is not null
      and (p_experiment is null or x.ab_experiment_id = p_experiment)
    group by 1, 2
  )
  select
    coalesce(v.experiment_id, l.experiment_id) as experiment_id,
    coalesce(v.variant_id, l.variant_id)       as variant_id,
    coalesce(v.views, 0)                       as views,
    coalesce(v.excluded_views, 0)              as excluded_views,
    coalesce(l.leads, 0)                       as leads,
    coalesce(l.qualified, 0)                   as qualified,
    coalesce(l.booked, 0)                      as booked,
    coalesce(l.showed, 0)                      as showed,
    coalesce(l.won, 0)                         as won,
    coalesce(l.revenue, 0)                     as revenue
  from v
  full outer join l
    on v.experiment_id = l.experiment_id
   and v.variant_id    = l.variant_id
  order by 1, 2;
$$;

-- 5. server-only --------------------------------------------------------------
do $$
declare f text;
begin
  foreach f in array array[
    'public.upsert_lead(jsonb)',
    'public.record_ab_view(jsonb)',
    'public.record_lead_stage(text, text, text, timestamptz, numeric, text)',
    'public.record_lead_event(text, text, text, timestamptz, numeric, text)',
    'public.lead_calls()',
    'public.funnel_report(date, date, text)',
    'public.ab_report(date, date, text, text)'
  ] loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
