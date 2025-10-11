-- Setup Authentication Functions for Elective Chooser
-- Run this in the Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql;

-- Create function to register a new user
CREATE OR REPLACE FUNCTION register_user(
  user_email TEXT,
  user_password TEXT,
  user_username TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = user_email) THEN
    RAISE EXCEPTION 'User with email % already exists', user_email;
  END IF;
  
  -- Insert new user
  INSERT INTO users (email, password_hash)
  VALUES (user_email, hash_password(user_password))
  RETURNING id INTO new_user_id;
  
  -- Create profile if username is provided
  IF user_username IS NOT NULL THEN
    INSERT INTO profiles (user_id, username)
    VALUES (new_user_id, user_username);
  END IF;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to authenticate a user
CREATE OR REPLACE FUNCTION authenticate_user(
  user_email TEXT,
  user_password TEXT
)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  username TEXT,
  program TEXT,
  current_term TEXT,
  interests JSONB,
  goal_tags JSONB,
  additional_comments TEXT,
  gpa NUMERIC,
  constraints JSONB,
  completed_courses JSONB,
  planned_courses JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  user_record RECORD;
  profile_record RECORD;
BEGIN
  -- Find user by email
  SELECT id, email, password_hash, is_active
  INTO user_record
  FROM users
  WHERE email = user_email AND is_active = true;
  
  -- Check if user exists and password is correct
  IF user_record.id IS NULL OR NOT verify_password(user_password, user_record.password_hash) THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;
  
  -- Update last sign in
  UPDATE users 
  SET last_sign_in = NOW(), updated_at = NOW()
  WHERE id = user_record.id;
  
  -- Get user profile
  SELECT p.*
  INTO profile_record
  FROM profiles p
  WHERE p.user_id = user_record.id;
  
  -- Return user data
  RETURN QUERY SELECT
    user_record.id,
    user_record.email,
    COALESCE(profile_record.username, ''),
    COALESCE(profile_record.program, ''),
    COALESCE(profile_record.current_term, ''),
    COALESCE(profile_record.interests, '[]'::JSONB),
    COALESCE(profile_record.goal_tags, '[]'::JSONB),
    COALESCE(profile_record.additional_comments, ''),
    profile_record.gpa,
    COALESCE(profile_record.constraints, '{}'::JSONB),
    COALESCE(profile_record.completed_courses, '[]'::JSONB),
    COALESCE(profile_record.planned_courses, '[]'::JSONB),
    COALESCE(profile_record.created_at, NOW()),
    COALESCE(profile_record.updated_at, NOW());
END;
$$ LANGUAGE plpgsql;

-- Create function to get user profile by ID
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  username TEXT,
  program TEXT,
  current_term TEXT,
  interests JSONB,
  goal_tags JSONB,
  additional_comments TEXT,
  gpa NUMERIC,
  constraints JSONB,
  completed_courses JSONB,
  planned_courses JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(p.username, ''),
    COALESCE(p.program, ''),
    COALESCE(p.current_term, ''),
    COALESCE(p.interests, '[]'::JSONB),
    COALESCE(p.goal_tags, '[]'::JSONB),
    COALESCE(p.additional_comments, ''),
    p.gpa,
    COALESCE(p.constraints, '{}'::JSONB),
    COALESCE(p.completed_courses, '[]'::JSONB),
    COALESCE(p.planned_courses, '[]'::JSONB),
    COALESCE(p.created_at, NOW()),
    COALESCE(p.updated_at, NOW())
  FROM users u
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.id = user_uuid AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION register_user TO anon, authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hash_password TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_password TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Authentication functions setup complete!';
  RAISE NOTICE '🔧 Created functions: register_user, authenticate_user, get_user_profile';
  RAISE NOTICE '🚀 Ready to use custom authentication!';
END $$;
