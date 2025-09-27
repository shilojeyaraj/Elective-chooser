#!/usr/bin/env python3
"""
Script to get all course titles from the database
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

def get_all_course_titles():
    """Get all course titles from the database"""
    print("🔍 Fetching all course titles from database...")
    
    try:
        # Fetch all courses with their titles
        response = supabase.table('courses').select('id, title, dept, level').order('id').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ No courses found in database")
            return
        
        print(f"📚 Found {len(courses)} courses in database")
        print("\n" + "="*80)
        print("ALL COURSE TITLES:")
        print("="*80)
        
        # Group by department for better organization
        dept_courses = {}
        for course in courses:
            dept = course.get('dept', 'Unknown')
            if dept not in dept_courses:
                dept_courses[dept] = []
            dept_courses[dept].append(course)
        
        # Print courses by department
        for dept in sorted(dept_courses.keys()):
            print(f"\n📋 {dept} DEPARTMENT ({len(dept_courses[dept])} courses):")
            print("-" * 50)
            
            for course in sorted(dept_courses[dept], key=lambda x: x.get('id', '')):
                course_id = course.get('id', 'Unknown')
                title = course.get('title', 'No title')
                level = course.get('level', 'Unknown')
                
                print(f"  {course_id} (Level {level}): {title}")
        
        # Summary
        print(f"\n" + "="*80)
        print("SUMMARY:")
        print(f"Total courses: {len(courses)}")
        print(f"Departments: {len(dept_courses)}")
        
        # Count courses per department
        print(f"\nCourses per department:")
        for dept in sorted(dept_courses.keys()):
            print(f"  {dept}: {len(dept_courses[dept])} courses")
        
    except Exception as e:
        print(f"❌ Error getting course titles: {e}")

if __name__ == "__main__":
    get_all_course_titles()
