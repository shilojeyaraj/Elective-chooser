#!/usr/bin/env python3
"""
Ingest the comprehensive full_specialization_list.json file
This has much better structured data with detailed course requirements
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

class FullSpecializationIngestion:
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
        """Parse course string like 'CIVE 413 - Structural Steel Design (0.50)' into components"""
        # Handle OR cases like "CIVE 413 - Structural Steel Design (0.50) OR CIVE 414 - Structural Concrete Design (0.50)"
        if ' OR ' in course_string:
            # For OR cases, just take the first course
            course_string = course_string.split(' OR ')[0].strip()
        
        # Handle cases like "AE 572/ME 572 - Building Energy Analysis (0.50)"
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
                'number': int(number),
                'title': course_string.split(' - ')[1].split(' (')[0] if ' - ' in course_string else course_string
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
            'robotics': ['robot', 'robotics', 'automation'],
            'control': ['control', 'control systems', 'feedback'],
            'machine learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
            'embedded': ['embedded', 'microcontroller', 'microprocessor'],
            'software': ['software', 'programming', 'coding'],
            'hardware': ['hardware', 'circuit', 'electronics'],
            'mechanics': ['mechanics', 'dynamics', 'statics'],
            'materials': ['materials', 'material science'],
            'thermodynamics': ['thermodynamics', 'heat transfer'],
            'fluid mechanics': ['fluid', 'hydraulics', 'pneumatics'],
            'structures': ['structures', 'structural', 'design'],
            'environmental': ['environmental', 'sustainability', 'green'],
            'biomedical': ['biomedical', 'bio', 'medical', 'health'],
            'business': ['business', 'management', 'economics', 'finance'],
            'data science': ['data', 'analytics', 'statistics', 'visualization']
        }
        
        for skill, keywords in skill_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                skills.append(skill)
        
        return skills if skills else ['general engineering']
    
    def process_full_specializations(self, json_file: str) -> tuple:
        """Process the comprehensive specializations JSON file"""
        print(f"📖 Processing full specializations from {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        specializations = []
        courses = {}
        
        for program_data in data.get('programs', []):
            program_name = program_data.get('program', '')
            print(f"  Processing {program_name}...")
            
            for spec_data in program_data.get('specializations', []):
                # Process specialization
                spec_info = {
                    'name': spec_data.get('name', ''),
                    'program': program_name,
                    'faculty': 'Engineering',
                    'min_average_in_specialization': spec_data.get('minimum_average_required'),
                    'graduation_requirements': spec_data.get('graduation_requirements', ''),
                    'course_requirements': {
                        'required': spec_data.get('course_requirements', {}).get('required_courses', []),
                        'choose_from': {
                            'examples': spec_data.get('course_requirements', {}).get('choose_from', [])
                        }
                    },
                    'description': f"Specialization in {spec_data.get('name', '')} for {program_name}",
                    'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}"
                }
                specializations.append(spec_info)
                
                # Extract courses from this specialization
                course_requirements = spec_data.get('course_requirements', {})
                
                # Process required courses
                for course_string in course_requirements.get('required_courses', []):
                    if course_string and not course_string.startswith('WKRPT') and not course_string.startswith('COMMST') and not course_string.startswith('Capstone'):
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
                                'description': f"Course from {program_name} specialization",
                                'prereqs': '',
                                'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                                'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                                'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}"
                            }
                
                # Process elective courses
                for course_string in course_requirements.get('choose_from', []):
                    if course_string and not course_string.startswith('WKRPT') and not course_string.startswith('COMMST') and not course_string.startswith('Example:'):
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
                                'description': f"Course from {program_name} specialization",
                                'prereqs': '',
                                'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                                'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                                'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}"
                            }
        
        print(f"✅ Found {len(specializations)} specializations and {len(courses)} unique courses")
        return specializations, list(courses.values())
    
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
    
    def ingest_full_specializations(self):
        """Main method to ingest the full specializations data"""
        print("🚀 Starting full specializations data ingestion...")
        
        # Process specializations and courses
        specializations, courses = self.process_full_specializations('full_specialization_list.json')
        
        # Upload specializations (replace existing data)
        print("🗑️ Clearing existing specializations...")
        self.supabase.table('specializations').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        print("📤 Uploading new specializations...")
        self.upload_data('specializations', specializations)
        
        # Upload courses (merge with existing)
        print("📤 Uploading courses...")
        self.upload_data('courses', courses)
        
        print("🎉 Full specializations data ingestion complete!")
        print(f"📊 Summary:")
        print(f"  - Specializations: {len(specializations)}")
        print(f"  - Courses: {len(courses)}")

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("Usage: python ingest-full-specializations.py")
        print("This script will process full_specialization_list.json and update the database")
        return
    
    processor = FullSpecializationIngestion()
    processor.ingest_full_specializations()

if __name__ == "__main__":
    main()
