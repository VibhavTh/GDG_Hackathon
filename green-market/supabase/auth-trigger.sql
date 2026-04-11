-- --------------------------------------------------------
-- Run this in Supabase SQL Editor after schema.sql
-- --------------------------------------------------------

-- Auto-create public.users row when a new auth user signs up.
-- Runs as SECURITY DEFINER so it bypasses RLS.
-- This is a safety net — the Server Action also inserts the row,
-- but this handles edge cases (OAuth, magic link, etc.)
-- --------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    'customer'   -- default; admin must manually set role to 'farmer' or 'admin'
  )
  on conflict (id) do nothing;  -- Server Action may have already created the row
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
