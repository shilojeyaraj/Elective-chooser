#!/usr/bin/env python3
"""
Script to get specific lists of critical courses and courses missing names
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

def get_specific_issues():
    """Get specific lists of critical courses and courses missing names"""
    print("🔍 Analyzing courses for specific issues...")
    
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
        
        # Categories
        missing_names = []
        missing_descriptions = []
        missing_prerequisites = []
        critical_courses = []  # Courses missing all three
        
        for course in courses:
            course_id = course.get('id', 'Unknown')
            title = course.get('title', '')
            description = course.get('description', '')
            prereqs = course.get('prereqs', '')
            
            # Check for missing/empty names
            has_generic_name = (
                not title or 
                title.strip() == '' or
                title.lower() in ['course', 'elective', 'technical elective', 'approved elective'] or
                title.startswith(f"{course_id} - ") or
                title == course_id or
                title.endswith(' - Course Title') or
                title.endswith(' - Course')
            )
            
            # Check for missing/empty descriptions
            has_generic_description = (
                not description or 
                description.strip() == '' or
                description.lower().startswith('course from') or
                description.lower().startswith('description for') or
                description.lower().startswith('introduction to') or
                description.lower().startswith('advanced') or
                description.lower().startswith('course') or
                description.lower().startswith('elective') or
                len(description.strip()) < 20
            )
            
            # Check for missing prerequisites
            has_missing_prereqs = not prereqs or prereqs.strip() == ''
            
            if has_generic_name:
                missing_names.append(course_id)
            
            if has_generic_description:
                missing_descriptions.append(course_id)
            
            if has_missing_prereqs:
                missing_prerequisites.append(course_id)
            
            # Check if course is missing all three critical elements
            if has_generic_name and has_generic_description and has_missing_prereqs:
                critical_courses.append(course_id)
        
        # Print results
        print(f"\n🚨 CRITICAL COURSES MISSING ALL THREE ({len(critical_courses)} courses):")
        print("=" * 60)
        for i, course_id in enumerate(critical_courses, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n📝 COURSES MISSING NAMES ({len(missing_names)} courses):")
        print("=" * 50)
        for i, course_id in enumerate(missing_names, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n📄 COURSES MISSING DESCRIPTIONS ({len(missing_descriptions)} courses):")
        print("=" * 55)
        for i, course_id in enumerate(missing_descriptions, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n📋 COURSES MISSING PREREQUISITES ({len(missing_prerequisites)} courses):")
        print("=" * 55)
        for i, course_id in enumerate(missing_prerequisites, 1):
            print(f"{i:3d}. {course_id}")
        
        # Summary
        print(f"\n📊 SUMMARY:")
        print(f"Total courses in database: {len(courses)}")
        print(f"Critical courses (missing all three): {len(critical_courses)}")
        print(f"Courses missing names: {len(missing_names)}")
        print(f"Courses missing descriptions: {len(missing_descriptions)}")
        print(f"Courses missing prerequisites: {len(missing_prerequisites)}")
        
        # Breakdown by department for critical courses
        if critical_courses:
            print(f"\n📈 CRITICAL COURSES BY DEPARTMENT:")
            dept_counts = {}
            for course_id in critical_courses:
                dept = course_id[:2] if len(course_id) >= 2 else 'Unknown'
                dept_counts[dept] = dept_counts.get(dept, 0) + 1
            
            for dept, count in sorted(dept_counts.items()):
                print(f"  {dept}: {count} courses")
        
    except Exception as e:
        print(f"❌ Error analyzing courses: {e}")

if __name__ == "__main__":
    get_specific_issues()
