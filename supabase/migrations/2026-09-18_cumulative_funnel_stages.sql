-- ===========================================================================
--  2026-09-18 — cumulative funnel stages
--
--  GHL stamps only the stage a card was moved to, so a lead that booked a
--  call had booked_at set and qualified_at left null. Counting the columns
--  literally showed "0 qualified" next to "2 booked calls", and the cost-per
--  tiles derived from them disagreed with each other.
--
--  Both report functions now roll stages up: booked implies qualified,
--  showed implies booked, won implies showed. no_shows stays literal — it is
--  a branch off "booked", not a deeper level.
--
--  Definitions only; no data is rewritten, so this is safe to re-run and it
--  fixes historical numbers as well as new ones.
--  Run in the Supabase SQL editor.
-- ===========================================================================

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
  leads         bigint,
  qualified     bigint,
  booked        bigint,
  showed        bigint,
  no_shows      bigint,
  won           bigint,
  revenue       numeric
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
      -- whether or not a webhook ever stamped it. Counting the columns
      -- literally made "qualified" read 0 next to 2 booked calls.
      count(*) filter (where x.qualified_at is not null
                          or x.booked_at   is not null
                          or x.showed_at   is not null
                          or x.no_show_at  is not null
                          or x.won_at      is not null)::bigint as qualified,
      count(*) filter (where x.booked_at   is not null
                          or x.showed_at   is not null
                          or x.no_show_at  is not null
                          or x.won_at      is not null)::bigint as booked,
      count(*) filter (where x.showed_at   is not null
                          or x.won_at      is not null)::bigint as showed,
      -- A branch, not a level: never rolled up from anything.
      count(x.no_show_at)::bigint        as no_shows,
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
    coalesce(l.qualified, 0)                  as qualified,
    coalesce(l.booked, 0)                     as booked,
    coalesce(l.showed, 0)                     as showed,
    coalesce(l.no_shows, 0)                   as no_shows,
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
      count(*) filter (where x.qualified_at is not null
                          or x.booked_at   is not null
                          or x.showed_at   is not null
                          or x.no_show_at  is not null
                          or x.won_at      is not null)::bigint as qualified,
      count(*) filter (where x.booked_at   is not null
                          or x.showed_at   is not null
                          or x.no_show_at  is not null
                          or x.won_at      is not null)::bigint as booked,
      count(*) filter (where x.showed_at   is not null
                          or x.won_at      is not null)::bigint as showed,
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
