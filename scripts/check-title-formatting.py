#!/usr/bin/env python3
"""
Script to check course title formatting issues
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import re

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

def check_title_formatting():
    """Check for title formatting issues"""
    print("🔍 Checking course title formatting...")
    
    try:
        # Fetch courses with title formatting issues
        response = supabase.table('courses').select('id, title, description, dept').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ No courses found in database")
            return
        
        print(f"📚 Found {len(courses)} courses in database")
        
        # Check for title formatting issues
        formatting_issues = []
        
        for course in courses:
            course_id = course.get('id', '')
            title = course.get('title', '')
            dept = course.get('dept', '')
            
            # Check if title starts with course ID
            if title and course_id:
                # Pattern: "COURSE123 - Title" or "COURSE123 Title"
                if title.startswith(f"{course_id} - ") or title.startswith(f"{course_id} "):
                    formatting_issues.append({
                        'id': course_id,
                        'title': title,
                        'dept': dept,
                        'issue': 'Title starts with course ID'
                    })
                # Pattern: "COURSE123-Course" (no space)
                elif title.startswith(f"{course_id}-"):
                    formatting_issues.append({
                        'id': course_id,
                        'title': title,
                        'dept': dept,
                        'issue': 'Title starts with course ID (no space)'
                    })
        
        # Report results
        if formatting_issues:
            print(f"\n❌ TITLE FORMATTING ISSUES ({len(formatting_issues)} courses):")
            print("=" * 80)
            
            for course in formatting_issues:
                print(f"\n📋 {course['id']} - {course['dept']}")
                print(f"   Current Title: '{course['title']}'")
                print(f"   Issue: {course['issue']}")
                
                # Suggest corrected title
                if course['issue'] == 'Title starts with course ID':
                    corrected = course['title'].replace(f"{course['id']} - ", "", 1)
                    print(f"   Suggested: '{corrected}'")
                elif course['issue'] == 'Title starts with course ID (no space)':
                    corrected = course['title'].replace(f"{course['id']}-", "", 1)
                    print(f"   Suggested: '{corrected}'")
            
            # Group by department
            print(f"\n📈 BREAKDOWN BY DEPARTMENT:")
            dept_counts = {}
            for course in formatting_issues:
                dept = course['dept']
                dept_counts[dept] = dept_counts.get(dept, 0) + 1
            
            for dept, count in sorted(dept_counts.items()):
                print(f"   {dept}: {count} courses")
            
            # Show some examples
            print(f"\n🔍 EXAMPLES OF ISSUES:")
            for i, course in enumerate(formatting_issues[:10]):  # Show first 10
                print(f"   {i+1}. {course['id']}: '{course['title']}'")
            
            if len(formatting_issues) > 10:
                print(f"   ... and {len(formatting_issues) - 10} more")
        
        else:
            print("\n✅ No title formatting issues found!")
        
    except Exception as e:
        print(f"❌ Error checking title formatting: {e}")

if __name__ == "__main__":
    check_title_formatting()
