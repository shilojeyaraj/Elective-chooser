#!/usr/bin/env python3
"""
Run database migration for option fulfillment
"""

import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# Initialize Supabase client
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

def run_sql_migration():
    """Run the SQL migration to add option fulfillment columns"""
    print("🔄 Running database migration...")
    
    # Read the SQL migration file
    with open('add-option-fulfillment-column.sql', 'r') as f:
        sql_content = f.read()
    
    # Split by semicolon and execute each statement
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
    
    for stmt in statements:
        if stmt:
            print(f'Executing: {stmt[:50]}...')
            try:
                result = supabase.rpc('exec_sql', {'sql': stmt})
                print('✅ Success')
            except Exception as e:
                print(f'❌ Error: {e}')

if __name__ == "__main__":
    try:
        run_sql_migration()
        print("✅ Database migration completed!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
