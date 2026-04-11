-- ============================================================
-- RLS Policies -- run in Supabase SQL Editor
-- Single-vendor: no farms table. Admin = farmer or admin role.
-- ============================================================

-- ---- users ----
alter table public.users enable row level security;

create policy "users: read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users: update own row"
  on public.users for update
  using (auth.uid() = id);


-- ---- site_settings ----
alter table public.site_settings enable row level security;

create policy "site_settings: public read"
  on public.site_settings for select
  using (true);

create policy "site_settings: admin update"
  on public.site_settings for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('farmer', 'admin')
    )
  );


-- ---- products ----
alter table public.products enable row level security;

-- Anyone can read active, non-deleted products (storefront)
create policy "products: public read active"
  on public.products for select
  using (
    is_active = true
    and deleted_at is null
  );

-- Admins can read ALL products (including inactive/deleted -- for inventory)
create policy "products: admin read all"
  on public.products for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('farmer', 'admin')
    )
  );

-- Admins can insert products
create policy "products: admin insert"
  on public.products for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('farmer', 'admin')
    )
  );

-- Admins can update products
create policy "products: admin update"
  on public.products for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('farmer', 'admin')
    )
  );

-- Admins can delete products
create policy "products: admin delete"
  on public.products for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('farmer', 'admin')
    )
  );


-- ---- orders ----
alter table public.orders enable row level security;

-- Customers can read their own orders
create policy "orders: customer read own"
  on public.orders for select
  using (
    customer_id = auth.uid()
  );

-- Admins can read all orders
create policy "orders: admin read all"
  on public.orders for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('farmer', 'admin')
    )
  );

-- Admins can update orders (status changes)
create policy "orders: admin update"
  on public.orders for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('farmer', 'admin')
    )
  );

-- Anyone can place orders (authenticated customers + guests via service role)
create policy "orders: insert"
  on public.orders for insert
  with check (true);


-- ---- order_items ----
alter table public.order_items enable row level security;

-- Customers can read items from their own orders
create policy "order_items: customer read"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders where customer_id = auth.uid()
    )
  );

-- Admins can read all order items
create policy "order_items: admin read"
  on public.order_items for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('farmer', 'admin')
    )
  );

-- Anyone can insert order items (paired with order insert)
create policy "order_items: insert"
  on public.order_items for insert
  with check (true);


-- ---- processed_webhooks ----
alter table public.processed_webhooks enable row level security;
-- Only service role can touch this table -- no policies needed for anon/authenticated
