#!/usr/bin/env python3
"""
Script to list all courses that need to be updated with their codes
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

def list_courses_to_update():
    """List all courses that need to be updated"""
    print("📋 COURSES THAT NEED TO BE UPDATED")
    print("=" * 60)
    
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
        
        # Categories of courses to update
        generic_titles = []
        generic_descriptions = []
        missing_prerequisites = []
        missing_skills = []
        missing_terms_offered = []
        
        for course in courses:
            course_id = course.get('id', 'Unknown')
            title = course.get('title', '')
            description = course.get('description', '')
            prereqs = course.get('prereqs', '')
            terms_offered = course.get('terms_offered', [])
            skills = course.get('skills', [])
            
            # Check for generic titles
            if (title.lower() in ['course', 'elective', 'technical elective', 'approved elective'] or
                  title.startswith(f"{course_id} - ") or
                  title == course_id or
                  title.endswith(' - Course Title')):
                generic_titles.append(course_id)
            
            # Check for generic descriptions
            if (description.lower().startswith('course from') or
                  description.lower().startswith('description for') or
                  description.lower().startswith('introduction to') or
                  description.lower().startswith('advanced') or
                  description.lower().startswith('course') or
                  description.lower().startswith('elective') or
                  len(description.strip()) < 20):
                generic_descriptions.append(course_id)
            
            # Check for missing prerequisites
            if not prereqs or prereqs.strip() == '':
                missing_prerequisites.append(course_id)
            
            # Check for missing terms offered
            if not terms_offered or (isinstance(terms_offered, list) and len(terms_offered) == 0):
                missing_terms_offered.append(course_id)
            
            # Check for missing skills
            if not skills or (isinstance(skills, list) and len(skills) == 0):
                missing_skills.append(course_id)
        
        # Print organized lists
        print(f"\n1️⃣ GENERIC TITLES ({len(generic_titles)} courses):")
        print("-" * 40)
        for i, course_id in enumerate(generic_titles, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n2️⃣ GENERIC DESCRIPTIONS ({len(generic_descriptions)} courses):")
        print("-" * 40)
        for i, course_id in enumerate(generic_descriptions, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n3️⃣ MISSING PREREQUISITES ({len(missing_prerequisites)} courses):")
        print("-" * 40)
        for i, course_id in enumerate(missing_prerequisites, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n4️⃣ MISSING SKILLS ({len(missing_skills)} courses):")
        print("-" * 40)
        for i, course_id in enumerate(missing_skills, 1):
            print(f"{i:3d}. {course_id}")
        
        print(f"\n5️⃣ MISSING TERMS OFFERED ({len(missing_terms_offered)} courses):")
        print("-" * 40)
        for i, course_id in enumerate(missing_terms_offered, 1):
            print(f"{i:3d}. {course_id}")
        
        # Combined list of all courses that need updates
        all_courses_to_update = set()
        all_courses_to_update.update(generic_titles)
        all_courses_to_update.update(generic_descriptions)
        all_courses_to_update.update(missing_prerequisites)
        all_courses_to_update.update(missing_skills)
        all_courses_to_update.update(missing_terms_offered)
        
        print(f"\n📋 ALL COURSES THAT NEED UPDATES ({len(all_courses_to_update)} unique courses):")
        print("-" * 50)
        sorted_courses = sorted(list(all_courses_to_update))
        for i, course_id in enumerate(sorted_courses, 1):
            print(f"{i:3d}. {course_id}")
        
        # Summary by department
        print(f"\n📊 SUMMARY BY DEPARTMENT:")
        print("-" * 30)
        dept_counts = {}
        for course_id in sorted_courses:
            dept = course_id[:2] if len(course_id) >= 2 else 'Unknown'
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
        for dept, count in sorted(dept_counts.items()):
            print(f"{dept}: {count} courses")
        
        # Most problematic courses (courses with multiple issues)
        print(f"\n🚨 MOST PROBLEMATIC COURSES (3+ issues):")
        print("-" * 40)
        course_issues = {}
        
        for course in courses:
            course_id = course.get('id', 'Unknown')
            issues = 0
            
            title = course.get('title', '')
            description = course.get('description', '')
            prereqs = course.get('prereqs', '')
            terms_offered = course.get('terms_offered', [])
            skills = course.get('skills', [])
            
            if (title.lower() in ['course', 'elective', 'technical elective', 'approved elective'] or
                  title.startswith(f"{course_id} - ") or
                  title == course_id or
                  title.endswith(' - Course Title')):
                issues += 1
            if (description.lower().startswith('course from') or
                  description.lower().startswith('description for') or
                  description.lower().startswith('introduction to') or
                  description.lower().startswith('advanced') or
                  description.lower().startswith('course') or
                  description.lower().startswith('elective') or
                  len(description.strip()) < 20):
                issues += 1
            if not prereqs or prereqs.strip() == '':
                issues += 1
            if not terms_offered or (isinstance(terms_offered, list) and len(terms_offered) == 0):
                issues += 1
            if not skills or (isinstance(skills, list) and len(skills) == 0):
                issues += 1
            
            if issues >= 3:  # Courses with 3+ issues
                course_issues[course_id] = issues
        
        if course_issues:
            sorted_issues = sorted(course_issues.items(), key=lambda x: x[1], reverse=True)
            for course_id, issue_count in sorted_issues:
                print(f"{course_id}: {issue_count} issues")
        else:
            print("No courses with 3+ issues found")
        
        print(f"\n📈 TOTAL SUMMARY:")
        print(f"Total courses in database: {len(courses)}")
        print(f"Courses needing updates: {len(all_courses_to_update)}")
        print(f"Percentage needing updates: {(len(all_courses_to_update) / len(courses) * 100):.1f}%")
        
    except Exception as e:
        print(f"❌ Error analyzing courses: {e}")

if __name__ == "__main__":
    list_courses_to_update()
