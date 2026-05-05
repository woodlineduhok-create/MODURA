# Supabase Final Setup Guide

Run this ENTIRE script in your **Supabase SQL Editor** to ensure your database and storage are correctly configured for both local development and Netlify deployment.

```sql
-- 1. CLEAN START (Optional but recommended if you have issues)
-- drop table if exists public.products;

-- 2. CREATE PRODUCTS TABLE
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price numeric not null,
  category text not null,
  description text,
  image text
);

-- 3. ENABLE RLS
alter table public.products enable row level security;

-- 4. TABLE POLICIES (Allow Anyone to Read/Write)
drop policy if exists "Enable all for everyone" on public.products;
create policy "Enable all for everyone" on public.products for all using (true) with check (true);

-- 5. STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- 6. STORAGE POLICIES (Allow anyone to manage images)
drop policy if exists "Storage All Access" on storage.objects;
create policy "Storage All Access" on storage.objects for all using (bucket_id = 'products') with check (bucket_id = 'products');
```

## Netlify Deployment Steps
1. Push your code to GitHub.
2. Connect your GitHub to Netlify.
3. In Netlify **Site Settings > Build & deploy > Environment variables**, add:
   - `VITE_SUPABASE_URL`: `https://zdbpumgtoddzqkhouoev.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnB1bWd0b2RkenFraG91b2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTU4MTYsImV4cCI6MjA5MzQ5MTgxNn0._Ju-QuYWleEBw6BpToi-qo_sNBAa-gfJ8v_wDBbUuqs`
   - `VITE_SUPABASE_BUCKET`: `products`

## Verification
- **Manager Panel**: Open the Manager in your app. The "Storage" dot should be green.
- **Persistence**: When you add a product, it should appear instantly. Refresh the page to confirm it's still there.
- **Errors**: If a red popup appears, your Supabase tables or policies are likely not set up correctly. Copy and run the SQL above again.

