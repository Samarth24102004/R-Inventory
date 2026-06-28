-- Since the 'purchases' table already existed for your Projects, 
-- we need to update it to ALSO support 3D Models (by adding the model_id column).

-- 1. Add the model_id column if it doesn't exist
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES public.stl_models(id);

-- 2. Make sure project_id is not strictly required anymore 
-- (Because a purchase can now be EITHER a project OR a 3D model)
DO $$ 
BEGIN 
  BEGIN
    ALTER TABLE public.purchases ALTER COLUMN project_id DROP NOT NULL;
  EXCEPTION
    WHEN undefined_column THEN 
      -- Ignore if project_id doesn't exist for some reason
      NULL;
  END;
END $$;

-- 3. Ensure RLS policies on purchases allow you to insert
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.purchases;
CREATE POLICY "Users can insert their own purchases" 
    ON public.purchases FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
