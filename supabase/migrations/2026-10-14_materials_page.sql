-- ===========================================================================
-- /materialy: allow the pre-call materials page in page_events.
--
-- lib/track.ts now reports events from /materialy as page = 'materials'.
-- Until this runs, those inserts are rejected by the check constraint
-- (the API swallows the error and still returns 204, so nothing breaks —
-- the events are just lost).
-- ===========================================================================

alter table public.page_events drop constraint if exists page_events_page_check;

alter table public.page_events
  add constraint page_events_page_check
  check (page in ('landing', 'confirm', 'materials'));
