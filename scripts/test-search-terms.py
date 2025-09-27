#!/usr/bin/env python3
"""
Test search terms for machine learning courses
"""

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(url, key)

print('Testing search for machine learning courses...')

# Test 1: Search for 'machine'
result1 = supabase.table('courses').select('id, title').ilike('title', '%machine%').limit(5).execute()
print(f'Search for machine: {len(result1.data)} results')
for course in result1.data[:3]:
    print(f'  - {course["id"]}: {course["title"]}')

# Test 2: Search for 'learning'  
result2 = supabase.table('courses').select('id, title').ilike('title', '%learning%').limit(5).execute()
print(f'Search for learning: {len(result2.data)} results')
for course in result2.data[:3]:
    print(f'  - {course["id"]}: {course["title"]}')

# Test 3: Search for 'elective'
result3 = supabase.table('courses').select('id, title').ilike('title', '%elective%').limit(5).execute()
print(f'Search for elective: {len(result3.data)} results')
for course in result3.data[:3]:
    print(f'  - {course["id"]}: {course["title"]}')

# Test 4: Search for 'artificial intelligence'
result4 = supabase.table('courses').select('id, title').ilike('title', '%artificial%').limit(5).execute()
print(f'Search for artificial: {len(result4.data)} results')
for course in result4.data[:3]:
    print(f'  - {course["id"]}: {course["title"]}')

# Test 5: Search for 'ai'
result5 = supabase.table('courses').select('id, title').ilike('title', '%ai%').limit(5).execute()
print(f'Search for ai: {len(result5.data)} results')
for course in result5.data[:3]:
    print(f'  - {course["id"]}: {course["title"]}')
