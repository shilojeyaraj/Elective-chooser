#!/usr/bin/env python3
"""
Script to get course codes for all incomplete courses in ME, NE, PHYS, and SYDE
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

def get_incomplete_courses_codes():
    """Get course codes for all incomplete courses in ME, NE, PHYS, and SYDE"""
    print("🔍 Getting course codes for all incomplete courses...")
    
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
            print(f"\n📚 {dept} DEPARTMENT - ALL INCOMPLETE COURSES:")
            print("=" * 50)
            
            # Get all courses for this department
            dept_courses = [course for course in courses if course.get('dept') == dept]
            
            # Separate into different categories
            missing_names = []
            missing_descriptions = []
            missing_prerequisites = []
            all_incomplete = []
            
            for course in dept_courses:
                course_id = course.get('id', '')
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
                
                # Add to appropriate lists
                if has_generic_name:
                    missing_names.append(course_id)
                if has_generic_description:
                    missing_descriptions.append(course_id)
                if has_missing_prereqs:
                    missing_prerequisites.append(course_id)
                
                # If any issue, add to all incomplete
                if has_generic_name or has_generic_description or has_missing_prereqs:
                    all_incomplete.append(course_id)
            
            # Sort all lists
            missing_names.sort()
            missing_descriptions.sort()
            missing_prerequisites.sort()
            all_incomplete.sort()
            
            # Print results
            print(f"📝 Missing Names ({len(missing_names)} courses):")
            if missing_names:
                for i in range(0, len(missing_names), 8):
                    row_courses = missing_names[i:i+8]
                    print("  " + "  ".join(f"{course:8}" for course in row_courses))
            else:
                print("  ✅ All courses have proper names")
            
            print(f"\n📄 Missing Descriptions ({len(missing_descriptions)} courses):")
            if missing_descriptions:
                for i in range(0, len(missing_descriptions), 8):
                    row_courses = missing_descriptions[i:i+8]
                    print("  " + "  ".join(f"{course:8}" for course in row_courses))
            else:
                print("  ✅ All courses have proper descriptions")
            
            print(f"\n📋 Missing Prerequisites ({len(missing_prerequisites)} courses):")
            if missing_prerequisites:
                for i in range(0, len(missing_prerequisites), 8):
                    row_courses = missing_prerequisites[i:i+8]
                    print("  " + "  ".join(f"{course:8}" for course in row_courses))
            else:
                print("  ✅ All courses have prerequisites")
            
            print(f"\n🚨 ALL INCOMPLETE COURSES ({len(all_incomplete)} courses):")
            if all_incomplete:
                for i in range(0, len(all_incomplete), 8):
                    row_courses = all_incomplete[i:i+8]
                    print("  " + "  ".join(f"{course:8}" for course in row_courses))
            else:
                print("  ✅ All courses are complete!")
            
            print(f"\n📊 {dept} SUMMARY:")
            print(f"  Total {dept} courses: {len(dept_courses)}")
            print(f"  Missing names: {len(missing_names)}")
            print(f"  Missing descriptions: {len(missing_descriptions)}")
            print(f"  Missing prerequisites: {len(missing_prerequisites)}")
            print(f"  Total incomplete: {len(all_incomplete)}")
        
        # Overall summary
        print(f"\n🏆 OVERALL SUMMARY:")
        print("=" * 30)
        total_incomplete = 0
        for dept in target_departments:
            dept_courses = [course for course in courses if course.get('dept') == dept]
            incomplete_count = 0
            
            for course in dept_courses:
                title = course.get('title', '')
                description = course.get('description', '')
                prereqs = course.get('prereqs', '')
                
                has_issue = (
                    (not title or title.strip() == '' or title.lower() in ['course', 'elective', 'technical elective', 'approved elective'] or title.startswith(f"{course.get('id', '')} - ") or title == course.get('id', '') or title.endswith(' - Course Title') or title.endswith(' - Course')) or
                    (not description or description.strip() == '' or description.lower().startswith('course from') or description.lower().startswith('description for') or description.lower().startswith('introduction to') or description.lower().startswith('advanced') or description.lower().startswith('course') or description.lower().startswith('elective') or len(description.strip()) < 20) or
                    (not prereqs or prereqs.strip() == '')
                )
                
                if has_issue:
                    incomplete_count += 1
            
            total_incomplete += incomplete_count
            print(f"  {dept}: {incomplete_count} incomplete courses")
        
        print(f"\n  TOTAL INCOMPLETE: {total_incomplete} courses")
        
    except Exception as e:
        print(f"❌ Error analyzing courses: {e}")

if __name__ == "__main__":
    get_incomplete_courses_codes()
