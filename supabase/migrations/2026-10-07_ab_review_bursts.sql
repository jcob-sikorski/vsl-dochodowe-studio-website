-- ===========================================================================
--  2026-10-07 — keep Meta's ad-review visits out of the headline test
--
--  Every time ads are published or edited, Meta's review loads the landing
--  page hundreds of times within an hour or two. Those loads run JavaScript,
--  so the view beacon recorded them as visitors: on 30 Sep and 3 Oct about
--  1,330 "visits" arrived against a few dozen real ad clicks, none of them
--  came back and none opted in. They were spread evenly across variants, so
--  the ranking held, but every opt-in rate read about half its real value.
--
--  Real traffic is ~3 visitors an hour (95th percentile: 10). A review burst
--  is an hour with 20+ visitors, not one of whom returned or opted in. That
--  rule lives in ONE place — the ab_views_scored view — and both ab_report
--  and the dashboard's health check read it. Nothing is deleted: change the
--  thresholds here and history is re-scored on the next page load.
--
--  ab_report gains an `excluded_views` column, which changes its return
--  type, so it is dropped and recreated. Run the WHOLE file in one go.
-- ===========================================================================

create or replace view public.ab_views_scored
with (security_invoker = true) as
with hourly as (
  select
    v.experiment_id,
    date_trunc('hour', v.first_seen_at)          as hr,
    count(distinct v.id)                         as visitors,
    count(distinct v.id) filter (where v.views > 1) as returning_visitors,
    count(distinct l.id)                         as opt_ins
  from public.ab_views v
  left join public.leads l
    on l.ab_experiment_id = v.experiment_id
   and l.ab_visitor_id    = v.visitor_id
  group by 1, 2
)
select
  v.*,
  (h.visitors >= 20 and h.returning_visitors = 0 and h.opt_ins = 0) as is_review_burst
from public.ab_views v
join hourly h
  on h.experiment_id = v.experiment_id
 and h.hr            = date_trunc('hour', v.first_seen_at);

revoke all on public.ab_views_scored from anon, authenticated;
grant select on public.ab_views_scored to service_role;

drop function if exists public.ab_report(date, date, text, text);

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

-- Server-only, like everything else here. Recreating the function reset its
-- grants to Supabase's defaults, which include the public anon role.
revoke execute on function public.ab_report(date, date, text, text) from public, anon, authenticated;
grant execute on function public.ab_report(date, date, text, text) to service_role;
