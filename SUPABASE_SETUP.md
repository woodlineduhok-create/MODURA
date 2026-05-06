# Supabase FINAL MASTER SQL Script

Run this script in your **Supabase SQL Editor** to recreate everything from scratch.

```sql
-- 1. CLEANUP & TABLE CREATION
DROP TABLE IF EXISTS public.products;

CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  image text 
);

-- 2. ENABLE SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. TABLE PERMISSIONS (Grant access to Netlify/Public)
GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;

-- 4. DATABASE POLICY: Allow anyone to Read, Insert, Update, Delete
CREATE POLICY "Public Full Access" 
ON public.products FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. STORAGE BUCKET SETUP
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. STORAGE POLICIES: Allow anyone to manage images in 'products' bucket
CREATE POLICY "Public Storage Access"
ON storage.objects FOR ALL
USING ( bucket_id = 'products' )
WITH CHECK ( bucket_id = 'products' );

-- 7. STORAGE PERMISSIONS
GRANT ALL ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;
```

## Netlify Secrets Reminder
- `VITE_SUPABASE_URL`: `https://zdbpumgtoddzqkhouoev.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnB1bWd0b2RkenFraG91b2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTU4MTYsImV4cCI6MjA5MzQ5MTgxNn0._Ju-QuYWleEBw6BpToi-qo_sNBAa-gfJ8v_wDBbUuqs`
- `VITE_SUPABASE_BUCKET`: `products`
