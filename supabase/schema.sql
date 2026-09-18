-- ===========================================================================
--  Funnel analytics schema
--
--  Run once in Supabase → SQL Editor. Safe to re-run: everything is
--  CREATE ... IF NOT EXISTS / CREATE OR REPLACE.
--
--  Two tables:
--    leads      — one row per person, one timestamp column per funnel stage
--    ad_spend   — one row per ad per day, pulled from the Meta Marketing API
--
--  Funnel stages are cumulative when counted: booked implies qualified,
--  showed implies booked, won implies showed. GHL only ever stamps the stage
--  it moved a card to, so the earlier columns stay null on the row.
--
--  Everything else (show rate, cost per qualified lead, cost per show, cost
--  per purchase, ROAS) is a join between them. Nothing is precomputed, so a
--  changed definition never requires a backfill.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- identity (ghl_contact_id is the stable key: GHL already dedupes by email)
  ghl_contact_id    text unique,
  email             text,
  phone             text,
  full_name         text,

  -- attribution: IDs first — names get edited, IDs never change
  ad_id             text,
  adset_id          text,
  campaign_id       text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  utm_term          text,
  utm_id            text,
  fbclid            text,
  fbc               text,
  fbp               text,
  landing_url       text,
  referrer          text,
  traffic_type      text not null default 'organic',  -- 'paid' | 'organic'
  meta_event_id     text,

  -- funnel stages. First occurrence wins; a stage is never un-stamped.
  opted_in_at       timestamptz not null default now(),
  qualified_at      timestamptz,
  booked_at         timestamptz,
  showed_at         timestamptz,
  no_show_at        timestamptz,
  won_at            timestamptz,
  lost_at           timestamptz,
  disqualified_at   timestamptz,

  last_stage        text not null default 'opted_in',
  revenue           numeric(12,2),
  currency          text default 'PLN',

  -- split test the lead opted in under (see lib/ab.ts)
  ab_experiment_id  text,
  ab_variant_id     text,
  ab_visitor_id     text
);

-- Additive, for projects created before the split test existed.
alter table public.leads add column if not exists ab_experiment_id text;
alter table public.leads add column if not exists ab_variant_id    text;
alter table public.leads add column if not exists ab_visitor_id    text;

create index if not exists leads_opted_in_at_idx  on public.leads (opted_in_at desc);
create index if not exists leads_ad_id_idx        on public.leads (ad_id);
create index if not exists leads_campaign_id_idx  on public.leads (campaign_id);
create index if not exists leads_traffic_type_idx on public.leads (traffic_type);
create index if not exists leads_email_idx        on public.leads (lower(email));
create index if not exists leads_ab_variant_idx   on public.leads (ab_experiment_id, ab_variant_id);

-- ---------------------------------------------------------------------------
-- ad_spend
-- ---------------------------------------------------------------------------
create table if not exists public.ad_spend (
  date           date   not null,
  ad_id          text   not null,
  adset_id       text,
  campaign_id    text,
  ad_name        text,
  adset_name     text,
  campaign_name  text,
  spend          numeric(12,2) not null default 0,
  impressions    bigint not null default 0,
  clicks         bigint not null default 0,
  currency       text   default 'PLN',
  synced_at      timestamptz not null default now(),
  primary key (date, ad_id)
);

create index if not exists ad_spend_date_idx        on public.ad_spend (date desc);
create index if not exists ad_spend_campaign_id_idx on public.ad_spend (campaign_id);

-- ---------------------------------------------------------------------------
-- RLS: on, with no policies. The service-role key (server only) bypasses RLS;
-- the anon key can therefore read nothing. Lead PII never reaches a browser.
-- ---------------------------------------------------------------------------
alter table public.leads    enable row level security;
alter table public.ad_spend enable row level security;

-- ---------------------------------------------------------------------------
-- upsert_lead — called by /api/register
--
-- Repeat opt-ins refresh attribution (last touch wins) but never overwrite a
-- stored value with null, and never reset opted_in_at.
-- ---------------------------------------------------------------------------
create or replace function public.upsert_lead(p_lead jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.leads as l (
    ghl_contact_id, email, phone, full_name,
    ad_id, adset_id, campaign_id,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id,
    fbclid, fbc, fbp, landing_url, referrer,
    traffic_type, meta_event_id,
    ab_experiment_id, ab_variant_id, ab_visitor_id
  )
  values (
    nullif(p_lead->>'ghl_contact_id',''), nullif(p_lead->>'email',''),
    nullif(p_lead->>'phone',''), nullif(p_lead->>'full_name',''),
    nullif(p_lead->>'ad_id',''), nullif(p_lead->>'adset_id',''), nullif(p_lead->>'campaign_id',''),
    nullif(p_lead->>'utm_source',''), nullif(p_lead->>'utm_medium',''), nullif(p_lead->>'utm_campaign',''),
    nullif(p_lead->>'utm_content',''), nullif(p_lead->>'utm_term',''), nullif(p_lead->>'utm_id',''),
    nullif(p_lead->>'fbclid',''), nullif(p_lead->>'fbc',''), nullif(p_lead->>'fbp',''),
    nullif(p_lead->>'landing_url',''), nullif(p_lead->>'referrer',''),
    coalesce(nullif(p_lead->>'traffic_type',''), 'organic'),
    nullif(p_lead->>'meta_event_id',''),
    nullif(p_lead->>'ab_experiment_id',''), nullif(p_lead->>'ab_variant_id',''),
    nullif(p_lead->>'ab_visitor_id','')
  )
  on conflict (ghl_contact_id) do update set
    email         = coalesce(excluded.email, l.email),
    phone         = coalesce(excluded.phone, l.phone),
    full_name     = coalesce(excluded.full_name, l.full_name),
    ad_id         = coalesce(excluded.ad_id, l.ad_id),
    adset_id      = coalesce(excluded.adset_id, l.adset_id),
    campaign_id   = coalesce(excluded.campaign_id, l.campaign_id),
    utm_source    = coalesce(excluded.utm_source, l.utm_source),
    utm_medium    = coalesce(excluded.utm_medium, l.utm_medium),
    utm_campaign  = coalesce(excluded.utm_campaign, l.utm_campaign),
    utm_content   = coalesce(excluded.utm_content, l.utm_content),
    utm_term      = coalesce(excluded.utm_term, l.utm_term),
    utm_id        = coalesce(excluded.utm_id, l.utm_id),
    fbclid        = coalesce(excluded.fbclid, l.fbclid),
    fbc           = coalesce(excluded.fbc, l.fbc),
    fbp           = coalesce(excluded.fbp, l.fbp),
    landing_url   = coalesce(excluded.landing_url, l.landing_url),
    referrer      = coalesce(excluded.referrer, l.referrer),
    -- once paid, always paid: a later direct visit must not erase the ad click
    traffic_type  = case when l.traffic_type = 'paid' then 'paid' else excluded.traffic_type end,
    meta_event_id = coalesce(excluded.meta_event_id, l.meta_event_id),
    -- First assignment sticks: a second opt-in (or a later visit under a new
    -- test) must not re-credit an existing lead to a different headline.
    ab_experiment_id = coalesce(l.ab_experiment_id, excluded.ab_experiment_id),
    ab_variant_id    = coalesce(l.ab_variant_id, excluded.ab_variant_id),
    ab_visitor_id    = coalesce(l.ab_visitor_id, excluded.ab_visitor_id),
    updated_at    = now()
  returning l.id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- record_lead_stage — called by /api/conversion
--
-- Idempotent by construction: coalesce() means the FIRST time a lead reaches a
-- stage is the time that sticks, so a replayed webhook or a card dragged back
-- and forth can never move a timestamp.
-- ---------------------------------------------------------------------------
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
    qualified_at    = case when p_stage = 'qualified'    then coalesce(qualified_at, p_at)    else qualified_at end,
    booked_at       = case when p_stage = 'booked'       then coalesce(booked_at, p_at)       else booked_at end,
    showed_at       = case when p_stage = 'showed'       then coalesce(showed_at, p_at)       else showed_at end,
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

-- ---------------------------------------------------------------------------
-- funnel_report — everything the dashboard reads, in one call
--
-- FULL OUTER JOIN on purpose: an ad with spend and zero leads must still
-- appear. Those rows are the ones costing you money for nothing, and an inner
-- join would hide exactly the thing you most need to see.
-- ---------------------------------------------------------------------------
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

-- ===========================================================================
--  A/B testing — headline split test
--
--  Two numbers decide a headline: how many people SAW it, and how many of
--  them opted in. Leads already live in public.leads with ab_variant_id
--  stamped on them; this section adds the denominator.
--
--  ab_views holds one row per browser per experiment, not one per pageview.
--  A rate whose denominator counts reloads is not an opt-in rate, and a
--  visitor who opens the page five times before filling in the form would
--  otherwise look like four failures and one success.
-- ===========================================================================

create table if not exists public.ab_views (
  id              uuid primary key default gen_random_uuid(),
  experiment_id   text not null,
  variant_id      text not null,
  visitor_id      text not null,

  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  views           integer not null default 1,

  traffic_type    text not null default 'organic',   -- 'paid' | 'organic'
  ad_id           text,
  adset_id        text,
  campaign_id     text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  landing_url     text,
  referrer        text,
  user_agent      text,

  -- One row per browser per experiment. This constraint IS the de-duplication.
  unique (experiment_id, visitor_id)
);

create index if not exists ab_views_first_seen_idx on public.ab_views (first_seen_at desc);
create index if not exists ab_views_variant_idx    on public.ab_views (experiment_id, variant_id);
create index if not exists ab_views_traffic_idx    on public.ab_views (traffic_type);

alter table public.ab_views enable row level security;

-- ---------------------------------------------------------------------------
-- record_ab_view — called by /api/ab/view
--
-- The variant is never rewritten on conflict: whichever headline a browser saw
-- first is the one it is counted under for the life of the experiment, even if
-- cookies are edited or the config changes underneath them.
-- ---------------------------------------------------------------------------
create or replace function public.record_ab_view(p_view jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.ab_views as v (
    experiment_id, variant_id, visitor_id,
    traffic_type, ad_id, adset_id, campaign_id,
    utm_source, utm_medium, utm_campaign, utm_content,
    landing_url, referrer, user_agent
  )
  values (
    nullif(p_view->>'experiment_id',''),
    nullif(p_view->>'variant_id',''),
    nullif(p_view->>'visitor_id',''),
    coalesce(nullif(p_view->>'traffic_type',''), 'organic'),
    nullif(p_view->>'ad_id',''), nullif(p_view->>'adset_id',''), nullif(p_view->>'campaign_id',''),
    nullif(p_view->>'utm_source',''), nullif(p_view->>'utm_medium',''),
    nullif(p_view->>'utm_campaign',''), nullif(p_view->>'utm_content',''),
    nullif(p_view->>'landing_url',''), nullif(p_view->>'referrer',''),
    nullif(p_view->>'user_agent','')
  )
  on conflict (experiment_id, visitor_id) do update set
    last_seen_at = now(),
    views        = v.views + 1,
    -- once paid, always paid: a later direct visit must not erase the ad click
    traffic_type = case when v.traffic_type = 'paid' then 'paid' else excluded.traffic_type end,
    ad_id        = coalesce(v.ad_id, excluded.ad_id),
    adset_id     = coalesce(v.adset_id, excluded.adset_id),
    campaign_id  = coalesce(v.campaign_id, excluded.campaign_id),
    utm_source   = coalesce(v.utm_source, excluded.utm_source),
    utm_medium   = coalesce(v.utm_medium, excluded.utm_medium),
    utm_campaign = coalesce(v.utm_campaign, excluded.utm_campaign),
    utm_content  = coalesce(v.utm_content, excluded.utm_content)
  returning v.id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- ab_report — views, opt-ins and everything downstream, per variant
--
-- FULL OUTER JOIN for the same reason funnel_report uses one: a variant with
-- views and zero leads is the single most important row on the page, and an
-- inner join would delete it.
--
-- p_traffic 'paid' | 'organic' | 'all'. Compare like with like — a variant
-- judged on mixed traffic is really being judged on whichever traffic mix it
-- happened to get.
-- ---------------------------------------------------------------------------
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
