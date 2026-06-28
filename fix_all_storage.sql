-- 1. FORCE CREATE THE BUCKETS (If they don't exist, this creates them!)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('model_images', 'model_images', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('stl_files', 'stl_files', false) 
ON CONFLICT (id) DO NOTHING;

-- 2. DROP OLD POLICIES TO PREVENT CONFLICTS
DROP POLICY IF EXISTS "Allow admin uploads to model_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin uploads to stl_files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to model_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to stl_files" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to model_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to stl_files" ON storage.objects;

DROP POLICY IF EXISTS "Allow admin to insert stl_models" ON public.stl_models;
DROP POLICY IF EXISTS "Allow authenticated to insert stl_models" ON public.stl_models;
DROP POLICY IF EXISTS "Allow anon to insert stl_models" ON public.stl_models;

-- 3. CREATE NEW POLICIES FOR ANONYMOUS USERS (TO public)
-- Since you rely on a hidden URL instead of signing in, you are technically an "anonymous" user to Supabase.
-- This allows anyone (you) to upload without needing to log in.

CREATE POLICY "Allow anon uploads to model_images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'model_images');

CREATE POLICY "Allow anon uploads to stl_files"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'stl_files');

CREATE POLICY "Allow anon to insert stl_models"
ON public.stl_models FOR INSERT TO public
WITH CHECK (true);

-- Ensure public can read the images
DROP POLICY IF EXISTS "Allow public read access to model_images" ON storage.objects;
CREATE POLICY "Allow public read access to model_images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'model_images');
