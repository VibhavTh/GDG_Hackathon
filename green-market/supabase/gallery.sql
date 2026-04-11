-- Gallery Photos table for farm photo gallery
create table if not exists gallery_photos (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  caption text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table gallery_photos enable row level security;

drop policy if exists "Gallery photos are viewable by everyone" on gallery_photos;
drop policy if exists "Admins can upload gallery photos" on gallery_photos;
drop policy if exists "Admins can delete gallery photos" on gallery_photos;
drop policy if exists "Farmers can upload gallery photos" on gallery_photos;
drop policy if exists "Farmers can delete own gallery photos" on gallery_photos;

-- Everyone can view gallery photos
create policy "Gallery photos are viewable by everyone"
  on gallery_photos for select using (true);

-- Only admins can upload gallery photos
create policy "Admins can upload gallery photos"
  on gallery_photos for insert
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Only admins can delete gallery photos
create policy "Admins can delete gallery photos"
  on gallery_photos for delete
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Index for ordering by date
create index if not exists idx_gallery_photos_created_at
  on gallery_photos (created_at desc);

-- Storage policies for gallery-images bucket
-- (bucket must be created in dashboard with public read access)

drop policy if exists "Admins can upload gallery images" on storage.objects;
drop policy if exists "Admins can delete gallery images" on storage.objects;
drop policy if exists "Farmers can upload gallery images" on storage.objects;
drop policy if exists "Farmers can delete gallery images" on storage.objects;

create policy "Admins can upload gallery images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery-images'
    and exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete gallery images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery-images'
    and exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
