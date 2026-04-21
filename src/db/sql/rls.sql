-- Row Level Security — safe to run multiple times in Supabase SQL editor.

alter table reservations  enable row level security;
alter table blocked_dates enable row level security;
alter table pricing_rules enable row level security;
alter table base_pricing  enable row level security;
alter table settings      enable row level security;

-- Public reads on safe tables
drop policy if exists "public reads blocked_dates" on blocked_dates;
create policy "public reads blocked_dates"
  on blocked_dates for select using (true);

drop policy if exists "public reads active pricing_rules" on pricing_rules;
create policy "public reads active pricing_rules"
  on pricing_rules for select using (active = true);

drop policy if exists "public reads base_pricing" on base_pricing;
create policy "public reads base_pricing"
  on base_pricing for select using (true);

-- Settings: expose only non-sensitive columns via a view.
drop view if exists public_settings;
create view public_settings as
  select whatsapp, contact_email, attention_hours,
         instagram, facebook, tiktok,
         checkin_time, checkout_time,
         address_line, latitude, longitude
  from settings;

-- Anyone can submit a pending reservation. All other ops require service role.
drop policy if exists "anyone can insert pending reservation" on reservations;
create policy "anyone can insert pending reservation"
  on reservations for insert
  with check (status = 'pending');
