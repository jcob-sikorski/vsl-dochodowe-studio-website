-- ===========================================================================
--  fbc integrity — is the click ID inside `fbc` the SAME string as `fbclid`?
--
--  Meta's error is literal: "Do not modify the fbclid value retrieved from the
--  _fbc cookie or fbclid query parameter." So there are exactly two ways to
--  trip it, and this separates them:
--
--    1. VALUE drift  — the 4th segment of fbc differs from the stored fbclid
--                      (truncation, re-encoding, a "+" decoded to a space, or a
--                      round-trip through a GHL custom field that mangled it).
--    2. TIME drift   — the 3rd segment is the submit time rather than the click
--                      time, which is the bug fixed on Sep 16.
--
--  fbc format: fb.<subdomain_index>.<click_time_ms>.<fbclid>
--  Read-only. Run in the Supabase SQL editor.
-- ===========================================================================

with parsed as (
  select
    opted_in_at,
    traffic_type,
    fbclid,
    fbc,
    split_part(fbc, '.', 2)                                   as subdomain_index,
    nullif(split_part(fbc, '.', 3), '')                       as click_ms,
    regexp_replace(fbc, '^fb\.[^.]*\.[^.]*\.', '')            as fbc_clickid
  from public.leads
  where fbc is not null and fbc <> ''
)
select
  opted_in_at at time zone 'Europe/Warsaw'                     as opted_in,
  traffic_type,
  subdomain_index,
  case
    when fbclid is null or fbclid = '' then 'no fbclid stored'
    when fbc_clickid = fbclid          then 'MATCH'
    else 'MISMATCH — value modified'
  end                                                          as clickid_check,
  case
    when click_ms is null then 'no timestamp'
    when abs(extract(epoch from (
           to_timestamp(click_ms::bigint / 1000) - opted_in_at))) < 5
      then 'SYNTHESISED at submit time'
    else 'real click time'
  end                                                          as time_check,
  to_timestamp(click_ms::bigint / 1000) at time zone 'Europe/Warsaw' as fbc_click_time,
  left(fbc_clickid, 24) || '…'                                 as fbc_clickid_head,
  left(coalesce(fbclid, ''), 24) || '…'                        as fbclid_head
from parsed
order by opted_in_at desc
limit 60;
