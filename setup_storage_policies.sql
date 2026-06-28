-- Drop previous policies to avoid duplicates
DROP POLICY IF EXISTS "Allow authenticated uploads to model_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to stl_files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;

-- Allow ONLY the admin (by email) to upload files to 'model_images' bucket
CREATE POLICY "Allow admin uploads to model_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'model_images' 
    AND (auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@HERE.COM'
);

-- Allow ONLY the admin to upload files to 'stl_files' bucket
CREATE POLICY "Allow admin uploads to stl_files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'stl_files' 
    AND (auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@HERE.COM'
);

-- Allow ONLY the admin to update files
CREATE POLICY "Allow admin updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id IN ('model_images', 'stl_files')
    AND (auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@HERE.COM'
);

-- Ensure the public can read the images
DROP POLICY IF EXISTS "Allow public read access to model_images" ON storage.objects;
CREATE POLICY "Allow public read access to model_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'model_images');

-- Allow ONLY the admin to insert data into the stl_models database table
DROP POLICY IF EXISTS "Allow admin to insert stl_models" ON public.stl_models;
CREATE POLICY "Allow admin to insert stl_models"
ON public.stl_models FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@HERE.COM');
