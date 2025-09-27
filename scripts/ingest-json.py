#!/usr/bin/env python3
"""
Comprehensive JSON ingestion script for Waterloo Engineering data
Processes JSON files and uploads directly to Supabase
"""

import json
import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

class JSONIngestionProcessor:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            print("❌ Missing Supabase environment variables")
            print("Please ensure your .env file contains:")
            print("  SUPABASE_URL=your_supabase_url")
            print("  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
            sys.exit(1)
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        print("✅ Supabase client initialized")
    
    def parse_course_code(self, course_string: str) -> Dict[str, str]:
        """Parse course string like 'ECE 486 - Robot Dynamics and Control' into components"""
        if '/' in course_string and ' - ' in course_string:
            course_part = course_string.split(' - ')[0].split('/')[0].strip()
        else:
            course_part = course_string.split(' - ')[0].strip()
        
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
    
    def get_course_level(self, course_id: str) -> int:
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
    
    def get_skills_from_title(self, title: str) -> List[str]:
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
    
    def process_programs(self, json_data: Dict[str, Any]) -> tuple:
        """Process all programs and extract course information"""
        courses = {}
        programs = []
        
        for program_name, program_data in json_data.get('programs', {}).items():
            print(f"Processing program: {program_name}")
            
            # Create program entry
            program_info = {
                'id': program_name.lower().replace(' ', '-').replace('engineering', 'eng'),
                'name': program_name,
                'program': program_data.get('degree', 'BASc'),
                'faculty': 'Engineering',
                'description': f"{program_name} program requirements",
                'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}"
            }
            programs.append(program_info)
            
            # Process all terms and collect courses
            for term, courses_list in program_data.get('terms', {}).items():
                for course_string in courses_list:
                    if course_string and not course_string.startswith('WKRPT') and not course_string.startswith('COMMST') and course_string != 'Approved Elective':
                        course_info = self.parse_course_code(course_string)
                        course_id = course_info['id']
                        
                        if course_id not in courses:
                            course_info.update({
                                'level': self.get_course_level(course_id),
                                'terms_offered': ["F", "W"],
                                'skills': self.get_skills_from_title(course_info['title']),
                                'units': 0.5,
                                'description': f"Course from {program_name} program",
                                'prereqs': '',
                                'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                                'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                                'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}"
                            })
                            courses[course_id] = course_info
        
        return list(courses.values()), programs
    
    def upload_courses(self, courses_data: List[Dict[str, Any]]):
        """Upload courses to Supabase"""
        print(f"📚 Uploading {len(courses_data)} courses...")
        
        # Upload in batches to avoid timeout
        batch_size = 50
        for i in range(0, len(courses_data), batch_size):
            batch = courses_data[i:i + batch_size]
            result = self.supabase.table('courses').upsert(batch, on_conflict='id').execute()
            print(f"✅ Uploaded batch {i//batch_size + 1}/{(len(courses_data) + batch_size - 1)//batch_size}")
        
        print(f"✅ Successfully uploaded {len(courses_data)} courses!")
    
    def upload_programs(self, programs_data: List[Dict[str, Any]]):
        """Upload programs as options to Supabase"""
        print(f"📋 Uploading {len(programs_data)} programs...")
        
        result = self.supabase.table('options').upsert(programs_data, on_conflict='id').execute()
        print(f"✅ Successfully uploaded {len(programs_data)} programs!")
    
    def process_json_file(self, json_file_path: str):
        """Main method to process the JSON file"""
        print(f"📖 Reading JSON file: {json_file_path}")
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        print("🔄 Processing programs and courses...")
        courses_data, programs_data = self.process_programs(json_data)
        
        print(f"📊 Found {len(courses_data)} unique courses across {len(programs_data)} programs")
        
        print("💾 Uploading courses to Supabase...")
        self.upload_courses(courses_data)
        
        print("💾 Uploading programs to Supabase...")
        self.upload_programs(programs_data)
        
        print("🎉 JSON data processing complete!")

def main():
    if len(sys.argv) < 2:
        print("Usage: python ingest-json.py <json_file_path>")
        print("Example: python ingest-json.py uw_engineering_core_by_program_TIDY.json")
        sys.exit(1)
    
    json_file = sys.argv[1]
    if not os.path.exists(json_file):
        print(f"❌ File not found: {json_file}")
        sys.exit(1)
    
    processor = JSONIngestionProcessor()
    processor.process_json_file(json_file)

if __name__ == "__main__":
    main()
