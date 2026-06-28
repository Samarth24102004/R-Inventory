-- Create stl_models table to store the 3D model products
CREATE TABLE IF NOT EXISTS public.stl_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in INR
    image_url TEXT,
    stl_file_path TEXT NOT NULL, -- Path to the file in the private storage bucket
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.stl_models ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view the 3D models (read-only for public)
DROP POLICY IF EXISTS "Anyone can view stl_models" ON public.stl_models;
CREATE POLICY "Anyone can view stl_models" 
    ON public.stl_models FOR SELECT 
    USING (true);

-- Create purchases table to track transactions
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    model_id UUID REFERENCES public.stl_models(id) NOT NULL,
    payment_id TEXT NOT NULL, -- Razorpay payment ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can only view their own purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
CREATE POLICY "Users can view their own purchases" 
    ON public.purchases FOR SELECT 
    USING (auth.uid() = user_id);

-- Insert purchases (you'll probably handle this from a secure edge function or backend API)
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.purchases;
CREATE POLICY "Users can insert their own purchases" 
    ON public.purchases FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------
-- INSTRUCTIONS FOR STORAGE BUCKETS (Do this manually in Dashboard)
-------------------------------------------------------
-- 1. Create a new Storage Bucket called 'model_images' and make it PUBLIC.
-- 2. Create a new Storage Bucket called 'stl_files' and make it PRIVATE.
-- 
-- The public 'model_images' bucket will hold the thumbnail photos.
-- The private 'stl_files' bucket will hold the .stl files, ensuring only people who purchased them can download them (via signed URLs).
