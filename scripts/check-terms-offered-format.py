#!/usr/bin/env python3
"""
Script to check how terms_offered is stored in the database
"""

import os
import sys
import json
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

def check_terms_offered_format():
    """Check how terms_offered is stored in the database"""
    print("🔍 Checking terms_offered field format...")
    
    try:
        # Get a few sample courses to see the terms_offered format
        response = supabase.table('courses').select('id, title, terms_offered').limit(5).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ No courses found in database")
            return
        
        print(f"📚 Found {len(courses)} sample courses")
        print("\n📋 TERMS_OFFERED FIELD FORMAT:")
        print("=" * 50)
        
        for course in courses:
            course_id = course.get('id', 'Unknown')
            title = course.get('title', 'No title')
            terms_offered = course.get('terms_offered')
            
            print(f"\n{course_id}: {title}")
            print(f"  terms_offered type: {type(terms_offered)}")
            print(f"  terms_offered value: {terms_offered}")
            
            if isinstance(terms_offered, list):
                print(f"  terms_offered length: {len(terms_offered)}")
                print(f"  terms_offered items: {terms_offered}")
            elif isinstance(terms_offered, str):
                print(f"  terms_offered string length: {len(terms_offered)}")
                try:
                    parsed = json.loads(terms_offered)
                    print(f"  parsed as JSON: {parsed}")
                except:
                    print(f"  not valid JSON")
        
    except Exception as e:
        print(f"❌ Error checking terms_offered format: {e}")

if __name__ == "__main__":
    check_terms_offered_format()
