#!/usr/bin/env python3
"""
Check what courses exist in the database
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# Initialize Supabase client
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

def check_courses():
    """Check what courses exist in the database"""
    response = supabase.from_('courses').select('id').execute()
    all_courses = [c['id'] for c in response.data]
    
    print(f'Total courses in database: {len(all_courses)}')
    print('\nAll course IDs:')
    for course in sorted(all_courses):
        print(f'  {course}')
    
    # Check for specific course types
    cs_courses = [c for c in all_courses if c.startswith('CS')]
    ece_courses = [c for c in all_courses if c.startswith('ECE')]
    mse_courses = [c for c in all_courses if c.startswith('MSE')]
    
    print(f'\nCS courses: {len(cs_courses)}')
    for course in sorted(cs_courses):
        print(f'  {course}')
    
    print(f'\nECE courses: {len(ece_courses)}')
    for course in sorted(ece_courses):
        print(f'  {course}')
    
    print(f'\nMSE courses: {len(mse_courses)}')
    for course in sorted(mse_courses):
        print(f'  {course}')

if __name__ == "__main__":
    check_courses()