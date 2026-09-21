-- ===========================================================================
--  Ad-level attribution coverage — do leads carry the IDs the By-ad table needs?
--
--  funnel_report joins ad_spend to leads on ad_id. A lead with a null ad_id can
--  never appear against an ad, however good Meta's own matching is, because the
--  join has nothing to match on. This is independent of Meta entirely: the IDs
--  come from the landing URL, so it is deterministic.
--
--  If ad_id coverage is ~0%, add this to URL parameters at AD level in Meta:
--    ad_id={{ad.id}}&adset_id={{adset.id}}&campaign_id={{campaign.id}}
--
--  Read-only.
-- ===========================================================================

-- 1. coverage, paid traffic, last 30 days
select
  'paid leads, last 30 days'                                            as scope,
  count(*)                                                              as leads,
  count(ad_id)                                                          as with_ad_id,
  count(adset_id)                                                       as with_adset_id,
  count(campaign_id)                                                    as with_campaign_id,
  round(100.0 * count(ad_id) / nullif(count(*), 0), 1)                  as ad_id_pct,
  count(*) filter (where fbc is not null)                               as with_fbc,
  count(*) filter (where fbclid is not null)                            as with_fbclid
from public.leads
where traffic_type = 'paid'
  and opted_in_at >= now() - interval '30 days'

union all

select
  'paid leads, all time',
  count(*),
  count(ad_id),
  count(adset_id),
  count(campaign_id),
  round(100.0 * count(ad_id) / nullif(count(*), 0), 1),
  count(*) filter (where fbc is not null),
  count(*) filter (where fbclid is not null)
from public.leads
where traffic_type = 'paid';


-- 2. What the By-ad table will actually group by, last 30 days.
--    A single fat '(no ad id)' row is the symptom this query exists to catch.
select
  coalesce(ad_id, '(no ad id)')           as ad_id,
  count(*)                                as leads,
  min(opted_in_at)::date                  as first_seen,
  max(opted_in_at)::date                  as last_seen,
  -- the names ARE arriving even when the IDs are not; useful for eyeballing
  max(utm_content)                        as sample_utm_content,
  max(utm_term)                           as sample_utm_term
from public.leads
where traffic_type = 'paid'
  and opted_in_at >= now() - interval '30 days'
group by 1
order by leads desc;
