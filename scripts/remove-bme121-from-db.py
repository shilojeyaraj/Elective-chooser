#!/usr/bin/env python3
"""
Remove BME121 from the Supabase database
This script connects to Supabase and removes only BME121 from the courses table.
"""

import os
from supabase import create_client, Client

# Read environment variables from .env file manually
def load_env():
    env_vars = {}
    try:
        with open('../.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    except FileNotFoundError:
        print("❌ .env file not found")
        return {}
    return env_vars

env_vars = load_env()
url: str = env_vars.get('SUPABASE_URL')
key: str = env_vars.get('SUPABASE_KEY')

if not url or not key:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY in environment variables")
    exit(1)

supabase: Client = create_client(url, key)

print('🔍 Checking if BME121 exists in database...')

# First, check if BME121 exists
response = supabase.table('courses').select('id, title, dept').eq('id', 'BME121').execute()

if response.data:
    print(f'📚 Found BME121: {response.data[0]["title"]} ({response.data[0]["dept"]})')
    
    # Delete BME121
    print('🗑️ Removing BME121 from database...')
    delete_response = supabase.table('courses').delete().eq('id', 'BME121').execute()
    
    if delete_response.data:
        print('✅ BME121 successfully removed from database')
    else:
        print('❌ Failed to remove BME121 from database')
        
    # Verify removal
    print('🔍 Verifying BME121 removal...')
    verify_response = supabase.table('courses').select('id').eq('id', 'BME121').execute()
    
    if not verify_response.data:
        print('✅ Confirmed: BME121 no longer exists in database')
    else:
        print('❌ Error: BME121 still exists in database')
        
else:
    print('ℹ️ BME121 not found in database (already removed or never existed)')

# Show remaining BME courses
print('\n📊 Remaining BME courses in database:')
bme_response = supabase.table('courses').select('id, title, dept').eq('dept', 'BME').execute()

if bme_response.data:
    for course in bme_response.data:
        print(f'  - {course["id"]}: {course["title"]}')
    print(f'Total BME courses remaining: {len(bme_response.data)}')
else:
    print('  No BME courses found in database')
