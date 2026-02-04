-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Ensure RLS policies allow update (usually they do for 'edit own', but good to double check implicit permissions)
-- Existing RLS policies typically cover "UPDATE" for "auth.uid() = id", so adding columns usually works fine without new policies.
