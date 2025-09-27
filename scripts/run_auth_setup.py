#!/usr/bin/env python3
"""
Run the custom authentication system setup
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

def setup_auth_system():
    """Setup the custom authentication system"""
    
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        print("Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file")
        return False
    
    print(f"🔗 Connecting to Supabase: {supabase_url}")
    
    try:
        # Create Supabase client with service role key
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Read the SQL file
        sql_file_path = os.path.join(os.path.dirname(__file__), 'setup_auth_system.sql')
        
        if not os.path.exists(sql_file_path):
            print(f"❌ SQL file not found: {sql_file_path}")
            return False
        
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
        
        print("📝 Running authentication system setup...")
        
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': sql_content}).execute()
        
        print("✅ Authentication system setup completed successfully!")
        print("\n📋 What was created:")
        print("  - users table (for email/password authentication)")
        print("  - Updated profiles table to work with users table")
        print("  - Authentication functions (register_user, authenticate_user)")
        print("  - Row Level Security policies")
        print("  - Password hashing functions")
        
        print("\n🚀 Next steps:")
        print("  1. Update your frontend to use the new authentication functions")
        print("  2. Test user registration and login")
        print("  3. Your existing profiles should still work")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up authentication system: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up Custom Authentication System")
    print("=" * 50)
    
    success = setup_auth_system()
    
    if success:
        print("\n✅ Setup completed successfully!")
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)
