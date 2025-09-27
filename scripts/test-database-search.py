#!/usr/bin/env python3
"""
Script to test database search functionality
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(env_path)

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ Error: Missing SUPABASE_URL or SUPABASE_KEY in environment variables")
    sys.exit(1)

supabase: Client = create_client(url, key)

def test_database_search():
    """Test database search functionality"""
    print("🔍 Testing database search functionality...")
    
    try:
        # Test 1: Basic course search
        print("\n📚 Test 1: Basic course search")
        response = supabase.table('courses').select('id, title, dept, level').limit(10).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        print(f"✅ Found {len(courses)} courses")
        for course in courses[:5]:
            print(f"  - {course['id']}: {course['title']} ({course['dept']}, Level {course['level']})")
        
        # Test 2: Search for electives
        print("\n📚 Test 2: Search for electives")
        elective_response = supabase.table('courses').select('id, title, dept, level').ilike('title', '%elective%').limit(5).execute()
        
        if hasattr(elective_response, 'error') and elective_response.error:
            print(f"❌ Elective search error: {elective_response.error}")
        else:
            elective_courses = elective_response.data if hasattr(elective_response, 'data') else []
            print(f"✅ Found {len(elective_courses)} elective courses")
            for course in elective_courses:
                print(f"  - {course['id']}: {course['title']}")
        
        # Test 3: Search for CSE courses
        print("\n📚 Test 3: Search for CSE courses")
        cse_response = supabase.table('courses').select('id, title, dept, level, cse_classification').not_('cse_classification', 'is', None).limit(5).execute()
        
        if hasattr(cse_response, 'error') and cse_response.error:
            print(f"❌ CSE search error: {cse_response.error}")
        else:
            cse_courses = cse_response.data if hasattr(cse_response, 'data') else []
            print(f"✅ Found {len(cse_courses)} CSE courses")
            for course in cse_courses:
                print(f"  - {course['id']}: {course['title']} (CSE {course['cse_classification']})")
        
        # Test 4: Search by department
        print("\n📚 Test 4: Search by department (CS)")
        cs_response = supabase.table('courses').select('id, title, dept, level').eq('dept', 'CS').limit(5).execute()
        
        if hasattr(cs_response, 'error') and cs_response.error:
            print(f"❌ CS search error: {cs_response.error}")
        else:
            cs_courses = cs_response.data if hasattr(cs_response, 'data') else []
            print(f"✅ Found {len(cs_courses)} CS courses")
            for course in cs_courses:
                print(f"  - {course['id']}: {course['title']}")
        
        # Test 5: Check terms_offered format
        print("\n📚 Test 5: Check terms_offered format")
        terms_response = supabase.table('courses').select('id, title, terms_offered').not_('terms_offered', 'is', None).limit(3).execute()
        
        if hasattr(terms_response, 'error') and terms_response.error:
            print(f"❌ Terms search error: {terms_response.error}")
        else:
            terms_courses = terms_response.data if hasattr(terms_response, 'data') else []
            print(f"✅ Found {len(terms_courses)} courses with terms_offered")
            for course in terms_courses:
                print(f"  - {course['id']}: {course['title']}")
                print(f"    terms_offered: {course['terms_offered']} (type: {type(course['terms_offered'])})")
        
    except Exception as e:
        print(f"❌ Error testing database search: {e}")

if __name__ == "__main__":
    test_database_search()
