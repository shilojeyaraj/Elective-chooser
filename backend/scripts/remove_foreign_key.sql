-- Remove the foreign key constraint that's causing issues
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
