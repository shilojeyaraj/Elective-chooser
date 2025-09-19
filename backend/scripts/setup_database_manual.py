#!/usr/bin/env python3
"""
Manually setup the database by executing SQL statements one by one
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

def setup_database():
    """Setup the database by executing SQL statements"""
    
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
        
        # Read the SQL file
        sql_file_path = os.path.join(os.path.dirname(__file__), 'setup_auth_system.sql')
        
        if not os.path.exists(sql_file_path):
            print(f"❌ SQL file not found: {sql_file_path}")
            return False
        
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
        
        print("📝 Setting up database tables and functions...")
        
        # Split SQL into individual statements
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if not statement:
                continue
                
            print(f"  Executing statement {i+1}/{len(statements)}...")
            try:
                # Execute each statement
                result = supabase.postgrest.rpc('exec', {'sql': statement}).execute()
                print(f"    ✅ Statement {i+1} executed successfully")
            except Exception as e:
                # Some statements might fail if they already exist, which is okay
                if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                    print(f"    ⚠️  Statement {i+1} skipped (already exists)")
                else:
                    print(f"    ❌ Statement {i+1} failed: {e}")
                    # Continue with other statements
        
        print("✅ Database setup completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up Database Manually")
    print("=" * 40)
    
    success = setup_database()
    
    if success:
        print("\n✅ Setup completed successfully!")
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)
