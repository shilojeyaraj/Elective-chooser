#!/usr/bin/env python3
"""
Script to check course quality in the database and identify courses with poor descriptions/titles
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

def is_poor_description(description):
    """Check if a description is poor quality"""
    if not description:
        return True, "No description"
    
    description = description.strip()
    
    # Check for very short descriptions
    if len(description) < 20:
        return True, f"Too short ({len(description)} chars)"
    
    # Check for generic/placeholder descriptions
    poor_patterns = [
        r'^[A-Z]{2,4}\d{3}.*course$',  # "CS123 Course"
        r'^[A-Z]{2,4}\d{3}.*-.*course$',  # "CS123 - Course"
        r'^course$',  # Just "Course"
        r'^[A-Z]{2,4}\d{3}$',  # Just course code
        r'^[A-Z]{2,4}\d{3}\s*-\s*$',  # "CS123 - "
        r'^introduction to.*$',  # Too generic
        r'^advanced.*$',  # Too generic
        r'^special topics.*$',  # Too generic
        r'^elective.*$',  # Too generic
        r'^technical elective.*$',  # Too generic
        r'^approved elective.*$',  # Too generic
        r'^or approved.*elective.*$',  # Too generic
    ]
    
    for pattern in poor_patterns:
        if re.match(pattern, description, re.IGNORECASE):
            return True, f"Generic pattern: {pattern}"
    
    # Check for descriptions that are just the title repeated
    return False, "OK"

def is_poor_title(title):
    """Check if a title is poor quality"""
    if not title:
        return True, "No title"
    
    title = title.strip()
    
    # Check for very short titles
    if len(title) < 5:
        return True, f"Too short ({len(title)} chars)"
    
    # Check for generic/placeholder titles
    poor_patterns = [
        r'^[A-Z]{2,4}\d{3}$',  # Just course code
        r'^[A-Z]{2,4}\d{3}\s*-\s*$',  # "CS123 - "
        r'^[A-Z]{2,4}\d{3}\s*-\s*course$',  # "CS123 - Course"
        r'^course$',  # Just "Course"
        r'^elective$',  # Just "Elective"
        r'^technical elective$',  # Too generic
        r'^approved elective$',  # Too generic
        r'^special topics$',  # Too generic
        r'^introduction to$',  # Incomplete
        r'^advanced$',  # Too generic
    ]
    
    for pattern in poor_patterns:
        if re.match(pattern, title, re.IGNORECASE):
            return True, f"Generic pattern: {pattern}"
    
    return False, "OK"

def analyze_courses():
    """Analyze all courses in the database"""
    print("🔍 Fetching all courses from database...")
    
    try:
        # Fetch all courses
        response = supabase.table('courses').select('id, title, description, dept, level').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ No courses found in database")
            return
        
        print(f"📚 Found {len(courses)} courses in database")
        
        # Analyze courses
        poor_quality_courses = []
        
        for course in courses:
            course_id = course.get('id', 'Unknown')
            title = course.get('title', '')
            description = course.get('description', '')
            dept = course.get('dept', 'Unknown')
            level = course.get('level', 'Unknown')
            
            title_issues = []
            desc_issues = []
            
            # Check title quality
            is_poor_title_result, title_reason = is_poor_title(title)
            if is_poor_title_result:
                title_issues.append(title_reason)
            
            # Check description quality
            is_poor_desc_result, desc_reason = is_poor_description(description)
            if is_poor_desc_result:
                desc_issues.append(desc_reason)
            
            # If there are issues, add to poor quality list
            if title_issues or desc_issues:
                poor_quality_courses.append({
                    'id': course_id,
                    'title': title,
                    'description': description,
                    'dept': dept,
                    'level': level,
                    'title_issues': title_issues,
                    'desc_issues': desc_issues
                })
        
        # Report results
        print(f"\n📊 ANALYSIS RESULTS:")
        print(f"Total courses: {len(courses)}")
        print(f"Poor quality courses: {len(poor_quality_courses)}")
        print(f"Good quality courses: {len(courses) - len(poor_quality_courses)}")
        print(f"Quality percentage: {((len(courses) - len(poor_quality_courses)) / len(courses) * 100):.1f}%")
        
        if poor_quality_courses:
            print(f"\n❌ POOR QUALITY COURSES ({len(poor_quality_courses)} courses):")
            print("=" * 80)
            
            for course in poor_quality_courses:
                print(f"\n📋 {course['id']} - {course['dept']} (Level {course['level']})")
                print(f"   Title: '{course['title']}'")
                if course['title_issues']:
                    print(f"   Title Issues: {', '.join(course['title_issues'])}")
                
                print(f"   Description: '{course['description'][:100]}{'...' if len(course['description']) > 100 else ''}'")
                if course['desc_issues']:
                    print(f"   Description Issues: {', '.join(course['desc_issues'])}")
            
            # Group by department
            print(f"\n📈 BREAKDOWN BY DEPARTMENT:")
            dept_counts = {}
            for course in poor_quality_courses:
                dept = course['dept']
                dept_counts[dept] = dept_counts.get(dept, 0) + 1
            
            for dept, count in sorted(dept_counts.items()):
                print(f"   {dept}: {count} courses")
            
            # Group by issue type
            print(f"\n🔍 BREAKDOWN BY ISSUE TYPE:")
            title_issue_counts = {}
            desc_issue_counts = {}
            
            for course in poor_quality_courses:
                for issue in course['title_issues']:
                    title_issue_counts[issue] = title_issue_counts.get(issue, 0) + 1
                for issue in course['desc_issues']:
                    desc_issue_counts[issue] = desc_issue_counts.get(issue, 0) + 1
            
            print("   Title Issues:")
            for issue, count in sorted(title_issue_counts.items()):
                print(f"     {issue}: {count} courses")
            
            print("   Description Issues:")
            for issue, count in sorted(desc_issue_counts.items()):
                print(f"     {issue}: {count} courses")
        
        else:
            print("\n✅ All courses have good quality titles and descriptions!")
        
    except Exception as e:
        print(f"❌ Error analyzing courses: {e}")

if __name__ == "__main__":
    analyze_courses()
