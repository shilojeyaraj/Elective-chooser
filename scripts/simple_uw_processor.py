#!/usr/bin/env python3
"""
Simple processor for Waterloo Engineering JSON data
Works without heavy dependencies - just processes the JSON and creates CSV files
"""

import json
import csv
import sys
import re
from pathlib import Path
from typing import Dict, List, Any, Set

def parse_course_code(course_string: str) -> Dict[str, str]:
    """Parse course string like 'ECE 486 - Robot Dynamics and Control' into components"""
    # Handle cases like "AE 123/CIVE 123/ENVE 123/GEOE 123 - Electrical Circuits"
    if '/' in course_string and ' - ' in course_string:
        # Take the first course code
        course_part = course_string.split(' - ')[0].split('/')[0].strip()
    else:
        course_part = course_string.split(' - ')[0].strip()
    
    # Extract department and number
    match = re.match(r'([A-Z]+)\s+(\d+)', course_part)
    if match:
        dept = match.group(1)
        number = match.group(2)
        return {
            'id': f"{dept}{number}",
            'dept': dept,
            'number': number,
            'title': course_string.split(' - ')[1] if ' - ' in course_string else course_string
        }
    
    return {
        'id': course_part,
        'dept': 'UNKNOWN',
        'number': '000',
        'title': course_string
    }

def get_course_level(course_id: str) -> int:
    """Determine course level from course ID"""
    match = re.search(r'(\d+)', course_id)
    if match:
        number = int(match.group(1))
        if number < 200:
            return 100
        elif number < 300:
            return 200
        elif number < 400:
            return 300
        else:
            return 400
    return 200

def get_skills_from_title(title: str) -> List[str]:
    """Extract skills/topics from course title"""
    skills = []
    title_lower = title.lower()
    
    skill_keywords = {
        'robotics': ['robot', 'robotics', 'manipulator'],
        'control': ['control', 'feedback', 'regulation'],
        'machine learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
        'software': ['software', 'programming', 'coding', 'development'],
        'hardware': ['hardware', 'circuit', 'electronics', 'digital'],
        'mechanics': ['mechanics', 'dynamics', 'statics', 'materials'],
        'mathematics': ['math', 'calculus', 'statistics', 'probability'],
        'design': ['design', 'engineering design', 'project'],
        'systems': ['systems', 'system design', 'integration'],
        'data': ['data', 'database', 'analytics', 'visualization'],
        'communication': ['communication', 'writing', 'presentation'],
        'environmental': ['environmental', 'sustainability', 'energy'],
        'biomedical': ['biomedical', 'bio', 'medical', 'health']
    }
    
    for skill, keywords in skill_keywords.items():
        if any(keyword in title_lower for keyword in keywords):
            skills.append(skill)
    
    return skills if skills else ['general engineering']

def process_programs(json_data: Dict[str, Any]) -> tuple:
    """Process all programs and extract course information"""
    courses = {}  # Use dict instead of set to track by course ID
    programs = []
    
    for program_name, program_data in json_data.get('programs', {}).items():
        print(f"Processing program: {program_name}")
        
        # Create program entry
        program_info = {
            'id': program_name.lower().replace(' ', '-').replace('engineering', 'eng'),
            'name': program_name,
            'degree': program_data.get('degree', 'BASc'),
            'calendar_year': program_data.get('calendar_year', '2023-2024'),
            'description': f"{program_name} program requirements"
        }
        programs.append(program_info)
        
        # Process all terms and collect courses
        for term, courses_list in program_data.get('terms', {}).items():
            for course_string in courses_list:
                if course_string and not course_string.startswith('WKRPT') and not course_string.startswith('COMMST') and course_string != 'Approved Elective':
                    course_info = parse_course_code(course_string)
                    course_id = course_info['id']
                    
                    if course_id not in courses:
                        course_info.update({
                            'level': get_course_level(course_id),
                            'terms_offered': '["F", "W"]',  # JSON string
                            'skills': json.dumps(get_skills_from_title(course_info['title'])),  # Convert to JSON string
                            'units': 0.5,
                            'description': f"Course from {program_name} program",
                            'prereqs': '',
                            'workload': '{"reading": 2, "assignments": 3, "projects": 1, "labs": 1}',
                            'assessments': '{"midterm": 30, "final": 40, "assignments": 30}',
                            'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}"
                        })
                        courses[course_id] = course_info
    
    return list(courses.values()), programs

def save_courses_csv(courses_data: List[Dict[str, Any]], filename: str = 'processed_courses.csv'):
    """Save courses data to CSV file"""
    if not courses_data:
        print("No courses to save")
        return
    
    # courses_data is already a list of dicts
    
    fieldnames = ['id', 'title', 'dept', 'number', 'units', 'level', 'description', 'terms_offered', 
                  'prereqs', 'skills', 'workload', 'assessments', 'source_url']
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for course in courses_data:
            # Skills are already JSON strings, just write the row
            writer.writerow(course)
    
    print(f"✅ Saved {len(courses_data)} courses to {filename}")

def save_programs_csv(programs_data: List[Dict[str, Any]], filename: str = 'processed_programs.csv'):
    """Save programs data to CSV file"""
    if not programs_data:
        print("No programs to save")
        return
    
    fieldnames = ['id', 'name', 'program', 'faculty', 'description', 'source_url']
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for program in programs_data:
            row = {
                'id': program['id'],
                'name': program['name'],
                'program': program['degree'],
                'faculty': 'Engineering',
                'description': program['description'],
                'source_url': program.get('source_url', '')
            }
            writer.writerow(row)
    
    print(f"✅ Saved {len(programs_data)} programs to {filename}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python simple_uw_processor.py <json_file_path>")
        print("Example: python simple_uw_processor.py uw_engineering_core_by_program_TIDY.json")
        sys.exit(1)
    
    json_file = sys.argv[1]
    if not Path(json_file).exists():
        print(f"❌ File not found: {json_file}")
        sys.exit(1)
    
    print(f"📖 Reading JSON file: {json_file}")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    print("🔄 Processing programs and courses...")
    courses_data, programs_data = process_programs(json_data)
    
    print(f"📊 Found {len(courses_data)} unique courses across {len(programs_data)} programs")
    
    # Save to CSV files
    save_courses_csv(courses_data, 'processed_courses.csv')
    save_programs_csv(programs_data, 'processed_programs.csv')
    
    print("\n🎉 Data processing complete!")
    print("📁 Generated files:")
    print("   - processed_courses.csv (for courses table)")
    print("   - processed_programs.csv (for options table)")
    print("\n💡 Next steps:")
    print("   1. Set up your Supabase database")
    print("   2. Use the admin interface to upload these CSV files")
    print("   3. Or use the Python data processor with database connection")

if __name__ == "__main__":
    main()
