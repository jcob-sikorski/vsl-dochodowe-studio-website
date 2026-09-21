-- ===========================================================================
--  Do the ad_ids from the landing URL match the ad_ids from the Meta API?
--
--  funnel_report FULL OUTER JOINs ad_spend to leads on ad_id. If the two
--  sources spell the same ad differently — a stray space, a truncation, a
--  different ID family — the join produces TWO rows per ad: one with spend and
--  no leads, one with leads and no spend. Every cost-per-lead figure on the
--  By-ad table is then wrong, and nothing errors.
--
--  Read-only.
-- ===========================================================================

with l as (
  select distinct ad_id, length(ad_id) as len
  from public.leads
  where ad_id is not null and traffic_type = 'paid'
),
s as (
  select distinct ad_id, length(ad_id) as len
  from public.ad_spend
  where ad_id is not null
)
select
  coalesce(l.ad_id, s.ad_id)                    as ad_id,
  coalesce(l.len, s.len)                        as id_length,
  case
    when l.ad_id is not null and s.ad_id is not null then 'JOINS — leads + spend'
    when l.ad_id is not null                         then 'leads only — no spend row'
    else                                                  'spend only — no leads'
  end                                           as status
from l
full outer join s on l.ad_id = s.ad_id
order by status, ad_id;
