#!/usr/bin/env python3
"""
Script to get course codes for specific departments missing names
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

def get_department_courses():
    """Get course codes for specific departments missing names"""
    print("🔍 Getting course codes for ME, NE, PHYS, and SYDE departments...")
    
    try:
        # Fetch all courses
        response = supabase.table('courses').select('*').order('id').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ No courses found in database")
            return
        
        # Target departments
        target_departments = ['ME', 'NE', 'PHYS', 'SYDE']
        
        for dept in target_departments:
            print(f"\n📚 {dept} COURSES MISSING NAMES:")
            print("=" * 40)
            
            dept_courses = []
            for course in courses:
                course_id = course.get('id', '')
                course_dept = course.get('dept', '')
                title = course.get('title', '')
                
                # Check if it's the right department and has a generic name
                if (course_dept == dept and 
                    (not title or 
                     title.strip() == '' or
                     title.lower() in ['course', 'elective', 'technical elective', 'approved elective'] or
                     title.startswith(f"{course_id} - ") or
                     title == course_id or
                     title.endswith(' - Course Title') or
                     title.endswith(' - Course'))):
                    dept_courses.append(course_id)
            
            # Sort the courses
            dept_courses.sort()
            
            # Print in columns of 5
            for i in range(0, len(dept_courses), 5):
                row_courses = dept_courses[i:i+5]
                print("  " + "  ".join(f"{course:8}" for course in row_courses))
            
            print(f"\nTotal {dept} courses missing names: {len(dept_courses)}")
        
        # Also get courses missing descriptions for these departments
        print(f"\n📄 COURSES MISSING DESCRIPTIONS BY DEPARTMENT:")
        print("=" * 50)
        
        for dept in target_departments:
            print(f"\n{dept} courses missing descriptions:")
            dept_courses = []
            for course in courses:
                course_id = course.get('id', '')
                course_dept = course.get('dept', '')
                description = course.get('description', '')
                
                # Check if it's the right department and has a generic description
                if (course_dept == dept and 
                    (not description or 
                     description.strip() == '' or
                     description.lower().startswith('course from') or
                     description.lower().startswith('description for') or
                     description.lower().startswith('introduction to') or
                     description.lower().startswith('advanced') or
                     description.lower().startswith('course') or
                     description.lower().startswith('elective') or
                     len(description.strip()) < 20)):
                    dept_courses.append(course_id)
            
            # Sort the courses
            dept_courses.sort()
            
            # Print in columns of 5
            for i in range(0, len(dept_courses), 5):
                row_courses = dept_courses[i:i+5]
                print("  " + "  ".join(f"{course:8}" for course in row_courses))
            
            print(f"Total {dept} courses missing descriptions: {len(dept_courses)}")
        
    except Exception as e:
        print(f"❌ Error analyzing courses: {e}")

if __name__ == "__main__":
    get_department_courses()
