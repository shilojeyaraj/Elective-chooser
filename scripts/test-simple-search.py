#!/usr/bin/env python3

import os
from supabase import create_client

# Set up environment
os.environ['SUPABASE_URL'] = 'https://ldjhtpdidpruzeyuxdfo.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkamh0cGRpZHBydXpleXV4ZGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDk5ODksImV4cCI6MjA3MzAyNTk4OX0.G9z3wtweZXO0GcT2Ov0Zt9cng6lUeqA0w9KK5YYTcN4'

def main():
    print("🔍 Testing Simple Database Search")
    print("=" * 50)
    
    # Create Supabase client
    try:
        supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])
        print("✅ Supabase client created successfully")
    except Exception as e:
        print(f"❌ Failed to create Supabase client: {e}")
        return
    
    # Test 1: Basic count
    print("\n📊 Test 1: Basic count")
    try:
        result = supabase.table('courses').select('id', count='exact').execute()
        print(f"✅ Total courses in database: {result.count}")
    except Exception as e:
        print(f"❌ Count failed: {e}")
    
    # Test 2: Simple search for "technical"
    print("\n📊 Test 2: Search for 'technical'")
    try:
        result = supabase.table('courses').select('id, title').ilike('title', '%technical%').limit(5).execute()
        print(f"✅ Found {len(result.data)} courses with 'technical' in title")
        for course in result.data:
            print(f"  - {course['id']}: {course['title']}")
    except Exception as e:
        print(f"❌ Technical search failed: {e}")
    
    # Test 3: Search for "elective"
    print("\n📊 Test 3: Search for 'elective'")
    try:
        result = supabase.table('courses').select('id, title').ilike('title', '%elective%').limit(5).execute()
        print(f"✅ Found {len(result.data)} courses with 'elective' in title")
        for course in result.data:
            print(f"  - {course['id']}: {course['title']}")
    except Exception as e:
        print(f"❌ Elective search failed: {e}")
    
    # Test 4: Search in description
    print("\n📊 Test 4: Search in description for 'technical'")
    try:
        result = supabase.table('courses').select('id, title, description').ilike('description', '%technical%').limit(3).execute()
        print(f"✅ Found {len(result.data)} courses with 'technical' in description")
        for course in result.data:
            print(f"  - {course['id']}: {course['title']}")
            print(f"    Description: {course['description'][:100]}...")
    except Exception as e:
        print(f"❌ Description search failed: {e}")
    
    # Test 5: Get sample courses
    print("\n📊 Test 5: Sample courses")
    try:
        result = supabase.table('courses').select('id, title, dept, level').limit(10).execute()
        print(f"✅ Sample courses:")
        for course in result.data:
            print(f"  - {course['id']}: {course['title']} ({course['dept']} {course['level']})")
    except Exception as e:
        print(f"❌ Sample courses failed: {e}")

if __name__ == "__main__":
    main()
