#!/usr/bin/env python3
"""
Test the authentication system to see what's already working
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

def test_auth_system():
    """Test the authentication system"""
    
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        return False
    
    print(f"🔗 Connecting to Supabase: {supabase_url}")
    
    try:
        # Create Supabase client with service role key
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Test 1: Check if users table exists
        print("\n📋 Testing database structure...")
        try:
            result = supabase.table('users').select('*').limit(1).execute()
            print("✅ users table exists")
        except Exception as e:
            print(f"❌ users table doesn't exist: {e}")
            return False
        
        # Test 2: Check if profiles table exists
        try:
            result = supabase.table('profiles').select('*').limit(1).execute()
            print("✅ profiles table exists")
        except Exception as e:
            print(f"❌ profiles table doesn't exist: {e}")
            return False
        
        # Test 3: Check if authentication functions exist
        print("\n🔧 Testing authentication functions...")
        try:
            # Test register_user function
            result = supabase.rpc('register_user', {
                'user_email': 'test@example.com',
                'user_password': 'testpassword123',
                'user_username': 'testuser'
            }).execute()
            print("✅ register_user function works")
            
            # Clean up test user
            supabase.table('users').delete().eq('email', 'test@example.com').execute()
            
        except Exception as e:
            print(f"❌ register_user function failed: {e}")
            return False
        
        # Test 4: Check if authenticate_user function exists
        try:
            # First create a test user
            supabase.rpc('register_user', {
                'user_email': 'test2@example.com',
                'user_password': 'testpassword123',
                'user_username': 'testuser2'
            }).execute()
            
            # Test authenticate_user function
            result = supabase.rpc('authenticate_user', {
                'user_email': 'test2@example.com',
                'user_password': 'testpassword123'
            }).execute()
            print("✅ authenticate_user function works")
            
            # Clean up test user
            supabase.table('users').delete().eq('email', 'test2@example.com').execute()
            
        except Exception as e:
            print(f"❌ authenticate_user function failed: {e}")
            return False
        
        print("\n✅ All authentication functions are working!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing authentication system: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Authentication System")
    print("=" * 40)
    
    success = test_auth_system()
    
    if success:
        print("\n✅ Authentication system is working correctly!")
    else:
        print("\n❌ Authentication system needs setup!")
        sys.exit(1)