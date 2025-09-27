#!/usr/bin/env python3
"""
Processor for Waterloo Engineering Specializations and Diplomas JSON data
Processes the JSON files and ingests them into Supabase
"""

import json
import os
import sys
import re
import time
from pathlib import Path
from typing import Dict, List, Any, Set
import uuid
from datetime import datetime

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

class SpecializationsDiplomasProcessor:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        print(f"✅ Connected to Supabase at {self.supabase_url}")
        
        # Test connection with retry logic
        self.test_connection_with_retry()

    def test_connection_with_retry(self, max_retries=3, delay=5):
        """Test database connection with retry logic"""
        print(f"🔍 Testing database connection...")
        
        for attempt in range(max_retries):
            try:
                # Wait a bit before testing connection
                if attempt > 0:
                    print(f"⏳ Waiting {delay} seconds before retry {attempt + 1}/{max_retries}...")
                    time.sleep(delay)
                
                # Test connection by querying a simple table
                result = self.supabase.table('courses').select('count').limit(1).execute()
                print(f"✅ Database connection successful on attempt {attempt + 1}")
                return True
                
            except Exception as e:
                print(f"❌ Connection attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    print(f"❌ All {max_retries} connection attempts failed")
                    raise Exception(f"Failed to connect to database after {max_retries} attempts: {e}")
        
        return False

    def parse_course_code(self, course_string: str) -> Dict[str, str]:
        """Parse course string like 'ECE 486 - Robot Dynamics and Control' into components"""
        if not course_string or course_string.strip() == '':
            return None
            
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
            'biomedical': ['biomedical', 'bio', 'medical', 'health'],
            'language': ['language', 'linguistics', 'applied language'],
            'sustainability': ['sustainability', 'environmental', 'green'],
            'restoration': ['restoration', 'rehabilitation', 'ecological'],
            'assessment': ['assessment', 'evaluation', 'analysis'],
            'cities': ['cities', 'urban', 'planning', 'future cities']
        }
        
        for skill, keywords in skill_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                skills.append(skill)
        
        return skills if skills else ['general engineering']

    def process_specializations(self, json_data: Dict[str, Any]) -> tuple:
        """Process specializations JSON and extract courses and options"""
        courses = {}  # Use dict to track by course ID
        options = []
        
        for program in json_data.get('programs', []):
            program_name = program.get('program', '')
            print(f"Processing program: {program_name}")
            
            for specialization in program.get('specializations', []):
                spec_name = specialization.get('name', '')
                spec_id = str(uuid.uuid4())
                
                # Create option entry
                option = {
                    'id': spec_id,
                    'name': spec_name,
                    'program': program_name,
                    'faculty': 'Engineering',
                    'description': specialization.get('graduation_requirements', ''),
                    'source_url': specialization.get('source', ''),
                    'required_courses': [],
                    'selective_rules': {}
                }
                
                # Process course requirements
                course_reqs = specialization.get('course_requirements', {})
                
                # Handle required courses
                if 'required' in course_reqs:
                    for course_string in course_reqs['required']:
                        course_info = self.parse_course_code(course_string)
                        if course_info:
                            course_id = course_info['id']
                            option['required_courses'].append(course_id)
                            
                            # Add course to courses dict if not already present
                            if course_id not in courses:
                                courses[course_id] = {
                                    'id': course_id,
                                    'title': course_info['title'],
                                    'dept': course_info['dept'],
                                    'number': course_info['number'],
                                    'level': self.get_course_level(course_id),
                                    'units': 0.5,
                                    'description': f"Course from {program_name} - {spec_name} specialization",
                                    'terms_offered': ["F", "W"],
                                    'prereqs': '',
                                    'skills': self.get_skills_from_title(course_info['title']),
                                    'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                                    'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                                    'source_url': specialization.get('source', '')
                                }
                
                # Handle selective courses
                if 'choose_from' in course_reqs and 'examples' in course_reqs['choose_from']:
                    selective_courses = []
                    for course_string in course_reqs['choose_from']['examples']:
                        course_info = self.parse_course_code(course_string)
                        if course_info:
                            course_id = course_info['id']
                            selective_courses.append(course_id)
                            
                            # Add course to courses dict if not already present
                            if course_id not in courses:
                                courses[course_id] = {
                                    'id': course_id,
                                    'title': course_info['title'],
                                    'dept': course_info['dept'],
                                    'number': course_info['number'],
                                    'level': self.get_course_level(course_id),
                                    'units': 0.5,
                                    'description': f"Course from {program_name} - {spec_name} specialization",
                                    'terms_offered': ["F", "W"],
                                    'prereqs': '',
                                    'skills': self.get_skills_from_title(course_info['title']),
                                    'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                                    'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                                    'source_url': specialization.get('source', '')
                                }
                    
                    if selective_courses:
                        option['selective_rules'] = {
                            'selectNfrom': selective_courses,
                            'N': len(selective_courses)  # Allow all courses
                        }
                
                options.append(option)
        
        return list(courses.values()), options

    def process_diplomas(self, json_data: Dict[str, Any]) -> tuple:
        """Process diplomas JSON and extract courses and options"""
        courses = {}  # Use dict to track by course ID
        options = []
        
        for diploma in json_data.get('diplomas', []):
            diploma_name = diploma.get('name', '')
            diploma_id = str(uuid.uuid4())
            
            # Create option entry
            option = {
                'id': diploma_id,
                'name': diploma_name,
                'program': 'Diploma',
                'faculty': diploma.get('administered_by', 'Various'),
                'description': f"Minimum average: {diploma.get('minimum_average', 'N/A')}%. {diploma.get('eligibility', '')}",
                'source_url': 'https://uwaterloo.ca/engineering/undergraduate-studies/specializations-and-more',
                'required_courses': [],
                'selective_rules': {}
            }
            
            # Process course requirements
            requirements = diploma.get('requirements', {})
            
            # Handle required courses
            if 'required_courses' in requirements and requirements['required_courses']:
                for course_string in requirements['required_courses']:
                    course_info = self.parse_course_code(course_string)
                    if course_info:
                        course_id = course_info['id']
                        option['required_courses'].append(course_id)
                        
                        # Add course to courses dict if not already present
                        if course_id not in courses:
                            courses[course_id] = {
                                'id': course_id,
                                'title': course_info['title'],
                                'dept': course_info['dept'],
                                'number': course_info['number'],
                                'level': self.get_course_level(course_id),
                                'units': 0.5,
                                'description': f"Course for {diploma_name} diploma",
                                'terms_offered': ["F", "W"],
                                'prereqs': '',
                                'skills': self.get_skills_from_title(course_info['title']),
                                'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                                'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                                'source_url': 'https://uwaterloo.ca/engineering/undergraduate-studies/specializations-and-more'
                            }
            
            # Handle elective rules and allowed prefixes
            if 'allowed_prefixes' in requirements and requirements['allowed_prefixes']:
                elective_rules = []
                for prefix in requirements['allowed_prefixes']:
                    # Create a generic course entry for the prefix
                    prefix_id = f"{prefix.strip('*')}000"
                    elective_rules.append(prefix_id)
                    
                    if prefix_id not in courses:
                        courses[prefix_id] = {
                            'id': prefix_id,
                            'title': f"{prefix.strip('*')} courses",
                            'dept': prefix.strip('*'),
                            'number': '000',
                            'level': 200,
                            'units': 0.5,
                            'description': f"Any {prefix.strip('*')} course for {diploma_name} diploma",
                            'terms_offered': ["F", "W"],
                            'prereqs': '',
                            'skills': self.get_skills_from_title(f"{prefix.strip('*')} courses"),
                            'workload': {"reading": 2, "assignments": 3, "projects": 1, "labs": 1},
                            'assessments': {"midterm": 30, "final": 40, "assignments": 30},
                            'source_url': 'https://uwaterloo.ca/engineering/undergraduate-studies/specializations-and-more'
                        }
                
                if elective_rules:
                    option['selective_rules'] = {
                        'selectNfrom': elective_rules,
                        'N': len(elective_rules)  # Allow all courses
                    }
            
            options.append(option)
        
        return list(courses.values()), options

    def upload_courses(self, courses_data: List[Dict[str, Any]]):
        """Upload courses to Supabase"""
        if not courses_data:
            print("No courses to upload")
            return
            
        print(f"📚 Uploading {len(courses_data)} courses...")
        
        # Upload in batches to avoid timeout
        batch_size = 50
        for i in range(0, len(courses_data), batch_size):
            batch = courses_data[i:i + batch_size]
            try:
                result = self.supabase.table('courses').upsert(batch, on_conflict='id').execute()
                print(f"✅ Uploaded batch {i//batch_size + 1}/{(len(courses_data) + batch_size - 1)//batch_size}")
            except Exception as e:
                print(f"❌ Error uploading batch {i//batch_size + 1}: {e}")
                # Continue with next batch
                continue
        
        print(f"✅ Successfully uploaded {len(courses_data)} courses!")

    def upload_options(self, options_data: List[Dict[str, Any]]):
        """Upload options to Supabase"""
        if not options_data:
            print("No options to upload")
            return
            
        print(f"📋 Uploading {len(options_data)} options...")
        
        try:
            result = self.supabase.table('options').upsert(options_data, on_conflict='id').execute()
            print(f"✅ Successfully uploaded {len(options_data)} options!")
        except Exception as e:
            print(f"❌ Error uploading options: {e}")
            raise

    def process_specializations_file(self, json_file_path: str):
        """Process specializations JSON file"""
        print(f"📖 Reading specializations file: {json_file_path}")
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        print("🔄 Processing specializations...")
        courses_data, options_data = self.process_specializations(json_data)
        
        print(f"📊 Found {len(courses_data)} unique courses and {len(options_data)} specializations")
        
        print("💾 Uploading courses to Supabase...")
        self.upload_courses(courses_data)
        
        print("💾 Uploading specializations to Supabase...")
        self.upload_options(options_data)
        
        print("🎉 Specializations processing complete!")

    def process_diplomas_file(self, json_file_path: str):
        """Process diplomas JSON file"""
        print(f"📖 Reading diplomas file: {json_file_path}")
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        print("🔄 Processing diplomas...")
        courses_data, options_data = self.process_diplomas(json_data)
        
        print(f"📊 Found {len(courses_data)} unique courses and {len(options_data)} diplomas")
        
        print("💾 Uploading courses to Supabase...")
        self.upload_courses(courses_data)
        
        print("💾 Uploading diplomas to Supabase...")
        self.upload_options(options_data)
        
        print("🎉 Diplomas processing complete!")

    def process_both_files(self, specializations_file: str, diplomas_file: str):
        """Process both specializations and diplomas files"""
        print("🚀 Starting processing of specializations and diplomas...")
        
        # Wait a moment to ensure database is fully ready
        print("⏳ Waiting 3 seconds to ensure database is fully ready...")
        time.sleep(3)
        
        # Process specializations
        self.process_specializations_file(specializations_file)
        
        # Process diplomas
        self.process_diplomas_file(diplomas_file)
        
        print("🎉 All processing complete!")

def main():
    if len(sys.argv) < 2:
        print("Usage: python process_specializations_diplomas.py <command> [args...]")
        print("Commands:")
        print("  specializations <json_file_path>")
        print("  diplomas <json_file_path>")
        print("  both <specializations_file> <diplomas_file>")
        return
    
    try:
        processor = SpecializationsDiplomasProcessor()
        command = sys.argv[1]
        
        if command == "specializations":
            if len(sys.argv) < 3:
                print("Error: JSON file path required")
                return
            processor.process_specializations_file(sys.argv[2])
        
        elif command == "diplomas":
            if len(sys.argv) < 3:
                print("Error: JSON file path required")
                return
            processor.process_diplomas_file(sys.argv[2])
        
        elif command == "both":
            if len(sys.argv) < 4:
                print("Error: Both file paths required")
                return
            processor.process_both_files(sys.argv[2], sys.argv[3])
        
        else:
            print(f"Unknown command: {command}")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
