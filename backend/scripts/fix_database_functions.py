#!/usr/bin/env python3
"""
Fix the database functions by executing SQL directly
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

def fix_database_functions():
    """Fix the database functions"""
    
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
        
        # Read the fix SQL file
        sql_file_path = os.path.join(os.path.dirname(__file__), 'fix_register_user_function.sql')
        
        if not os.path.exists(sql_file_path):
            print(f"❌ SQL file not found: {sql_file_path}")
            return False
        
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
        
        print("🔧 Fixing register_user function...")
        
        # Execute the SQL using raw SQL execution
        try:
            # Use the postgrest client to execute raw SQL
            result = supabase.postgrest.rpc('exec', {'sql': sql_content}).execute()
            print("✅ register_user function fixed successfully")
        except Exception as e:
            print(f"❌ Failed to fix function: {e}")
            # Try alternative approach - execute via SQL editor
            print("Please manually execute the SQL in the Supabase SQL editor:")
            print("=" * 50)
            print(sql_content)
            print("=" * 50)
            return False
        
        # Test the fixed function
        print("\n🧪 Testing fixed function...")
        try:
            result = supabase.rpc('register_user', {
                'user_email': 'test@example.com',
                'user_password': 'testpassword123',
                'user_username': 'testuser'
            }).execute()
            print("✅ register_user function now works!")
            
            # Clean up test user
            supabase.table('users').delete().eq('email', 'test@example.com').execute()
            
        except Exception as e:
            print(f"❌ Function still has issues: {e}")
            return False
        
        print("\n✅ Database functions fixed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing database functions: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Fixing Database Functions")
    print("=" * 40)
    
    success = fix_database_functions()
    
    if success:
        print("\n✅ Functions fixed successfully!")
    else:
        print("\n❌ Failed to fix functions!")
        sys.exit(1)
