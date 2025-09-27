#!/usr/bin/env python3
"""
Script to check what AE123 actually is
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

def check_ae123():
    """Check what AE123 actually is"""
    print("🔍 Checking AE123 course details...")
    
    try:
        # Search for AE123
        response = supabase.table('courses').select('*').eq('id', 'AE123').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching AE123: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ AE123 not found in database")
            return
        
        course = courses[0]
        print(f"📚 AE123 Course Details:")
        print(f"  ID: {course.get('id')}")
        print(f"  Title: {course.get('title')}")
        print(f"  Department: {course.get('dept')}")
        print(f"  Faculty: {course.get('faculty')}")
        print(f"  Level: {course.get('level')}")
        print(f"  Description: {course.get('description')}")
        print(f"  Prerequisites: {course.get('prereqs')}")
        print(f"  Terms Offered: {course.get('terms_offered')}")
        print(f"  Skills: {course.get('skills')}")
        
    except Exception as e:
        print(f"❌ Error checking AE123: {e}")

if __name__ == "__main__":
    check_ae123()
