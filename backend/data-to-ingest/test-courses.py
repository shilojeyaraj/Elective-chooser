#!/usr/bin/env python3
"""
Test what's in the courses table
"""

import os
import sys
from supabase import create_client, Client

def test_courses():
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set")
        sys.exit(1)
    
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Connected to Supabase")
    
    # Test basic query
    try:
        result = supabase.table('courses').select('*').limit(5).execute()
        print(f"📊 Found {len(result.data)} courses in database")
        
        if result.data:
            print("📚 Sample courses:")
            for course in result.data[:3]:
                print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
        else:
            print("❌ No courses found in database")
            
    except Exception as e:
        print(f"❌ Error querying courses: {e}")
    
    # Test search query
    try:
        result = supabase.table('courses').select('*').ilike('title', '%ai%').limit(5).execute()
        print(f"🔍 Found {len(result.data)} courses with 'ai' in title")
        
        if result.data:
            print("🤖 AI-related courses:")
            for course in result.data:
                print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
                
    except Exception as e:
        print(f"❌ Error searching courses: {e}")

if __name__ == "__main__":
    test_courses()
