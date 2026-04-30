-- Editable status overlay for the three hardcoded storefront locations.
-- The card content (name, image, address, hours) stays in code; only the
-- status pill and the small note line are read from this table at render time.
-- Idempotent so it can be re-run during development.

create table if not exists location_statuses (
  slug text primary key,
  status text not null check (status in ('open','closed','closed_for_season')),
  note text,
  updated_at timestamptz default now()
);

-- updated_at trigger.
create or replace function set_location_statuses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_location_statuses_updated_at on location_statuses;
create trigger trg_location_statuses_updated_at
  before update on location_statuses
  for each row execute function set_location_statuses_updated_at();

-- RLS: public select; only farmer/admin write.
alter table location_statuses enable row level security;

drop policy if exists "Location statuses are viewable by everyone" on location_statuses;
drop policy if exists "Farmers can manage location statuses" on location_statuses;

create policy "Location statuses are viewable by everyone"
  on location_statuses for select using (true);

create policy "Farmers can manage location statuses"
  on location_statuses for all
  using (
    exists (select 1 from public.users where id = auth.uid() and role in ('farmer','admin'))
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role in ('farmer','admin'))
  );

-- Seed the three slugs that match the hardcoded constants in the storefront.
insert into location_statuses (slug, status, note) values
  ('greenhouse_farm_stand', 'closed_for_season', 'Tentatively opening for the season in April.'),
  ('blacksburg_farmers_market', 'open', null),
  ('annie_kays_fruit_stand', 'closed_for_season', 'Tentatively opening on Saturdays starting in April.')
on conflict (slug) do nothing;
