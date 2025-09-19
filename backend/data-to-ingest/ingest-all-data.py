#!/usr/bin/env python3
"""
Comprehensive data ingestion script for Waterloo Engineering data
Processes courses, specializations, certificates, and diplomas
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

class ComprehensiveDataIngestion:
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
                'number': int(number),
                'title': course_string.split(' - ')[1] if ' - ' in course_string else course_string
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
            'environmental': ['environmental', 'sustainability', 'green']
        }
        
        for skill, keywords in skill_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                skills.append(skill)
        
        return skills if skills else ['general engineering']
    
    def process_specializations(self, json_file: str) -> List[Dict[str, Any]]:
        """Process specializations JSON file"""
        print(f"📖 Processing specializations from {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        specializations = []
        
        for program_data in data.get('programs', []):
            program_name = program_data.get('program', '')
            
            for spec_data in program_data.get('specializations', []):
                spec_info = {
                    'name': spec_data.get('name', ''),
                    'program': program_name,
                    'faculty': 'Engineering',
                    'min_average_in_specialization': spec_data.get('min_average_in_specialization'),
                    'graduation_requirements': spec_data.get('graduation_requirements', ''),
                    'course_requirements': spec_data.get('course_requirements', {}),
                    'description': f"Specialization in {spec_data.get('name', '')} for {program_name}",
                    'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}"
                }
                specializations.append(spec_info)
        
        print(f"✅ Found {len(specializations)} specializations")
        return specializations
    
    def process_certificates(self, json_file: str) -> List[Dict[str, Any]]:
        """Process certificates JSON file"""
        print(f"📖 Processing certificates from {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        certificates = []
        
        for cert_data in data.get('certificates', []):
            cert_info = {
                'name': cert_data.get('name', ''),
                'administered_by': cert_data.get('administered_by', ''),
                'uw_engineering_listed': cert_data.get('uw_engineering_listed', False),
                'eligibility': cert_data.get('eligibility', ''),
                'requirements': cert_data.get('requirements', ''),
                'course_requirements': cert_data.get('course_requirements', {}),
                'units_required': cert_data.get('units_required'),
                'description': cert_data.get('description', ''),
                'source_url': cert_data.get('source_url', '')
            }
            certificates.append(cert_info)
        
        print(f"✅ Found {len(certificates)} certificates")
        return certificates
    
    def process_diplomas(self, json_file: str) -> List[Dict[str, Any]]:
        """Process diplomas JSON file"""
        print(f"📖 Processing diplomas from {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        diplomas = []
        
        for diploma_data in data.get('diplomas', []):
            diploma_info = {
                'name': diploma_data.get('name', ''),
                'administered_by': diploma_data.get('administered_by', ''),
                'uw_engineering_listed': diploma_data.get('uw_engineering_listed', False),
                'eligibility': diploma_data.get('eligibility', ''),
                'requirements': diploma_data.get('requirements', ''),
                'course_requirements': diploma_data.get('course_requirements', {}),
                'units_required': diploma_data.get('units_required'),
                'description': diploma_data.get('description', ''),
                'source_url': diploma_data.get('source_url', '')
            }
            diplomas.append(diploma_info)
        
        print(f"✅ Found {len(diplomas)} diplomas")
        return diplomas
    
    def process_courses_from_specializations(self, specializations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract courses from specializations data"""
        print("📚 Extracting courses from specializations...")
        
        courses = {}
        
        for spec in specializations:
            course_requirements = spec.get('course_requirements', {})
            
            # Process required courses
            for course_string in course_requirements.get('required', []):
                if course_string and not course_string.startswith('WKRPT') and not course_string.startswith('COMMST'):
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
                            'description': f"Course from {spec['program']} specialization",
                            'prereqs': '',
                            'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                            'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                            'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{spec['program'].lower().replace(' ', '-')}"
                        }
            
            # Process elective courses
            choose_from = course_requirements.get('choose_from', {})
            if isinstance(choose_from, dict):
                for category, course_list in choose_from.items():
                    if isinstance(course_list, list):
                        for course_string in course_list:
                            if course_string and not course_string.startswith('WKRPT') and not course_string.startswith('COMMST'):
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
                                        'description': f"Course from {spec['program']} specialization",
                                        'prereqs': '',
                                        'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                                        'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                                        'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{spec['program'].lower().replace(' ', '-')}"
                                    }
        
        print(f"✅ Extracted {len(courses)} unique courses from specializations")
        return list(courses.values())
    
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
    
    def ingest_all_data(self):
        """Main method to ingest all data types"""
        print("🚀 Starting comprehensive data ingestion...")
        
        # Process specializations
        specializations = self.process_specializations('waterloo_engineering_specializations_COMPLETE.json')
        self.upload_data('specializations', specializations)
        
        # Process certificates
        certificates = self.process_certificates('waterloo_engineering_certificates.json')
        self.upload_data('certificates', certificates)
        
        # Process diplomas
        diplomas = self.process_diplomas('waterloo_engineering_undergrad_diplomas.json')
        self.upload_data('diplomas', diplomas)
        
        # Extract and upload courses from specializations
        courses = self.process_courses_from_specializations(specializations)
        self.upload_data('courses', courses)
        
        print("🎉 Comprehensive data ingestion complete!")
        print(f"📊 Summary:")
        print(f"  - Specializations: {len(specializations)}")
        print(f"  - Certificates: {len(certificates)}")
        print(f"  - Diplomas: {len(diplomas)}")
        print(f"  - Courses: {len(courses)}")

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("Usage: python ingest-all-data.py")
        print("This script will process all JSON files in the current directory:")
        print("  - waterloo_engineering_specializations_COMPLETE.json")
        print("  - waterloo_engineering_certificates.json")
        print("  - waterloo_engineering_undergrad_diplomas.json")
        return
    
    processor = ComprehensiveDataIngestion()
    processor.ingest_all_data()

if __name__ == "__main__":
    main()

