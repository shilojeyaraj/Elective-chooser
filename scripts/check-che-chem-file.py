#!/usr/bin/env python3
"""
Script to check the structure of uw_courses_CHE_AND_CHEM.json
"""

import json

def check_file():
    try:
        with open('uw_courses_CHE_AND_CHEM.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"📚 Total courses: {len(data)}")
        print("\n📋 Sample courses:")
        for i, course in enumerate(data[:10]):
            print(f"  {i+1}. {course['code']}: {course['title']}")
        
        # Count by department
        dept_counts = {}
        for course in data:
            dept = course.get('subject', 'Unknown')
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
        print(f"\n📊 Courses by department:")
        for dept, count in sorted(dept_counts.items()):
            print(f"  {dept}: {count} courses")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_file()
