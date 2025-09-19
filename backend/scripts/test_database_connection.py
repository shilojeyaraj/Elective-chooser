#!/usr/bin/env python3
"""
Test database connection and check profiles table access
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_database_connection():
    """Test basic database connection and profiles table access"""
    
    # Get Supabase credentials
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # Use service role for admin access
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        print(f"SUPABASE_URL: {'✅' if supabase_url else '❌'}")
        print(f"SUPABASE_SERVICE_ROLE_KEY: {'✅' if supabase_key else '❌'}")
        return False
    
    print(f"🔗 Connecting to Supabase: {supabase_url}")
    
    try:
        # Create Supabase client with service role key
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client created successfully")
        
        # Test basic connection
        print("🔍 Testing basic connection...")
        result = supabase.table('courses').select('count').limit(1).execute()
        print("✅ Basic connection successful")
        
        # Test profiles table access
        print("🔍 Testing profiles table access...")
        profiles_result = supabase.table('profiles').select('*').limit(5).execute()
        print(f"✅ Profiles table accessible - found {len(profiles_result.data)} profiles")
        
        if profiles_result.data:
            print("📋 Sample profile data:")
            for i, profile in enumerate(profiles_result.data[:2]):
                print(f"  Profile {i+1}: {profile.get('username', 'N/A')} - {profile.get('program', 'N/A')}")
        
        # Test RLS policies
        print("🔍 Testing RLS policies...")
        
        # Try to insert a test profile (this will test RLS)
        test_profile = {
            "user_id": "00000000-0000-0000-0000-000000000000",  # Dummy UUID
            "username": "test_user",
            "program": "ECE",
            "current_term": "1A"
        }
        
        try:
            insert_result = supabase.table('profiles').insert(test_profile).execute()
            print("✅ Profile insert successful (RLS allows inserts)")
            
            # Clean up test data
            supabase.table('profiles').delete().eq('user_id', test_profile['user_id']).execute()
            print("✅ Test profile cleaned up")
            
        except Exception as insert_error:
            print(f"⚠️ Profile insert failed (likely RLS policy): {insert_error}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_auth_users():
    """Check if there are any users in auth.users table"""
    try:
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print("🔍 Checking auth.users table...")
        # Note: We can't directly query auth.users, but we can check if profiles exist
        profiles = supabase.table('profiles').select('user_id, username').execute()
        
        if profiles.data:
            print(f"✅ Found {len(profiles.data)} profiles in database:")
            for profile in profiles.data:
                print(f"  - {profile.get('username', 'N/A')} (ID: {profile.get('user_id', 'N/A')})")
        else:
            print("📝 No profiles found in database")
            
    except Exception as e:
        print(f"❌ Error checking auth users: {e}")

if __name__ == "__main__":
    print("🚀 Testing Supabase Database Connection")
    print("=" * 50)
    
    success = test_database_connection()
    
    if success:
        print("\n" + "=" * 50)
        check_auth_users()
        print("\n✅ Database connection test completed successfully!")
    else:
        print("\n❌ Database connection test failed!")
        sys.exit(1)
