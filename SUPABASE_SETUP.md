# Supabase FINAL SQL Script

Run this script in your **Supabase SQL Editor**. 

### 💡 Should I delete the old one?
**No need to delete manually.** This script uses `DROP IF EXISTS` and `ON CONFLICT`, so it will automatically overwrite your old settings with the correct ones. 

However, if you want a **100% clean slate** (deleting your current products), you can uncomment the `-- drop table` line below.

```sql
-- 1. DATABASE SETUP
-- Uncomment the line below ONLY if you want to delete all current products and start fresh:
-- drop table if exists public.products;

create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  image text 
);

-- 2. ENABLE SECURITY
alter table public.products enable row level security;

-- 3. PERMISSIONS
-- Grant access to the 'anon' role (public users)
grant all on table public.products to anon;
grant all on table public.products to authenticated;
grant all on table public.products to service_role;

-- 4. PRODUCT POLICIES (Full Access)
drop policy if exists "Enable all for everyone" on public.products;
create policy "Enable all for everyone" on public.products for all using (true) with check (true);

-- 5. STORAGE BUCKET setup
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- 6. STORAGE POLICIES (Full Access for Netlify and Admin)
-- One rule to rule them all: Allow everyone to manage images in 'products' bucket
drop policy if exists "Storage All Access" on storage.objects;
create policy "Storage All Access"
on storage.objects for all
using ( bucket_id = 'products' )
with check ( bucket_id = 'products' );

-- Ensure storage schema grants
grant all on schema storage to anon, authenticated, service_role;
grant all on all tables in schema storage to anon, authenticated, service_role;
```

## Netlify Secrets Reminder
Make sure these are in your **Netlify Environment Variables**:
- `VITE_SUPABASE_URL`: `https://zdbpumgtoddzqkhouoev.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnB1bWd0b2RkenFraG91b2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTU4MTYsImV4cCI6MjA5MzQ5MTgxNn0._Ju-QuYWleEBw6BpToi-qo_sNBAa-gfJ8v_wDBbUuqs`
- `VITE_SUPABASE_BUCKET`: `products`

## Results
- **Images**: Will be saved permanently in the Supabase Storage "products" bucket.
- **Persistence**: Changes will stay saved even after refreshing the page.
- **Status Dashboard**: You can check the connection status directly in the **Manager** panel (top right).
