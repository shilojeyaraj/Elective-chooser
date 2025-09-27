#!/usr/bin/env python3
"""
Script to check the actual database schema
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

def check_schema():
    """Check the actual database schema"""
    print("🔍 Checking database schema...")
    
    try:
        # Get a sample course to see what fields exist
        response = supabase.table('courses').select('*').limit(1).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching sample course: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ No courses found in database")
            return
        
        print(f"📚 Database schema fields:")
        print("=" * 50)
        
        sample_course = courses[0]
        for field in sorted(sample_course.keys()):
            value = sample_course[field]
            value_type = type(value).__name__
            print(f"  {field}: {value_type}")
        
    except Exception as e:
        print(f"❌ Error checking schema: {e}")

if __name__ == "__main__":
    check_schema()
