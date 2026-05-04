# Supabase Full Setup Guide

Run this ENTIRE script in your **Supabase SQL Editor** to create the tables, buckets, and disable RLS (allow all access) for testing.

```sql
-- 1. CREATE PRODUCTS TABLE
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price numeric not null,
  category text not null,
  description text,
  image text
);

-- 2. ENABLE RLS (Required to use policies)
alter table public.products enable row level security;

-- 3. TABLE POLICIES (Allow Everyone)
drop policy if exists "Public Access" on public.products;
create policy "Public Access" on public.products for all using (true) with check (true);

-- 4. STORAGE SETUP (Bucket)
-- This creates the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 5. STORAGE POLICIES (Allow Everyone)
-- Note: We drop existing ones first to ensure a clean slate
drop policy if exists "Public Access Select" on storage.objects;
drop policy if exists "Public Access Insert" on storage.objects;
drop policy if exists "Public Access Update" on storage.objects;
drop policy if exists "Public Access Delete" on storage.objects;

-- Allow anyone to view images
create policy "Public Access Select" on storage.objects for select using (bucket_id = 'products');

-- Allow anyone to upload images
create policy "Public Access Insert" on storage.objects for insert with check (bucket_id = 'products');

-- Allow anyone to update images
create policy "Public Access Update" on storage.objects for update with check (bucket_id = 'products');

-- Allow anyone to delete images
create policy "Public Access Delete" on storage.objects for delete using (bucket_id = 'products');
```

## Real Credentials for your Secrets
Add these to your **AI Studio Secrets** (Sidebar > Settings > Secrets):
- `VITE_SUPABASE_URL`: `https://zdbpumgtoddzqkhouoev.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnB1bWd0b2RkenFraG91b2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTU4MTYsImV4cCI6MjA5MzQ5MTgxNn0._Ju-QuYWleEBw6BpToi-qo_sNBAa-gfJ8v_wDBbUuqs`
- `VITE_SUPABASE_BUCKET`: `products`

## Setup Verification
Go to the **Manager** (top right) in the app. Look for the **"Storage: active"** indicator:
- 🟢 **Active**: Setup is correct!
- 🔴 **Error**: Something is missing (usually the bucket doesn't exist yet).

