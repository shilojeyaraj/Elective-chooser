#!/usr/bin/env python3
"""
Script to find courses missing proper details or descriptions
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

def find_incomplete_courses():
    """Find courses missing proper details or descriptions"""
    print("🔍 Finding courses with missing or incomplete details...")
    
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
        
        print(f"📚 Analyzing {len(courses)} courses...")
        
        # Categories of incomplete courses
        missing_titles = []
        missing_descriptions = []
        generic_titles = []
        generic_descriptions = []
        missing_prerequisites = []
        missing_terms_offered = []
        missing_skills = []
        missing_workload = []
        
        for course in courses:
            course_id = course.get('id', 'Unknown')
            title = course.get('title', '')
            description = course.get('description', '')
            prereqs = course.get('prereqs', '')
            terms_offered = course.get('terms_offered', [])
            skills = course.get('skills', [])
            workload = course.get('workload', {})
            
            # Check for missing titles
            if not title or title.strip() == '':
                missing_titles.append(course_id)
            
            # Check for generic titles
            elif (title.lower() in ['course', 'elective', 'technical elective', 'approved elective'] or
                  title.startswith(f"{course_id} - ") or
                  title == course_id):
                generic_titles.append((course_id, title))
            
            # Check for missing descriptions
            if not description or description.strip() == '':
                missing_descriptions.append(course_id)
            
            # Check for generic descriptions
            elif (description.lower().startswith('introduction to') or
                  description.lower().startswith('advanced') or
                  description.lower().startswith('course') or
                  description.lower().startswith('elective') or
                  len(description.strip()) < 20):
                generic_descriptions.append((course_id, description[:100] + '...' if len(description) > 100 else description))
            
            # Check for missing prerequisites info
            if not prereqs or prereqs.strip() == '':
                missing_prerequisites.append(course_id)
            
            # Check for missing terms offered
            if not terms_offered or (isinstance(terms_offered, list) and len(terms_offered) == 0):
                missing_terms_offered.append(course_id)
            
            # Check for missing skills
            if not skills or (isinstance(skills, list) and len(skills) == 0):
                missing_skills.append(course_id)
            
            # Check for missing workload info
            if not workload or (isinstance(workload, dict) and len(workload) == 0):
                missing_workload.append(course_id)
        
        # Report results
        print(f"\n📊 INCOMPLETE COURSES ANALYSIS:")
        print("=" * 60)
        
        print(f"\n❌ MISSING TITLES ({len(missing_titles)} courses):")
        if missing_titles:
            for course_id in missing_titles[:10]:  # Show first 10
                print(f"  - {course_id}")
            if len(missing_titles) > 10:
                print(f"  ... and {len(missing_titles) - 10} more")
        else:
            print("  ✅ All courses have titles")
        
        print(f"\n❌ GENERIC TITLES ({len(generic_titles)} courses):")
        if generic_titles:
            for course_id, title in generic_titles[:10]:  # Show first 10
                print(f"  - {course_id}: '{title}'")
            if len(generic_titles) > 10:
                print(f"  ... and {len(generic_titles) - 10} more")
        else:
            print("  ✅ All courses have proper titles")
        
        print(f"\n❌ MISSING DESCRIPTIONS ({len(missing_descriptions)} courses):")
        if missing_descriptions:
            for course_id in missing_descriptions[:10]:  # Show first 10
                print(f"  - {course_id}")
            if len(missing_descriptions) > 10:
                print(f"  ... and {len(missing_descriptions) - 10} more")
        else:
            print("  ✅ All courses have descriptions")
        
        print(f"\n❌ GENERIC DESCRIPTIONS ({len(generic_descriptions)} courses):")
        if generic_descriptions:
            for course_id, desc in generic_descriptions[:10]:  # Show first 10
                print(f"  - {course_id}: '{desc}'")
            if len(generic_descriptions) > 10:
                print(f"  ... and {len(generic_descriptions) - 10} more")
        else:
            print("  ✅ All courses have proper descriptions")
        
        print(f"\n❌ MISSING PREREQUISITES ({len(missing_prerequisites)} courses):")
        if missing_prerequisites:
            for course_id in missing_prerequisites[:10]:  # Show first 10
                print(f"  - {course_id}")
            if len(missing_prerequisites) > 10:
                print(f"  ... and {len(missing_prerequisites) - 10} more")
        else:
            print("  ✅ All courses have prerequisite info")
        
        print(f"\n❌ MISSING TERMS OFFERED ({len(missing_terms_offered)} courses):")
        if missing_terms_offered:
            for course_id in missing_terms_offered[:10]:  # Show first 10
                print(f"  - {course_id}")
            if len(missing_terms_offered) > 10:
                print(f"  ... and {len(missing_terms_offered) - 10} more")
        else:
            print("  ✅ All courses have terms offered info")
        
        print(f"\n❌ MISSING SKILLS ({len(missing_skills)} courses):")
        if missing_skills:
            for course_id in missing_skills[:10]:  # Show first 10
                print(f"  - {course_id}")
            if len(missing_skills) > 10:
                print(f"  ... and {len(missing_skills) - 10} more")
        else:
            print("  ✅ All courses have skills info")
        
        print(f"\n❌ MISSING WORKLOAD INFO ({len(missing_workload)} courses):")
        if missing_workload:
            for course_id in missing_workload[:10]:  # Show first 10
                print(f"  - {course_id}")
            if len(missing_workload) > 10:
                print(f"  ... and {len(missing_workload) - 10} more")
        else:
            print("  ✅ All courses have workload info")
        
        # Summary
        total_issues = (len(missing_titles) + len(generic_titles) + 
                       len(missing_descriptions) + len(generic_descriptions) + 
                       len(missing_prerequisites) + len(missing_terms_offered) + 
                       len(missing_skills) + len(missing_workload))
        
        print(f"\n📈 SUMMARY:")
        print(f"Total courses analyzed: {len(courses)}")
        print(f"Total issues found: {total_issues}")
        print(f"Completion rate: {((len(courses) * 8 - total_issues) / (len(courses) * 8) * 100):.1f}%")
        
        # Most problematic courses (courses with multiple issues)
        print(f"\n🚨 MOST PROBLEMATIC COURSES:")
        course_issues = {}
        
        for course in courses:
            course_id = course.get('id', 'Unknown')
            issues = 0
            
            title = course.get('title', '')
            description = course.get('description', '')
            prereqs = course.get('prereqs', '')
            terms_offered = course.get('terms_offered', [])
            skills = course.get('skills', [])
            workload = course.get('workload', {})
            
            if not title or title.strip() == '' or title.lower() in ['course', 'elective'] or title.startswith(f"{course_id} - "):
                issues += 1
            if not description or description.strip() == '' or len(description.strip()) < 20:
                issues += 1
            if not prereqs or prereqs.strip() == '':
                issues += 1
            if not terms_offered or (isinstance(terms_offered, list) and len(terms_offered) == 0):
                issues += 1
            if not skills or (isinstance(skills, list) and len(skills) == 0):
                issues += 1
            if not workload or (isinstance(workload, dict) and len(workload) == 0):
                issues += 1
            
            if issues >= 3:  # Courses with 3+ issues
                course_issues[course_id] = issues
        
        if course_issues:
            sorted_issues = sorted(course_issues.items(), key=lambda x: x[1], reverse=True)
            for course_id, issue_count in sorted_issues[:10]:  # Top 10 most problematic
                print(f"  - {course_id}: {issue_count} issues")
        else:
            print("  ✅ No courses with multiple major issues found")
        
    except Exception as e:
        print(f"❌ Error analyzing courses: {e}")

if __name__ == "__main__":
    find_incomplete_courses()
