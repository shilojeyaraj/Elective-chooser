-- Setup Custom Authentication System
-- This creates a users table and updates the profiles table to work with it

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Update profiles table to reference our users table instead of auth.users
-- First, let's check if we need to modify the existing profiles table
DO $$
BEGIN
  -- Check if profiles table exists and has user_id column
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- Check if user_id column exists and what type it is
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
      -- Check if it's already a UUID type
      IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') = 'uuid' THEN
        RAISE NOTICE 'Profiles table already has UUID user_id column';
      ELSE
        -- Convert user_id to UUID if it's not already
        ALTER TABLE profiles ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
        RAISE NOTICE 'Converted user_id column to UUID type';
      END IF;
    ELSE
      -- Add user_id column if it doesn't exist
      ALTER TABLE profiles ADD COLUMN user_id UUID;
      RAISE NOTICE 'Added user_id column to profiles table';
    END IF;
  ELSE
    -- Create profiles table if it doesn't exist
    CREATE TABLE profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      username TEXT UNIQUE,
      program TEXT,
      current_term TEXT,
      completed_courses JSONB DEFAULT '[]',
      planned_courses JSONB DEFAULT '[]',
      additional_comments TEXT,
      gpa NUMERIC,
      interests JSONB DEFAULT '[]',
      goal_tags JSONB DEFAULT '[]',
      constraints JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Created profiles table';
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to profiles table';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = current_setting('app.current_user_id')::UUID);

-- Profiles policies (same as before)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::UUID);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some test users (optional - remove in production)
-- INSERT INTO users (email, password_hash) VALUES 
-- ('test@example.com', hash_password('password123')),
-- ('admin@example.com', hash_password('admin123'));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION register_user TO anon, authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hash_password TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_password TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Custom authentication system setup complete!';
  RAISE NOTICE '📋 Created tables: users, profiles (updated)';
  RAISE NOTICE '🔧 Created functions: register_user, authenticate_user, get_user_profile';
  RAISE NOTICE '🔒 Enabled Row Level Security';
  RAISE NOTICE '🚀 Ready to use custom authentication!';
END $$;
