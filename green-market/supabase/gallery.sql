-- Gallery Photos table for farm photo gallery
create table if not exists gallery_photos (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  caption text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table gallery_photos enable row level security;

-- Everyone can view gallery photos
create policy "Gallery photos are viewable by everyone"
  on gallery_photos for select using (true);

-- Only farmers can upload gallery photos
create policy "Farmers can upload gallery photos"
  on gallery_photos for insert
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'farmer')
  );

-- Farmers can delete their own gallery photos
create policy "Farmers can delete own gallery photos"
  on gallery_photos for delete
  using (uploaded_by = auth.uid());

-- Index for ordering by date
create index if not exists idx_gallery_photos_created_at
  on gallery_photos (created_at desc);
