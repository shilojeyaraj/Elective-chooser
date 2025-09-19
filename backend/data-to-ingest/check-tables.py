#!/usr/bin/env python3
"""
Check what tables exist in the database
"""

import os
import sys
from supabase import create_client, Client

def check_tables():
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set")
        sys.exit(1)
    
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Connected to Supabase")
    
    # Try to query the profiles table
    try:
        result = supabase.table('profiles').select('*').limit(1).execute()
        print("✅ Profiles table exists and is accessible")
        print(f"📊 Found {len(result.data)} profiles")
    except Exception as e:
        print(f"❌ Profiles table error: {e}")
    
    # Try to query other tables
    tables_to_check = ['courses', 'options', 'specializations', 'certificates', 'diplomas']
    
    for table in tables_to_check:
        try:
            result = supabase.table(table).select('*').limit(1).execute()
            print(f"✅ {table} table: {len(result.data)} records")
        except Exception as e:
            print(f"❌ {table} table error: {e}")

if __name__ == "__main__":
    check_tables()
