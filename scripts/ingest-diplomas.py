#!/usr/bin/env python3
"""
Ingest the waterloo_engineering_diplomas_detailed.json file
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
from supabase import create_client

# Load environment variables
load_dotenv()

class DiplomaIngestion:
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
        """Parse course string like 'ENVS 210' into components"""
        # Handle cases like "ENVS 310 or STV 305" - take the first course
        if ' or ' in course_string:
            course_string = course_string.split(' or ')[0].strip()
        
        # Handle cases like "ENGL 248 / ERS 288" - take the first course
        if ' / ' in course_string:
            course_string = course_string.split(' / ')[0].strip()
        
        match = re.match(r'([A-Z]+)\s*(\d+)', course_string)
        if match:
            dept = match.group(1)
            number = match.group(2)
            return {
                'id': f"{dept}{number}",
                'dept': dept,
                'number': int(number),
                'title': course_string
            }
        return {
            'id': course_string,
            'dept': 'UNKNOWN',
            'number': 0,
            'title': course_string
        }
    
    def get_course_level(self, course_id: str) -> int:
        """Determine course level from course ID"""
        match = re.search(r'(\d{3})', course_id)
        if match:
            level = int(match.group(1))
            return (level // 100) * 100
        return 200  # Default to 200 level
    
    def get_skills_from_title(self, title: str) -> List[str]:
        """Extract skills from course title"""
        skills = []
        title_lower = title.lower()
        
        skill_keywords = {
            'language': ['language', 'linguistics', 'communication'],
            'environment': ['environment', 'sustainability', 'climate', 'cities'],
            'business': ['business', 'management', 'economics', 'finance'],
            'mathematics': ['mathematics', 'math', 'statistics', 'calculus'],
            'science': ['science', 'physics', 'chemistry', 'biology'],
            'engineering': ['engineering', 'design', 'technology'],
            'arts': ['arts', 'humanities', 'culture', 'history'],
            'social sciences': ['psychology', 'sociology', 'politics', 'social']
        }
        
        for skill, keywords in skill_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                skills.append(skill)
        
        return skills if skills else ['general studies']
    
    def process_diplomas(self, json_file: str) -> tuple:
        """Process the diplomas JSON file"""
        print(f"📖 Processing diplomas from {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        diplomas = []
        courses = {}
        
        for diploma_data in data.get('diplomas', []):
            # Process diploma
            requirements = diploma_data.get('requirements', {})
            diploma_info = {
                'name': diploma_data.get('name', ''),
                'administered_by': diploma_data.get('administered_by', ''),
                'eligibility': diploma_data.get('eligibility', ''),
                'units_required': requirements.get('total_units_min'),
                'description': f"Diploma in {diploma_data.get('name', '')} - {diploma_data.get('administered_by', '')}",
                'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/diplomas",
                'course_requirements': {
                    'total_units_min': requirements.get('total_units_min'),
                    'required_courses': requirements.get('required_courses', []),
                    'choose_one_from': requirements.get('choose_one_from', []),
                    'elective_rules': requirements.get('elective_rules', []),
                    'allowed_course_prefixes': requirements.get('allowed_course_prefixes', []),
                    'minimum_average': diploma_data.get('minimum_average'),
                    'notes': diploma_data.get('notes', [])
                }
            }
            diplomas.append(diploma_info)
            
            # Extract courses from this diploma
            requirements = diploma_data.get('requirements', {})
            
            # Process required courses
            for course_string in requirements.get('required_courses', []):
                if course_string:
                    course_info = self.parse_course_code(course_string)
                    course_id = course_info['id']
                    
                    if course_id not in courses:
                        courses[course_id] = {
                            'id': course_id,
                            'title': course_info['title'],
                            'dept': course_info['dept'],
                            'number': course_info['number'],
                            'level': self.get_course_level(course_id),
                            'terms_offered': ["F", "W"],
                            'skills': self.get_skills_from_title(course_info['title']),
                            'units': 0.5,
                            'description': f"Course from {diploma_data.get('name', '')} diploma",
                            'prereqs': '',
                            'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                            'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                            'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/diplomas"
                        }
            
            # Process choose_one_from courses
            for course_string in requirements.get('choose_one_from', []):
                if course_string:
                    course_info = self.parse_course_code(course_string)
                    course_id = course_info['id']
                    
                    if course_id not in courses:
                        courses[course_id] = {
                            'id': course_id,
                            'title': course_info['title'],
                            'dept': course_info['dept'],
                            'number': course_info['number'],
                            'level': self.get_course_level(course_id),
                            'terms_offered': ["F", "W"],
                            'skills': self.get_skills_from_title(course_info['title']),
                            'units': 0.5,
                            'description': f"Course from {diploma_data.get('name', '')} diploma",
                            'prereqs': '',
                            'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                            'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                            'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/diplomas"
                        }
        
        print(f"✅ Found {len(diplomas)} diplomas and {len(courses)} unique courses")
        return diplomas, list(courses.values())
    
    def upload_data(self, table_name: str, data: List[Dict[str, Any]]):
        """Upload data to Supabase table"""
        if not data:
            print(f"⚠️ No data to upload for {table_name}")
            return
        
        print(f"📤 Uploading {len(data)} records to {table_name}...")
        
        # Upload in batches to avoid timeout
        batch_size = 50
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            try:
                result = self.supabase.table(table_name).upsert(batch, on_conflict='id').execute()
                print(f"✅ Uploaded batch {i//batch_size + 1}/{(len(data) + batch_size - 1)//batch_size}")
            except Exception as e:
                print(f"❌ Error uploading batch {i//batch_size + 1}: {e}")
        
        print(f"✅ Successfully uploaded {len(data)} records to {table_name}!")
    
    def ingest_diplomas(self):
        """Main method to ingest the diplomas data"""
        print("🚀 Starting diplomas data ingestion...")
        
        # Process diplomas and courses
        diplomas, courses = self.process_diplomas('waterloo_engineering_diplomas_detailed.json')
        
        # Upload diplomas (replace existing data)
        print("🗑️ Clearing existing diplomas...")
        self.supabase.table('diplomas').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        print("📤 Uploading new diplomas...")
        self.upload_data('diplomas', diplomas)
        
        # Upload courses (merge with existing)
        print("📤 Uploading courses...")
        self.upload_data('courses', courses)
        
        print("🎉 Diplomas data ingestion complete!")
        print(f"📊 Summary:")
        print(f"  - Diplomas: {len(diplomas)}")
        print(f"  - Courses: {len(courses)}")

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("Usage: python ingest-diplomas.py")
        print("This script will process waterloo_engineering_diplomas_detailed.json and update the database")
        return
    
    processor = DiplomaIngestion()
    processor.ingest_diplomas()

if __name__ == "__main__":
    main()
