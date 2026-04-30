-- Gallery Albums migration: per-event albums + collaborative customer uploads.
-- Idempotent so it can be re-run during development.

-- 1. Albums table (one per event; one Legacy album for pre-existing photos with event_id = NULL).
create table if not exists albums (
  id uuid default gen_random_uuid() primary key,
  event_id uuid unique references events(id) on delete cascade,
  name text not null,
  cover_photo_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_albums_event_id on albums (event_id);

-- 2. Backfill: ensure every existing event has an album.
insert into albums (event_id, name)
select e.id, e.title
from events e
left join albums a on a.event_id = e.id
where a.id is null;

-- 3. Legacy album for orphaned gallery_photos. Use a deterministic id so re-runs don't multiply.
insert into albums (id, event_id, name)
values ('00000000-0000-0000-0000-000000000001', null, 'Legacy')
on conflict (id) do nothing;

-- 4. Add album_id to gallery_photos (nullable first, backfill, then NOT NULL).
alter table gallery_photos add column if not exists album_id uuid references albums(id) on delete cascade;

update gallery_photos
set album_id = '00000000-0000-0000-0000-000000000001'
where album_id is null;

alter table gallery_photos alter column album_id set not null;

create index if not exists idx_gallery_photos_album_id on gallery_photos (album_id);

-- 5. Trigger: auto-create an album whenever an event is inserted.
create or replace function create_album_for_event()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into albums (event_id, name)
  values (new.id, new.title)
  on conflict (event_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_events_create_album on events;
create trigger trg_events_create_album
  after insert on events
  for each row execute function create_album_for_event();

-- 6. Active-album helper (used in RLS for customer inserts).
-- An album is "active" if its event matches the active-event rule:
--   current event: event_date <= today AND coalesce(end_date, event_date) >= today (most recent)
--   else most recent past event.
-- The Legacy album (event_id = null) is never active for customer uploads.
create or replace function is_active_album(p_album_id uuid)
returns boolean
language sql
stable
security definer
as $$
  with active_event as (
    select id
    from events
    where event_date <= current_date
      and coalesce(end_date, event_date) >= current_date
    order by event_date desc
    limit 1
  ),
  fallback_event as (
    select id
    from events
    where event_date < current_date
    order by event_date desc
    limit 1
  ),
  chosen as (
    select id from active_event
    union all
    select id from fallback_event
    where not exists (select 1 from active_event)
    limit 1
  )
  select exists (
    select 1
    from albums a
    join chosen c on c.id = a.event_id
    where a.id = p_album_id
  );
$$;

-- 7. RLS on albums: public select; only farmer/admin write.
alter table albums enable row level security;

drop policy if exists "Albums are viewable by everyone" on albums;
drop policy if exists "Farmers can manage albums" on albums;

create policy "Albums are viewable by everyone"
  on albums for select using (true);

create policy "Farmers can manage albums"
  on albums for all
  using (
    exists (select 1 from public.users where id = auth.uid() and role in ('farmer','admin'))
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role in ('farmer','admin'))
  );

-- 8. Replace gallery_photos policies for collaborative uploads.
drop policy if exists "Gallery photos are viewable by everyone" on gallery_photos;
drop policy if exists "Admins can upload gallery photos" on gallery_photos;
drop policy if exists "Admins can delete gallery photos" on gallery_photos;
drop policy if exists "Farmers can upload gallery photos" on gallery_photos;
drop policy if exists "Farmers can delete own gallery photos" on gallery_photos;
drop policy if exists "Authenticated can upload to active album" on gallery_photos;
drop policy if exists "Owner or farmer can delete photo" on gallery_photos;

create policy "Gallery photos are viewable by everyone"
  on gallery_photos for select using (true);

-- Authenticated users can insert into an album they're allowed to upload to:
--   farmer/admin: any album
--   customer: only the active album
create policy "Authenticated can upload to active album"
  on gallery_photos for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and (
      exists (select 1 from public.users where id = auth.uid() and role in ('farmer','admin'))
      or is_active_album(album_id)
    )
  );

-- Uploader can delete their own photo; farmer/admin can delete any.
create policy "Owner or farmer can delete photo"
  on gallery_photos for delete
  to authenticated
  using (
    uploaded_by = auth.uid()
    or exists (select 1 from public.users where id = auth.uid() and role in ('farmer','admin'))
  );

-- 9. Storage bucket policies: bucket-level checks. Per-album folder isolation is
-- enforced at the DB layer (gallery_photos insert RLS), so storage allows any
-- authenticated upload into the bucket. Customers upload under {album_id}/...
drop policy if exists "Admins can upload gallery images" on storage.objects;
drop policy if exists "Admins can delete gallery images" on storage.objects;
drop policy if exists "Farmers can upload gallery images" on storage.objects;
drop policy if exists "Farmers can delete gallery images" on storage.objects;
drop policy if exists "Authenticated can upload gallery images" on storage.objects;
drop policy if exists "Owner or farmer can delete gallery images" on storage.objects;

create policy "Authenticated can upload gallery images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery-images');

-- Owner of the storage object (uploader) or farmer/admin can delete.
create policy "Owner or farmer can delete gallery images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery-images'
    and (
      owner = auth.uid()
      or exists (select 1 from public.users where id = auth.uid() and role in ('farmer','admin'))
    )
  );
