-- Fix the register_user function to handle the foreign key constraint properly
-- The issue is that the function needs to ensure the user is fully committed before creating the profile

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
  
  -- Insert new user and get the ID
  INSERT INTO users (email, password_hash)
  VALUES (user_email, hash_password(user_password))
  RETURNING id INTO new_user_id;
  
  -- Create profile if username is provided (after user is committed)
  IF user_username IS NOT NULL THEN
    INSERT INTO profiles (user_id, username)
    VALUES (new_user_id, user_username);
  END IF;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;
