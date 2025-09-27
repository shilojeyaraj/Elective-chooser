#!/usr/bin/env python3
"""
Run the schema SQL script in Supabase
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

def run_schema():
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase environment variables")
        return False
    
    supabase = create_client(supabase_url, supabase_key)
    
    print("🔧 Running schema script...")
    
    # Read the SQL file
    with open('setup-minors-concurrent-schema.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    try:
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': sql_content}).execute()
        print("✅ Schema script executed successfully!")
        return True
    except Exception as e:
        print(f"❌ Error running schema script: {e}")
        # Try running it in parts
        print("🔄 Trying to run schema in parts...")
        
        # Split by major sections and run each part
        sections = sql_content.split('-- ==============================================')
        
        for i, section in enumerate(sections):
            if section.strip():
                try:
                    print(f"Running section {i+1}...")
                    supabase.rpc('exec_sql', {'sql': section}).execute()
                    print(f"✅ Section {i+1} completed")
                except Exception as section_error:
                    print(f"⚠️ Section {i+1} failed: {section_error}")
        
        return True

if __name__ == "__main__":
    run_schema()
