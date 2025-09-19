-- Add email and password columns to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make email unique to prevent duplicates
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
