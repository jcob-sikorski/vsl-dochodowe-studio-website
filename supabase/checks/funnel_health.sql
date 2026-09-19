-- ===========================================================================
--  Funnel health check — safe, read-only. Run any time in the Supabase editor.
--
--  Verifies the schema, the two report functions, and whether the stage
--  webhooks are actually landing. Every row is one assertion; read the
--  `status` column. "info" rows are context, not pass/fail.
-- ===========================================================================

select 1 as n,
  'schema · leads.for_qualification_at' as check,
  coalesce((select data_type from information_schema.columns
             where table_schema='public' and table_name='leads'
               and column_name='for_qualification_at'), 'MISSING') as value,
  case when exists (select 1 from information_schema.columns
                     where table_schema='public' and table_name='leads'
                       and column_name='for_qualification_at')
       then 'OK' else 'FAIL — migration not applied' end as status

union all
select 2,
  'schema · funnel_report exposes for_qualification',
  case when exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                     where n.nspname='public' and p.proname='funnel_report')
       then 'function present' else 'FUNCTION MISSING' end,
  case when coalesce((select pg_get_function_result(p.oid) from pg_proc p
                        join pg_namespace n on n.oid=p.pronamespace
                       where n.nspname='public' and p.proname='funnel_report' limit 1),'')
            like '%for_qualification%'
       then 'OK' else 'FAIL — drop/create did not run' end

union all
select 3,
  'schema · record_lead_stage handles for_qualification',
  'function body',
  case when coalesce((select prosrc from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                       where n.nspname='public' and p.proname='record_lead_stage' limit 1),'')
            like '%for_qualification%'
       then 'OK' else 'FAIL — old version still installed' end

union all
select 4,
  'data · stage timestamps stamped (all time)',
  format('for_qual=%s qualified=%s booked=%s showed=%s no_show=%s won=%s',
         count(*) filter (where for_qualification_at is not null),
         count(*) filter (where qualified_at is not null),
         count(*) filter (where booked_at is not null),
         count(*) filter (where showed_at is not null),
         count(*) filter (where no_show_at is not null),
         count(*) filter (where won_at is not null)),
  'info'
from public.leads

union all
select 5,
  'data · for_qualification webhook landing?',
  count(*)::text || ' leads stamped',
  case when count(*) > 0 then 'OK — webhook is firing'
       else 'PENDING — no for_qualification event received yet' end
from public.leads where for_qualification_at is not null

union all
select 6,
  'data · paid leads, last 30 days',
  count(*)::text,
  'info'
from public.leads
where traffic_type = 'paid' and opted_in_at >= now() - interval '30 days'

union all
select 7,
  'data · won leads with no revenue',
  count(*)::text,
  case when count(*) = 0 then 'OK' else 'WARN — Purchase value not parsed' end
from public.leads where won_at is not null and revenue is null

union all
select 8,
  'report · funnel totals (paid, 30d)',
  format('leads=%s for_qual=%s qualified=%s booked=%s showed=%s won=%s',
         sum(leads), sum(for_qualification), sum(qualified),
         sum(booked), sum(showed), sum(won)),
  case when sum(for_qualification) >= sum(qualified)
        and sum(qualified)         >= sum(booked)
        and sum(booked)            >= sum(showed)
        and sum(showed)            >= sum(won)
       then 'OK — counts descend'
       else 'FAIL — funnel is not monotonic' end
from public.funnel_report(current_date - 29, current_date, 'paid')

union all
select 9,
  'report · spend joined (paid, 30d)',
  format('spend=%s revenue=%s ads_with_spend=%s',
         round(sum(spend)), round(sum(revenue)),
         count(*) filter (where spend > 0)),
  'info'
from public.funnel_report(current_date - 29, current_date, 'paid')

order by n;
