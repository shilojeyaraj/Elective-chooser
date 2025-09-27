#!/usr/bin/env python3
"""
Script to find courses missing names, descriptions, and prerequisites
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

def find_critical_missing_courses():
    """Find courses missing names, descriptions, and prerequisites"""
    print("🚨 CRITICAL COURSES MISSING NAMES, DESCRIPTIONS, AND PREREQUISITES")
    print("=" * 70)
    
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
        
        # Categories of critical issues
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
            if (not title or 
                title.strip() == '' or
                title.lower() in ['course', 'elective', 'technical elective', 'approved elective'] or
                title.startswith(f"{course_id} - ") or
                title == course_id or
                title.endswith(' - Course Title')):
                missing_names.append(course_id)
            
            # Check for missing/empty descriptions
            if (not description or 
                description.strip() == '' or
                description.lower().startswith('course from') or
                description.lower().startswith('description for') or
                description.lower().startswith('introduction to') or
                description.lower().startswith('advanced') or
                description.lower().startswith('course') or
                description.lower().startswith('elective') or
                len(description.strip()) < 20):
                missing_descriptions.append(course_id)
            
            # Check for missing prerequisites
            if not prereqs or prereqs.strip() == '':
                missing_prerequisites.append(course_id)
            
            # Check if course is missing all three critical elements
            if (course_id in missing_names and 
                course_id in missing_descriptions and 
                course_id in missing_prerequisites):
                critical_courses.append(course_id)
        
        # Print results
        print(f"\n1️⃣ COURSES MISSING NAMES ({len(missing_names)} courses):")
        print("-" * 50)
        for i, course_id in enumerate(missing_names, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n2️⃣ COURSES MISSING DESCRIPTIONS ({len(missing_descriptions)} courses):")
        print("-" * 50)
        for i, course_id in enumerate(missing_descriptions, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n3️⃣ COURSES MISSING PREREQUISITES ({len(missing_prerequisites)} courses):")
        print("-" * 50)
        for i, course_id in enumerate(missing_prerequisites, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n🚨 CRITICAL COURSES MISSING ALL THREE ({len(critical_courses)} courses):")
        print("-" * 60)
        for i, course_id in enumerate(critical_courses, 1):
            print(f"{i:3d}. {course_id}")
        
        # Show details for critical courses
        if critical_courses:
            print(f"\n📋 DETAILS FOR CRITICAL COURSES:")
            print("-" * 60)
            for course_id in critical_courses[:20]:  # Show first 20
                # Find the course details
                for course in courses:
                    if course.get('id') == course_id:
                        print(f"\n{course_id}:")
                        print(f"  Title: '{course.get('title', 'N/A')}'")
                        print(f"  Description: '{course.get('description', 'N/A')}'")
                        print(f"  Prerequisites: '{course.get('prereqs', 'N/A')}'")
                        print(f"  Department: {course.get('dept', 'N/A')}")
                        print(f"  Level: {course.get('level', 'N/A')}")
                        break
            
            if len(critical_courses) > 20:
                print(f"\n... and {len(critical_courses) - 20} more critical courses")
        
        # Summary by department for critical courses
        if critical_courses:
            print(f"\n📊 CRITICAL COURSES BY DEPARTMENT:")
            print("-" * 40)
            dept_counts = {}
            for course_id in critical_courses:
                dept = course_id[:2] if len(course_id) >= 2 else 'Unknown'
                dept_counts[dept] = dept_counts.get(dept, 0) + 1
            
            for dept, count in sorted(dept_counts.items()):
                print(f"{dept}: {count} courses")
        
        # Overall summary
        print(f"\n📈 SUMMARY:")
        print(f"Total courses in database: {len(courses)}")
        print(f"Courses missing names: {len(missing_names)}")
        print(f"Courses missing descriptions: {len(missing_descriptions)}")
        print(f"Courses missing prerequisites: {len(missing_prerequisites)}")
        print(f"Critical courses (missing all three): {len(critical_courses)}")
        print(f"Percentage of critical courses: {(len(critical_courses) / len(courses) * 100):.1f}%")
        
        # Priority recommendations
        print(f"\n🎯 PRIORITY RECOMMENDATIONS:")
        print("-" * 30)
        if critical_courses:
            print(f"1. Start with the {len(critical_courses)} critical courses missing all three elements")
            print(f"2. Focus on departments with most critical courses:")
            if critical_courses:
                dept_counts = {}
                for course_id in critical_courses:
                    dept = course_id[:2] if len(course_id) >= 2 else 'Unknown'
                    dept_counts[dept] = dept_counts.get(dept, 0) + 1
                
                top_depts = sorted(dept_counts.items(), key=lambda x: x[1], reverse=True)[:5]
                for dept, count in top_depts:
                    print(f"   - {dept}: {count} critical courses")
        else:
            print("✅ No courses are missing all three critical elements!")
        
    except Exception as e:
        print(f"❌ Error analyzing courses: {e}")

if __name__ == "__main__":
    find_critical_missing_courses()
