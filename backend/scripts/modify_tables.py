#!/usr/bin/env python3
"""
Script to modify Supabase tables programmatically
"""

import os
from supabase import create_client, Client

def main():
    # Load environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not supabase_key:
        print('❌ Missing Supabase credentials')
        return

    supabase: Client = create_client(supabase_url, supabase_key)

    # Example: Add a new column
    try:
        print('🔧 Adding new column to courses table...')
        result = supabase.rpc('exec_sql', {
            'sql': 'ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1;'
        }).execute()
        print('✅ Column added successfully')
    except Exception as e:
        print(f'❌ Error adding column: {e}')

    # Example: Update existing data
    try:
        print('🔄 Updating course data...')
        result = supabase.table('courses').update({
            'difficulty_level': 2
        }).eq('level', '2A').execute()
        print(f'✅ Updated {len(result.data)} courses')
    except Exception as e:
        print(f'❌ Error updating data: {e}')

    # Example: Add new data
    try:
        print('➕ Adding new course...')
        new_course = {
            'id': 'TEST101',
            'title': 'Test Course',
            'description': 'A test course for demonstration',
            'dept': 'TEST',
            'level': '1A',
            'skills': ['testing', 'programming'],
            'terms_offered': ['1A', '1B'],
            'difficulty_level': 1
        }
        result = supabase.table('courses').insert(new_course).execute()
        print('✅ Course added successfully')
    except Exception as e:
        print(f'❌ Error adding course: {e}')

if __name__ == '__main__':
    main()
