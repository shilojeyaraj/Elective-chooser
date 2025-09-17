#!/usr/bin/env python3
"""
Process Waterloo Engineering JSON data and import into the database
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
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables
load_dotenv()

class UWDataProcessor:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            print("❌ DATABASE_URL not found in environment variables")
            sys.exit(1)
    
    def parse_course_code(self, course_string: str) -> Dict[str, str]:
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
    
    def get_terms_offered(self, course_id: str) -> List[str]:
        """Determine which terms a course is typically offered"""
        # This is a simplified heuristic - in reality, you'd need more data
        # For now, assume most courses are offered in F/W
        return ["F", "W"]
    
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
            'data': ['data', 'database', 'analytics', 'visualization']
        }
        
        for skill, keywords in skill_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                skills.append(skill)
        
        return skills if skills else ['general engineering']
    
    def process_programs(self, json_data: Dict[str, Any]):
        """Process all programs and extract course information"""
        courses = set()
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
                    if course_string and not course_string.startswith('WKRPT') and not course_string.startswith('COMMST'):
                        course_info = self.parse_course_code(course_string)
                        if course_info['id'] not in [c['id'] for c in courses]:
                            course_info.update({
                                'level': self.get_course_level(course_info['id']),
                                'terms_offered': self.get_terms_offered(course_info['id']),
                                'skills': self.get_skills_from_title(course_info['title']),
                                'units': 0.5,
                                'description': f"Course from {program_name} program",
                                'prereqs': '',
                                'workload': {'reading': 2, 'assignments': 3, 'projects': 1, 'labs': 1},
                                'assessments': {'midterm': 30, 'final': 40, 'assignments': 30},
                                'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program_name.lower().replace(' ', '-')}"
                            })
                            courses.add(tuple(course_info.items()))
        
        return list(courses), programs
    
    def upload_courses(self, courses_data: List[tuple]):
        """Upload courses to database"""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                for course_tuple in courses_data:
                    course = dict(course_tuple)
                    
                    cur.execute("""
                        INSERT INTO courses (id, title, dept, units, level, description, 
                                           terms_offered, prereqs, skills, workload, 
                                           assessments, source_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            title = EXCLUDED.title,
                            dept = EXCLUDED.dept,
                            units = EXCLUDED.units,
                            level = EXCLUDED.level,
                            description = EXCLUDED.description,
                            terms_offered = EXCLUDED.terms_offered,
                            prereqs = EXCLUDED.prereqs,
                            skills = EXCLUDED.skills,
                            workload = EXCLUDED.workload,
                            assessments = EXCLUDED.assessments,
                            source_url = EXCLUDED.source_url,
                            updated_at = NOW()
                    """, (
                        course['id'], course['title'], course['dept'], course['units'], 
                        course['level'], course['description'], 
                        json.dumps(course['terms_offered']),
                        course['prereqs'], 
                        json.dumps(course['skills']),
                        json.dumps(course['workload']),
                        json.dumps(course['assessments']),
                        course['source_url']
                    ))
                
                conn.commit()
                print(f"✅ Uploaded {len(courses_data)} courses")
    
    def upload_programs(self, programs_data: List[Dict[str, Any]]):
        """Upload programs as options"""
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                for program in programs_data:
                    cur.execute("""
                        INSERT INTO options (id, name, program, faculty, description, source_url)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            program = EXCLUDED.program,
                            faculty = EXCLUDED.faculty,
                            description = EXCLUDED.description,
                            source_url = EXCLUDED.source_url,
                            updated_at = NOW()
                    """, (
                        program['id'], program['name'], program['degree'], 'Engineering',
                        program['description'], program.get('source_url', '')
                    ))
                
                conn.commit()
                print(f"✅ Uploaded {len(programs_data)} programs")
    
    def process_json_file(self, json_file_path: str):
        """Main method to process the JSON file"""
        print(f"📖 Reading JSON file: {json_file_path}")
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        print("🔄 Processing programs and courses...")
        courses_data, programs_data = self.process_programs(json_data)
        
        print(f"📊 Found {len(courses_data)} unique courses across {len(programs_data)} programs")
        
        print("💾 Uploading courses to database...")
        self.upload_courses(courses_data)
        
        print("💾 Uploading programs to database...")
        self.upload_programs(programs_data)
        
        print("🎉 Data processing complete!")

def main():
    if len(sys.argv) < 2:
        print("Usage: python process_uw_json.py <json_file_path>")
        print("Example: python process_uw_json.py uw_engineering_core_by_program_updated.json")
        sys.exit(1)
    
    json_file = sys.argv[1]
    if not os.path.exists(json_file):
        print(f"❌ File not found: {json_file}")
        sys.exit(1)
    
    processor = UWDataProcessor()
    processor.process_json_file(json_file)

if __name__ == "__main__":
    main()
