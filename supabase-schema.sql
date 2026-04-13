-- ─────────────────────────────────────────────────────────────
-- MB Auto Collective — Supabase Schema
-- Run this in your Supabase project's SQL Editor
-- ─────────────────────────────────────────────────────────────

-- VEHICLES TABLE
create table vehicles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  make          text not null,
  model         text not null,
  variant       text,
  year          integer not null,
  price         integer not null,
  kilometres    integer,
  colour        text,
  transmission  text check (transmission in ('Automatic', 'Manual')),
  body_type     text,
  engine        text,
  fuel_type     text check (fuel_type in ('Petrol', 'Diesel', 'Hybrid', 'Electric')),
  seats         integer,
  description   text,
  features      text[],
  photos        text[],
  status        text default 'available' check (status in ('available', 'sold', 'reserved')),
  featured      boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- AUTO-UPDATE updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vehicles_updated_at
  before update on vehicles
  for each row execute function update_updated_at();

-- ROW LEVEL SECURITY
alter table vehicles enable row level security;

create policy "Public read vehicles"
  on vehicles for select
  using (status = 'available' or status = 'sold' or status = 'reserved');

create policy "Admin full access"
  on vehicles for all
  using (auth.role() = 'authenticated');

-- ENQUIRIES TABLE (backup — HubSpot is primary)
create table enquiries (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid references vehicles(id),
  name          text not null,
  email         text not null,
  phone         text,
  message       text,
  source        text default 'website',
  created_at    timestamptz default now()
);

alter table enquiries enable row level security;
create policy "Admin read enquiries" on enquiries for select using (auth.role() = 'authenticated');
create policy "Anyone insert enquiry" on enquiries for insert with check (true);

-- ─────────────────────────────────────────────────────────────
-- STORAGE
-- Create a bucket called `vehicle-photos` with public access ON
-- Dashboard → Storage → New bucket → vehicle-photos → Public: ON
-- ─────────────────────────────────────────────────────────────
