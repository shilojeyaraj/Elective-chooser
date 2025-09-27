#!/usr/bin/env python3
"""
Script to check uw_titles_prereqs_partial.json
"""

import json

def check_file():
    try:
        with open('uw_titles_prereqs_partial.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"📚 Total courses: {len(data['courses'])}")
        print(f"📝 Source: {data['metadata']['source_hint']}")
        print(f"📅 Last updated: {data['metadata']['last_updated_local']}")
        print(f"📋 Notes: {data['metadata']['notes']}")
        
        print("\n📋 Sample courses:")
        for i, course in enumerate(data['courses'][:10]):
            print(f"  {i+1}. {course['code']}: {course['title']}")
            if course.get('prerequisites'):
                print(f"     Prereqs: {course['prerequisites']}")
            else:
                print(f"     Prereqs: None")
        
        # Count by department
        dept_counts = {}
        for course in data['courses']:
            dept = course['code'][:2] if len(course['code']) >= 2 else 'Unknown'
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
        print(f"\n📊 Courses by department:")
        for dept, count in sorted(dept_counts.items()):
            print(f"  {dept}: {count} courses")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_file()
