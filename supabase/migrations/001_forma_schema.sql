-- Forma Additive Workshop — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor OR let Supabase GitHub Integration apply it automatically.

-- 1. Workshop Queue Settings (Single-row configuration)
create table if not exists public.workshop_settings (
  id integer primary key default 1 check (id = 1),
  manual_pause boolean not null default false,
  batch_1_cap integer not null default 5,
  batch_2_cap integer not null default 5,
  updated_at timestamptz not null default now()
);

insert into public.workshop_settings (id, manual_pause, batch_1_cap, batch_2_cap)
values (1, false, 5, 5)
on conflict (id) do nothing;

-- 2. Print Queue Orders (Populated by Stripe Checkout Webhook)
create table if not exists public.print_orders (
  id text primary key,
  stripe_session_id text unique,
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_email text not null default '',
  shipping_address text not null default '',
  batch text not null check (batch in ('batch_1', 'batch_2_24h')),
  status text not null default 'queued' check (status in ('queued', 'printing', 'fit_checked', 'shipped')),
  tracking_number text,
  subtotal numeric(10, 2) not null default 0,
  shipping_cost numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  items jsonb not null default '[]'::jsonb
);

create index if not exists idx_print_orders_status on public.print_orders (status);
create index if not exists idx_print_orders_created_at on public.print_orders (created_at desc);

-- 3. Product Reviews (Supports customer photos)
create table if not exists public.product_reviews (
  id text primary key,
  product_id text not null,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  comment text not null,
  config_summary text,
  photos jsonb not null default '[]'::jsonb,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_reviews_product_id on public.product_reviews (product_id, created_at desc);

-- 4. Direct Maker Feedback (Maker Inbox in /admin)
create table if not exists public.maker_feedback (
  id text primary key,
  category text not null,
  name text not null,
  email text not null,
  product_name text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists idx_maker_feedback_created_at on public.maker_feedback (created_at desc);

-- Row-Level Security (RLS)
alter table public.workshop_settings enable row level security;
alter table public.print_orders enable row level security;
alter table public.product_reviews enable row level security;
alter table public.maker_feedback enable row level security;

-- Public read access for storefront queue status & reviews
create policy "Public can read workshop settings"
  on public.workshop_settings for select
  using (true);

create policy "Public can read product reviews"
  on public.product_reviews for select
  using (true);

create policy "Public can insert product reviews"
  on public.product_reviews for insert
  with check (true);

create policy "Public can insert maker feedback"
  on public.maker_feedback for insert
  with check (true);

-- Note: print_orders & maker_feedback reads/updates are restricted to service_role
-- via Vercel serverless functions (/api/stripe-webhook and /api/queue).
