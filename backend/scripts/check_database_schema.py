#!/usr/bin/env python3
"""
Check the current database schema
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

def check_database_schema():
    """Check the current database schema"""
    
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
        
        # Check users table structure
        print("\n📋 Checking users table...")
        try:
            result = supabase.table('users').select('*').limit(1).execute()
            print("✅ users table accessible")
            if result.data:
                print(f"   Columns: {list(result.data[0].keys())}")
        except Exception as e:
            print(f"❌ users table error: {e}")
        
        # Check profiles table structure
        print("\n📋 Checking profiles table...")
        try:
            result = supabase.table('profiles').select('*').limit(1).execute()
            print("✅ profiles table accessible")
            if result.data:
                print(f"   Columns: {list(result.data[0].keys())}")
        except Exception as e:
            print(f"❌ profiles table error: {e}")
        
        # Check if functions exist
        print("\n🔧 Checking functions...")
        try:
            # Try to call a simple function
            result = supabase.rpc('hash_password', {'password': 'test'}).execute()
            print("✅ hash_password function exists")
        except Exception as e:
            print(f"❌ hash_password function error: {e}")
        
        try:
            result = supabase.rpc('verify_password', {'password': 'test', 'hash': 'test'}).execute()
            print("✅ verify_password function exists")
        except Exception as e:
            print(f"❌ verify_password function error: {e}")
        
        try:
            result = supabase.rpc('register_user', {'user_email': 'test@test.com', 'user_password': 'test', 'user_username': 'test'}).execute()
            print("✅ register_user function exists")
        except Exception as e:
            print(f"❌ register_user function error: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Checking Database Schema")
    print("=" * 40)
    
    check_database_schema()
