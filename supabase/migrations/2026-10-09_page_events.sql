-- ===========================================================================
--  2026-10-09 — page engagement: where visitors stop, what they tap
--
--  The same events Clarity receives (lib/track.ts) are also written here, so
--  the dashboard can show them next to the headline test and the funnel.
--  Clarity keeps the pictures (heatmaps, recordings); this keeps the numbers.
--
--  page_events holds ONE ROW PER VISITOR PER EVENT, not one per occurrence:
--  "did this visitor ever reach the qualification section" is the question,
--  and a reload must never inflate it. `hits` counts repeats (taps on the same
--  button), `value` keeps the latest value (e.g. the slider's months).
--
--  engagement_report() reads events only for visitors who are in the headline
--  test's denominator (ab_views_scored), so the same date range, the same
--  paid/organic split and the same Meta ad-review exclusion apply to every
--  number. Run the WHOLE file in one go.
-- ===========================================================================

create table if not exists public.page_events (
  id            bigint generated always as identity primary key,
  experiment_id text not null,
  visitor_id    text not null,
  page          text not null check (page in ('landing', 'confirm')),
  event         text not null check (event ~ '^[a-z0-9_-]{1,64}$'),
  value         text check (value is null or value ~ '^[a-z0-9_-]{1,32}$'),
  viewport      text check (viewport is null or viewport in ('mobile', 'desktop')),
  page_version  text,
  hits          integer not null default 1,
  first_at      timestamptz not null default now(),
  last_at       timestamptz not null default now(),

  -- This constraint IS the de-duplication.
  unique (experiment_id, visitor_id, page, event)
);

create index if not exists page_events_visitor_idx on public.page_events (experiment_id, visitor_id);
create index if not exists page_events_first_at_idx on public.page_events (first_at desc);

alter table public.page_events enable row level security;
revoke all on public.page_events from anon, authenticated;
grant select, insert, update on public.page_events to service_role;

-- ---------------------------------------------------------------------------
-- record_page_events — called by /api/track with one batch per flush.
--
-- p_batch: { experiment_id, visitor_id, page, viewport, page_version,
--            events: [{ event, value? }, …] }
--
-- Identity (experiment, visitor) comes from cookies read on the server, never
-- from the browser's payload. Duplicates inside one batch are folded first —
-- ON CONFLICT cannot touch the same row twice in one statement.
-- ---------------------------------------------------------------------------
create or replace function public.record_page_events(p_batch jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with raw as (
    select
      e->>'event' as event,
      nullif(e->>'value', '') as value,
      ord
    from jsonb_array_elements(coalesce(p_batch->'events', '[]'::jsonb)) with ordinality as t(e, ord)
    where ord <= 50
      and (e->>'event') ~ '^[a-z0-9_-]{1,64}$'
  ),
  folded as (
    select
      event,
      count(*)::integer as hits,
      -- the latest value in the batch wins
      (array_agg(value order by ord desc) filter (where value is not null))[1] as value
    from raw
    group by event
  ),
  ins as (
    insert into public.page_events as p (
      experiment_id, visitor_id, page, event, value, viewport, page_version, hits
    )
    select
      p_batch->>'experiment_id',
      p_batch->>'visitor_id',
      p_batch->>'page',
      f.event,
      case when f.value ~ '^[a-z0-9_-]{1,32}$' then f.value end,
      case when p_batch->>'viewport' in ('mobile', 'desktop') then p_batch->>'viewport' end,
      left(p_batch->>'page_version', 40),
      f.hits
    from folded f
    on conflict (experiment_id, visitor_id, page, event) do update set
      hits     = p.hits + excluded.hits,
      last_at  = now(),
      value    = coalesce(excluded.value, p.value),
      viewport = coalesce(p.viewport, excluded.viewport)
    returning 1
  )
  select count(*) into v_count from ins;

  return v_count;
end;
$$;

revoke execute on function public.record_page_events(jsonb) from public, anon, authenticated;
grant execute on function public.record_page_events(jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- engagement_report — per variant, per page, per event
--
-- Cohort = headline-test visitors first seen in [p_from, p_to], minus Meta
-- ad-review bursts, filtered by traffic type. Their events are counted
-- whenever they happened (a visitor who lands on the 30th and reads on the
-- 1st still counts), the same cohort logic as ab_report.
--
-- p_device 'mobile' | 'desktop' | 'all' — taken from the visitor's landing
-- pageview, so a visitor is one device for every number.
-- ---------------------------------------------------------------------------
create or replace function public.engagement_report(
  p_from       date,
  p_to         date,
  p_traffic    text default 'all',
  p_experiment text default null,
  p_device     text default 'all'
)
returns table (
  variant_id text,
  page       text,
  event      text,
  visitors   bigint,
  hits       bigint,
  avg_value  numeric
)
language sql
stable
set search_path = public
as $$
  with cohort as (
    select v.experiment_id, v.visitor_id, v.variant_id
    from public.ab_views_scored v
    where v.first_seen_at >= p_from::timestamptz
      and v.first_seen_at <  (p_to + 1)::timestamptz
      and not v.is_review_burst
      and (p_traffic = 'all' or v.traffic_type = p_traffic)
      and (p_experiment is null or v.experiment_id = p_experiment)
  ),
  device as (
    select d.experiment_id, d.visitor_id, d.viewport
    from public.page_events d
    where d.page = 'landing' and d.event = 'pageview_landing'
  )
  select
    c.variant_id,
    e.page,
    e.event,
    count(distinct e.visitor_id)::bigint as visitors,
    sum(e.hits)::bigint                  as hits,
    avg(case when e.value ~ '^[0-9]{1,6}$' then e.value::numeric end) as avg_value
  from cohort c
  join public.page_events e
    on e.experiment_id = c.experiment_id
   and e.visitor_id    = c.visitor_id
  left join device dv
    on dv.experiment_id = c.experiment_id
   and dv.visitor_id    = c.visitor_id
  where p_device = 'all' or dv.viewport = p_device
  group by c.variant_id, e.page, e.event;
$$;

revoke execute on function public.engagement_report(date, date, text, text, text) from public, anon, authenticated;
grant execute on function public.engagement_report(date, date, text, text, text) to service_role;
