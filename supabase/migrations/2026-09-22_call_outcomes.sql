-- ===========================================================================
--  2026-09-22 — call outcomes: rescheduled, proposal sent, derived show rate
--
--  The Marketing Pipeline has three stages the schema never modelled:
--  Rescheduled, Proposal Sent, and an implicit "showed". Show rate read 0%
--  against 12 booked calls because nothing ever stamped showed_at.
--
--  The design decision here: `showed` is DERIVED, never dragged. A held call is
--  proven by reaching Proposal Sent, Lost or Won — Lost is only ever used after
--  a call in this pipeline — so closers move cards exactly as they do today and
--  no metric depends on anyone remembering an extra attendance step.
--
--  Two no-show numbers, deliberately:
--    no_shows        — missed at least one call (the stamp never clears)
--    no_shows_final  — missed and never made it to any call. The real cost.
--  A reschedule does not clear booked_at: the first booking is what the ad paid
--  for, and someone who misses then attends should not read as a lost booking.
--
--  funnel_report gains columns, which changes its return type, and Postgres
--  refuses create-or-replace across that — so it is dropped and recreated.
--  Run the WHOLE file in one go, or you will be left with no funnel_report.
--
--  No data is rewritten. Existing rows get nulls in the new columns and are
--  counted from whatever later stages they already reached.
-- ===========================================================================

alter table public.leads
  add column if not exists rescheduled_at   timestamptz;
alter table public.leads
  add column if not exists proposal_sent_at timestamptz;

create or replace function public.record_lead_stage(
  p_contact_id text,
  p_email      text,
  p_stage      text,
  p_at         timestamptz default now(),
  p_revenue    numeric default null,
  p_currency   text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from public.leads
  where (p_contact_id is not null and ghl_contact_id = p_contact_id)
     or (p_contact_id is null and p_email is not null and lower(email) = lower(p_email))
  order by opted_in_at asc
  limit 1;

  -- A lead that predates this table (or came in through another route) still
  -- gets a row, so the funnel report is never silently missing conversions.
  if v_id is null then
    insert into public.leads (ghl_contact_id, email, opted_in_at, traffic_type, last_stage)
    values (nullif(p_contact_id,''), nullif(p_email,''), p_at, 'organic', p_stage)
    returning id into v_id;
  end if;

  update public.leads set
    for_qualification_at = case when p_stage = 'for_qualification'
                                then coalesce(for_qualification_at, p_at)
                                else for_qualification_at end,
    qualified_at    = case when p_stage = 'qualified'    then coalesce(qualified_at, p_at)    else qualified_at end,
    booked_at       = case when p_stage = 'booked'       then coalesce(booked_at, p_at)       else booked_at end,
    rescheduled_at  = case when p_stage = 'rescheduled'  then coalesce(rescheduled_at, p_at)  else rescheduled_at end,
    showed_at       = case when p_stage = 'showed'       then coalesce(showed_at, p_at)       else showed_at end,
    proposal_sent_at = case when p_stage = 'proposal_sent'
                            then coalesce(proposal_sent_at, p_at)
                            else proposal_sent_at end,
    no_show_at      = case when p_stage = 'no_show'      then coalesce(no_show_at, p_at)      else no_show_at end,
    won_at          = case when p_stage = 'won'          then coalesce(won_at, p_at)          else won_at end,
    lost_at         = case when p_stage = 'lost'         then coalesce(lost_at, p_at)         else lost_at end,
    disqualified_at = case when p_stage = 'disqualified' then coalesce(disqualified_at, p_at) else disqualified_at end,
    revenue         = case when p_stage = 'won' and p_revenue is not null then p_revenue else revenue end,
    currency        = coalesce(nullif(p_currency,''), currency),
    last_stage      = p_stage,
    updated_at      = now()
  where id = v_id;

  return v_id;
end;
$$;

drop function if exists public.funnel_report(date, date, text);

create or replace function public.funnel_report(
  p_from    date,
  p_to      date,
  p_traffic text default 'paid'
)
returns table (
  ad_id         text,
  ad_name       text,
  adset_name    text,
  campaign_name text,
  spend         numeric,
  impressions   bigint,
  clicks        bigint,
  leads             bigint,
  for_qualification bigint,
  qualified         bigint,
  booked            bigint,
  rescheduled       bigint,
  showed            bigint,
  no_shows          bigint,
  no_shows_final    bigint,
  proposal_sent     bigint,
  won               bigint,
  revenue           numeric
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
  l as (
    select
      coalesce(x.ad_id, '(no ad id)') as ad_id,
      count(*)::bigint                   as leads,
      -- Stages are cumulative: reaching one means every earlier one was passed,
      -- whether or not a webhook ever stamped it.
      --
      -- `showed` is DERIVED, never dragged. A held call is proven by reaching
      -- Proposal Sent, Lost or Won — Lost is only used after a call in this
      -- pipeline — so closers move a card exactly as they already do and no
      -- number depends on anyone remembering an extra attendance step.
      count(*) filter (where x.for_qualification_at is not null
                          or x.qualified_at     is not null
                          or x.booked_at        is not null
                          or x.rescheduled_at   is not null
                          or x.no_show_at       is not null
                          or x.showed_at        is not null
                          or x.proposal_sent_at is not null
                          or x.lost_at          is not null
                          or x.won_at           is not null)::bigint as for_qualification,
      count(*) filter (where x.qualified_at     is not null
                          or x.booked_at        is not null
                          or x.rescheduled_at   is not null
                          or x.no_show_at       is not null
                          or x.showed_at        is not null
                          or x.proposal_sent_at is not null
                          or x.lost_at          is not null
                          or x.won_at           is not null)::bigint as qualified,
      count(*) filter (where x.booked_at        is not null
                          or x.rescheduled_at   is not null
                          or x.no_show_at       is not null
                          or x.showed_at        is not null
                          or x.proposal_sent_at is not null
                          or x.lost_at          is not null
                          or x.won_at           is not null)::bigint as booked,
      count(*) filter (where x.showed_at        is not null
                          or x.proposal_sent_at is not null
                          or x.lost_at          is not null
                          or x.won_at           is not null)::bigint as showed,
      count(*) filter (where x.proposal_sent_at is not null
                          or x.won_at           is not null)::bigint as proposal_sent,

      -- Branches off "booked", not deeper levels — never rolled up into one.
      -- A reschedule does not clear booked_at: the first booking is the one
      -- the ad paid for.
      count(x.rescheduled_at)::bigint    as rescheduled,

      -- no_shows counts anyone who missed AT LEAST ONE call (coalesce means the
      -- stamp never clears, so a recovered no-show keeps it). no_shows_final is
      -- the honest "missed and never made it to a call" — use that one when you
      -- want to know what no-shows actually cost.
      count(x.no_show_at)::bigint        as no_shows,
      count(*) filter (where x.no_show_at is not null
                         and x.showed_at is null
                         and x.proposal_sent_at is null
                         and x.lost_at is null
                         and x.won_at is null)::bigint as no_shows_final,

      count(x.won_at)::bigint            as won,
      coalesce(sum(x.revenue) filter (where x.won_at is not null), 0)::numeric as revenue
    from public.leads x
    where x.opted_in_at >= p_from::timestamptz
      and x.opted_in_at <  (p_to + 1)::timestamptz
      and (p_traffic = 'all' or x.traffic_type = p_traffic)
    group by 1
  )
  select
    coalesce(s.ad_id, l.ad_id)                as ad_id,
    coalesce(s.ad_name, l.ad_id)              as ad_name,
    s.adset_name,
    s.campaign_name,
    coalesce(s.spend, 0)                      as spend,
    coalesce(s.impressions, 0)                as impressions,
    coalesce(s.clicks, 0)                     as clicks,
    coalesce(l.leads, 0)                      as leads,
    coalesce(l.for_qualification, 0)          as for_qualification,
    coalesce(l.qualified, 0)                  as qualified,
    coalesce(l.booked, 0)                     as booked,
    coalesce(l.rescheduled, 0)                as rescheduled,
    coalesce(l.showed, 0)                     as showed,
    coalesce(l.no_shows, 0)                   as no_shows,
    coalesce(l.no_shows_final, 0)             as no_shows_final,
    coalesce(l.proposal_sent, 0)              as proposal_sent,
    coalesce(l.won, 0)                        as won,
    coalesce(l.revenue, 0)                    as revenue
  from s
  full outer join l on s.ad_id = l.ad_id
  order by coalesce(s.spend, 0) desc, coalesce(l.leads, 0) desc;
$$;
