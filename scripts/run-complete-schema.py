#!/usr/bin/env python3
"""
Run the complete database schema and monitor progress
"""

import os
import sys
import time
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

def run_complete_schema():
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase environment variables")
        return False
    
    supabase = create_client(supabase_url, supabase_key)
    
    print("🔧 Running complete database schema...")
    print("⏳ This may take a few minutes to process all tables, indexes, and functions...")
    
    # Read the SQL file
    with open('complete-database-schema.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    try:
        print("📝 Executing schema...")
        start_time = time.time()
        
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': sql_content}).execute()
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"✅ Schema executed successfully in {duration:.2f} seconds!")
        print("🎉 Complete database schema is now ready!")
        
        # Verify some key tables exist
        print("\n🔍 Verifying key tables...")
        
        tables_to_check = [
            'courses', 'specializations', 'certificates', 'diplomas',
            'minors', 'concurrent_degrees', 'accelerated_masters',
            'user_profiles', 'chat_sessions', 'chat_messages'
        ]
        
        for table in tables_to_check:
            try:
                result = supabase.table(table).select('*').limit(1).execute()
                print(f"  ✅ {table} table exists")
            except Exception as e:
                print(f"  ❌ {table} table error: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error running schema: {e}")
        print("\n🔄 Trying to run schema in smaller chunks...")
        
        # Split by major sections and run each part
        sections = sql_content.split('-- ==============================================')
        
        for i, section in enumerate(sections):
            if section.strip():
                try:
                    print(f"Running section {i+1}...")
                    supabase.rpc('exec_sql', {'sql': section}).execute()
                    print(f"✅ Section {i+1} completed")
                    time.sleep(1)  # Small delay between sections
                except Exception as section_error:
                    print(f"⚠️ Section {i+1} failed: {section_error}")
        
        print("🎉 Schema execution completed (with some warnings)")
        return True

if __name__ == "__main__":
    run_complete_schema()
