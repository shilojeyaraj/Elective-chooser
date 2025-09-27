#!/usr/bin/env python3
"""
Script to check the actual status of courses we've updated
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

def check_actual_status():
    """Check the actual status of courses we've updated"""
    print("🔍 Checking actual status of updated courses...")
    
    # Test courses we know we updated
    test_courses = ['CS115', 'ECE204', 'MSE251', 'SYDE121', 'CHE161', 'BIOL239', 'ECON201']
    
    for course_id in test_courses:
        try:
            response = supabase.table('courses').select('id, title, description, prereqs').eq('id', course_id).execute()
            
            if hasattr(response, 'data') and response.data:
                course = response.data[0]
                title = course.get('title', 'N/A')
                description = course.get('description', 'N/A')
                prereqs = course.get('prereqs', 'N/A')
                
                print(f"📚 {course_id}:")
                print(f"  Title: {title}")
                print(f"  Description: {description[:100]}..." if len(description) > 100 else f"  Description: {description}")
                print(f"  Prereqs: {prereqs}")
                
                # Check if it's still generic
                is_generic = (
                    title.endswith(' - Course Title') or 
                    title.endswith(' - Course') or
                    description.startswith('Course ') or
                    description.startswith('Description for') or
                    prereqs == ''
                )
                
                if is_generic:
                    print(f"  Status: ❌ Still generic")
                else:
                    print(f"  Status: ✅ Properly updated")
                print()
            else:
                print(f"❌ {course_id}: Not found in database")
                
        except Exception as e:
            print(f"❌ Error checking {course_id}: {e}")

if __name__ == "__main__":
    check_actual_status()
