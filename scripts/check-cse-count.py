#!/usr/bin/env python3
"""
Check how many CSE (Complementary Studies Electives) courses are in the database
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def get_supabase_client():
    """Initialize Supabase client"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables")
        sys.exit(1)
    
    return create_client(url, key)

def check_cse_courses():
    """Check CSE courses in the database"""
    supabase = get_supabase_client()
    
    print("🔍 Checking CSE courses in database...")
    
    # CSE departments (non-engineering, non-math, non-science)
    cse_departments = [
        'ANTH', 'BET', 'CLAS', 'ENGL', 'HIST', 'PHIL', 'PSYCH', 'SOC', 'STV',
        'MSE', 'CS492', 'COMMST', 'WKRPT'
    ]
    
    # Check by department
    total_cse = 0
    dept_counts = {}
    
    for dept in cse_departments:
        try:
            result = supabase.table('courses').select('id, title, dept, cse_classification').eq('dept', dept).execute()
            count = len(result.data) if result.data else 0
            dept_counts[dept] = count
            total_cse += count
            
            if count > 0:
                print(f"  {dept}: {count} courses")
        except Exception as e:
            print(f"  {dept}: Error - {e}")
    
    # Check by CSE classification
    print("\n🔍 Checking by CSE classification...")
    try:
        result = supabase.table('courses').select('id, title, dept, cse_classification').not_.is_('cse_classification', 'null').execute()
        classified_cse = len(result.data) if result.data else 0
        print(f"  Courses with CSE classification: {classified_cse}")
        
        # Show breakdown by classification
        if result.data:
            classifications = {}
            for course in result.data:
                classification = course.get('cse_classification', 'Unknown')
                classifications[classification] = classifications.get(classification, 0) + 1
            
            for classification, count in classifications.items():
                print(f"    {classification}: {count} courses")
    except Exception as e:
        print(f"  Error checking CSE classifications: {e}")
    
    # Check for courses with "complementary studies" in skills
    print("\n🔍 Checking courses with 'complementary studies' in skills...")
    try:
        result = supabase.table('courses').select('id, title, dept, skills').contains('skills', ['complementary studies']).execute()
        skills_cse = len(result.data) if result.data else 0
        print(f"  Courses with 'complementary studies' skill: {skills_cse}")
    except Exception as e:
        print(f"  Error checking skills: {e}")
    
    # Get total course count for comparison
    try:
        result = supabase.table('courses').select('id', count='exact').execute()
        total_courses = result.count if result.count else 0
        print(f"\n📊 Total courses in database: {total_courses}")
        print(f"📊 CSE courses (by department): {total_cse}")
        print(f"📊 CSE percentage: {(total_cse/total_courses*100):.1f}%" if total_courses > 0 else "N/A")
    except Exception as e:
        print(f"  Error getting total count: {e}")
    
    # Show some examples
    print("\n📚 Sample CSE courses:")
    try:
        result = supabase.table('courses').select('id, title, dept, cse_classification').in_('dept', cse_departments).limit(10).execute()
        if result.data:
            for course in result.data:
                classification = course.get('cse_classification', 'N/A')
                print(f"  {course['id']} - {course['title']} ({course['dept']}) - Classification: {classification}")
        else:
            print("  No CSE courses found")
    except Exception as e:
        print(f"  Error getting sample courses: {e}")

if __name__ == "__main__":
    check_cse_courses()
