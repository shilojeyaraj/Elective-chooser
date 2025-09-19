#!/usr/bin/env python3
"""
Ingest courses from uw_engineering_core_by_program_TIDY.json
"""

import os
import json
import sys
from supabase import create_client, Client
from typing import Dict, List, Any
import re

class CourseIngestion:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            print("❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set")
            sys.exit(1)
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        print("✅ Connected to Supabase")

    def parse_course_code(self, course_string: str) -> Dict[str, Any]:
        """Parse course string like 'ECE 486 - Robot Dynamics and Control'"""
        # Remove extra whitespace and split
        course_string = course_string.strip()
        
        # Handle special cases
        if course_string.startswith('WKRPT') or course_string.startswith('COMMST') or course_string == 'Approved Elective':
            return None
            
        # Pattern: "DEPT NUMBER - Title" or "DEPT NUMBER/OTHER - Title"
        match = re.match(r'^([A-Z]+)\s+(\d+[A-Z]?)(?:/[^-\s]+)?\s*-\s*(.+)$', course_string)
        if not match:
            print(f"⚠️ Could not parse course: {course_string}")
            return None
            
        dept = match.group(1)
        number_str = match.group(2)
        title = match.group(3).strip()
        
        # Extract number (remove any letter suffix)
        number = int(re.sub(r'[A-Z]', '', number_str))
        
        # Create course ID
        course_id = f"{dept}{number_str}"
        
        return {
            'id': course_id,
            'title': title,
            'dept': dept,
            'number': number,
            'level': self.get_course_level(number)
        }

    def get_course_level(self, number: int) -> int:
        """Determine course level based on number"""
        if number < 200:
            return 100
        elif number < 300:
            return 200
        elif number < 400:
            return 300
        elif number < 500:
            return 400
        else:
            return 500

    def get_skills_from_title(self, title: str) -> List[str]:
        """Extract skills from course title"""
        skills = []
        title_lower = title.lower()
        
        skill_keywords = {
            'robotics': ['robot', 'robotic', 'autonomous', 'control'],
            'ai': ['artificial intelligence', 'machine learning', 'neural', 'ai'],
            'software': ['software', 'programming', 'development', 'coding'],
            'hardware': ['hardware', 'circuit', 'electronics', 'embedded'],
            'mechanics': ['mechanics', 'dynamics', 'statics', 'materials'],
            'design': ['design', 'studio', 'project'],
            'math': ['calculus', 'linear algebra', 'differential', 'statistics'],
            'chemistry': ['chemistry', 'chemical'],
            'physics': ['physics', 'mechanics', 'thermodynamics'],
            'environmental': ['environmental', 'sustainability', 'energy']
        }
        
        for skill, keywords in skill_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                skills.append(skill)
        
        return skills if skills else ['general']

    def process_courses(self, json_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process all programs and extract course information"""
        courses = {}
        
        print("🔄 Processing courses from all programs...")
        
        for program_name, program_data in json_data.get('programs', {}).items():
            print(f"📚 Processing {program_name}...")
            
            # Process all terms and collect courses
            for term, courses_list in program_data.get('terms', {}).items():
                for course_string in courses_list:
                    if course_string and not course_string.startswith('WKRPT') and not course_string.startswith('COMMST') and course_string != 'Approved Elective':
                        course_info = self.parse_course_code(course_string)
                        if course_info:
                            course_id = course_info['id']
                            
                            if course_id not in courses:
                                courses[course_id] = {
                                    **course_info,
                                    'units': 0.5,
                                    'terms_offered': ["F", "W"],
                                    'skills': self.get_skills_from_title(course_info['title']),
                                    'description': f"Course from {program_name} program",
                                    'prereqs': '',
                                    'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                                    'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                                    'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}",
                                    'faculty': 'Engineering'
                                }
        
        return list(courses.values())

    def upload_courses(self, courses_data: List[Dict[str, Any]]):
        """Upload courses to Supabase"""
        print(f"📚 Uploading {len(courses_data)} courses...")
        
        # Clear existing courses first
        print("🗑️ Clearing existing courses...")
        self.supabase.table('courses').delete().neq('id', '').execute()
        
        # Upload in batches to avoid timeout
        batch_size = 50
        for i in range(0, len(courses_data), batch_size):
            batch = courses_data[i:i + batch_size]
            result = self.supabase.table('courses').insert(batch).execute()
            print(f"✅ Uploaded batch {i//batch_size + 1}/{(len(courses_data) + batch_size - 1)//batch_size}")
        
        print(f"✅ Successfully uploaded {len(courses_data)} courses!")

    def process_json_file(self, json_file_path: str):
        """Main method to process the JSON file"""
        print(f"📖 Reading JSON file: {json_file_path}")
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        print("🔄 Processing courses...")
        courses_data = self.process_courses(json_data)
        
        print(f"📊 Found {len(courses_data)} unique courses")
        
        print("💾 Uploading courses to Supabase...")
        self.upload_courses(courses_data)
        
        print("🎉 Course data processing complete!")

def main():
    if len(sys.argv) < 2:
        print("Usage: python ingest-courses.py <json_file_path>")
        print("Example: python ingest-courses.py uw_engineering_core_by_program_TIDY.json")
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    if not os.path.exists(json_file):
        print(f"❌ Error: File {json_file} not found")
        sys.exit(1)
    
    processor = CourseIngestion()
    processor.process_json_file(json_file)

if __name__ == "__main__":
    main()
