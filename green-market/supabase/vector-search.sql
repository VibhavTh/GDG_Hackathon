-- ============================================================
-- vector-search.sql
-- Run once in Supabase SQL editor (or via supabase db push).
-- Enables pgvector, builds an HNSW index, and defines the
-- search_products RPC used by the storefront semantic search.
-- ============================================================

-- 1. Enable pgvector extension (idempotent)
create extension if not exists vector;

-- 2. HNSW index for fast cosine similarity queries.
--    m=16, ef_construction=64 are solid defaults for a small catalog.
create index if not exists products_embedding_hnsw
  on products
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- 3. Drop existing function first (return type changed -- cannot use CREATE OR REPLACE)
drop function if exists search_products(vector, float, int);

-- 4. Semantic similarity search function.
--    query_embedding : 1536-dim vector (text-embedding-3-small)
--    match_threshold : minimum similarity to include (0-1), default 0.2
--    match_count     : max rows to return, default 20
create or replace function search_products(
  query_embedding vector(1536),
  match_threshold float default 0.2,
  match_count     int   default 20
)
returns table (
  id            uuid,
  name          text,
  price         int8,
  stock         int8,
  category      product_category,
  image_url     text,
  unit          text,
  description   text,
  is_organic    bool,
  available_from date,
  available_until date,
  similarity    float
)
language sql stable
as $$
  select
    p.id,
    p.name,
    p.price,
    p.stock,
    p.category,
    p.image_url,
    p.unit,
    p.description,
    p.is_organic,
    p.available_from,
    p.available_until,
    1 - (p.embedding <=> query_embedding) as similarity
  from products p
  where
    p.deleted_at   is null
    and p.is_active = true
    and (p.available_until is null or p.available_until >= current_date)
    and p.embedding is not null
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
