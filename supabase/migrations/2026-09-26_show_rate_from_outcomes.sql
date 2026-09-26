-- ===========================================================================
--  2026-09-26 — show rate from closer outcomes only
--
--  Rules (the dashboard follows the cards, nothing else):
--    Booked Call              -> booked, call still pending
--    Proposal Sent / Won      -> the call was held (showed)
--    No Show / Lost           -> the call did not happen (no-show)
--    Won                      -> purchase
--
--  Changes vs 2026-09-22:
--    * Lost no longer proves a held call. Lost without a Proposal Sent / Won
--      now counts as a no-show. (Lost AFTER a proposal is a lost deal.)
--    * showed_at (a manually sent "showed" stage) no longer counts as held.
--    * New column proposals_open: proposal sent, no Won / Lost yet.
--    * ab_report uses the same stage rules.
--
--  funnel_report gains a column, so it is dropped and recreated. Run the WHOLE
--  file in one go. No data is rewritten.
-- ===========================================================================

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
  proposals_open    bigint,
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
  x as (
    -- One flag per lead for "the call happened", so every count below agrees.
    -- Only Proposal Sent or Won proves a held call. Lost does NOT: it is
    -- treated as a no-show, the same as No Show.
    select
      ld.*,
      (ld.proposal_sent_at is not null or ld.won_at is not null) as held
    from public.leads ld
    where ld.opted_in_at >= p_from::timestamptz
      and ld.opted_in_at <  (p_to + 1)::timestamptz
      and (p_traffic = 'all' or ld.traffic_type = p_traffic)
  ),
  l as (
    select
      coalesce(x.ad_id, '(no ad id)') as ad_id,
      count(*)::bigint                   as leads,
      -- Stages are cumulative: reaching one means every earlier one was passed,
      -- whether or not a webhook ever stamped it.
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

      -- Held call = Proposal Sent or Won. Nothing else.
      count(*) filter (where x.held)::bigint as showed,
      count(*) filter (where x.held)::bigint as proposal_sent,

      -- Proposal out, no decision yet: not Won, not Lost.
      count(*) filter (where x.proposal_sent_at is not null
                         and x.won_at  is null
                         and x.lost_at is null)::bigint as proposals_open,

      -- Branches off "booked". A reschedule does not clear booked_at.
      count(x.rescheduled_at)::bigint    as rescheduled,

      -- No Show and Lost both mean the call did not happen. A lead who reached
      -- Proposal Sent / Won held a call, so a later Lost is a lost deal, not a
      -- no-show.
      --   no_shows       — missed at least one call (No Show stamp never clears)
      --   no_shows_final — no-show / lost and never held a call. The real cost.
      count(*) filter (where x.no_show_at is not null
                          or (x.lost_at is not null and not x.held))::bigint as no_shows,
      count(*) filter (where (x.no_show_at is not null or x.lost_at is not null)
                         and not x.held)::bigint as no_shows_final,

      count(x.won_at)::bigint            as won,
      coalesce(sum(x.revenue) filter (where x.won_at is not null), 0)::numeric as revenue
    from x
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
    coalesce(l.proposals_open, 0)             as proposals_open,
    coalesce(l.won, 0)                        as won,
    coalesce(l.revenue, 0)                    as revenue
  from s
  full outer join l on s.ad_id = l.ad_id
  order by coalesce(s.spend, 0) desc, coalesce(l.leads, 0) desc;
$$;

create or replace function public.ab_report(
  p_from       date,
  p_to         date,
  p_traffic    text default 'all',
  p_experiment text default null
)
returns table (
  experiment_id text,
  variant_id    text,
  views         bigint,
  leads         bigint,
  qualified     bigint,
  booked        bigint,
  showed        bigint,
  won           bigint,
  revenue       numeric
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
      count(*)::bigint as views
    from public.ab_views x
    where x.first_seen_at >= p_from::timestamptz
      and x.first_seen_at <  (p_to + 1)::timestamptz
      and (p_traffic = 'all' or x.traffic_type = p_traffic)
      and (p_experiment is null or x.experiment_id = p_experiment)
    group by 1, 2
  ),
  l as (
    select
      x.ab_experiment_id as experiment_id,
      x.ab_variant_id    as variant_id,
      count(*)::bigint              as leads,
      -- Cumulative, same rule as funnel_report.
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
      -- Held call = Proposal Sent or Won, same rule as funnel_report.
      count(*) filter (where x.proposal_sent_at is not null
                          or x.won_at           is not null)::bigint as showed,
      count(x.won_at)::bigint       as won,
      coalesce(sum(x.revenue) filter (where x.won_at is not null), 0)::numeric as revenue
    from public.leads x
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
