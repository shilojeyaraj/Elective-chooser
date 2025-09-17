-- Add username column to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN username TEXT UNIQUE;
