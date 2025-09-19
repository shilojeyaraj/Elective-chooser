#!/usr/bin/env python3
"""
Ingest CSE (Complementary Studies Electives) from CSV file
"""

import os
import csv
import sys
from supabase import create_client, Client
from typing import Dict, List, Any

class CSEElectivesIngestion:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            print("❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set")
            sys.exit(1)
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        print("✅ Connected to Supabase")

    def parse_course_code(self, course_code: str) -> Dict[str, Any]:
        """Parse course code like 'ANTH106' into components"""
        if not course_code or course_code.strip() == '':
            return None
            
        # Extract department and number
        import re
        match = re.match(r'^([A-Z]+)(\d+[A-Z]?)$', course_code.strip())
        if not match:
            return None
            
        dept = match.group(1)
        number_str = match.group(2)
        
        # Extract number (remove any letter suffix)
        number = int(''.join(filter(str.isdigit, number_str)))
        
        return {
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

    def process_cse_electives(self, csv_file_path: str) -> List[Dict[str, Any]]:
        """Process CSE electives CSV and create course data"""
        courses = []
        seen_codes = set()
        
        print("🔄 Processing CSE electives from CSV...")
        
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            header = next(reader)  # Skip header
            
            for row in reader:
                if len(row) < 1:
                    continue
                
                # Parse the CSV row properly
                import re
                # Use regex to split by comma but respect quoted fields
                data = re.findall(r'(?:^|,)(?:"([^"]*)"|([^,]*))', row[0])
                data = [field[0] or field[1] for field in data]
                
                if len(data) < 7:
                    continue
                    
                list_name = data[0].strip()
                category = data[1].strip()
                course_code = data[2].strip()
                course_name = data[3].strip()
                units = float(data[4].strip()) if data[4].strip() else 0.5
                subject_code = data[5].strip()
                course_type = data[6].strip()
                
                if not course_code or not course_name:
                    continue
                
                # Skip duplicates
                if course_code in seen_codes:
                    continue
                seen_codes.add(course_code)
                
                # Parse course code
                course_info = self.parse_course_code(course_code)
                if not course_info:
                    continue
                
                # Create course entry
                course = {
                    'id': course_code,
                    'title': course_name,
                    'dept': course_info['dept'],
                    'number': course_info['number'],
                    'units': units,
                    'level': course_info['level'],
                    'description': f"CSE elective: {course_name} - {category}",
                    'faculty': 'Arts' if course_info['dept'] in ['ANTH', 'BET', 'CLAS', 'ENGL', 'HIST', 'PHIL', 'PSYCH', 'SOC'] else 'Other',
                    'terms_offered': ["F", "W", "S"],
                    'prereqs': '',
                    'workload': {"reading": 3, "assignments": 2, "projects": 1, "labs": 0},
                    'assessments': {"midterm": 25, "final": 35, "assignments": 30, "participation": 10},
                    'source_url': f"https://uwaterloo.ca/arts/undergraduate-studies/course-catalog/{course_code.lower()}",
                    'cse_classification': list_name,
                    'skills': [category.lower().replace('_', ' '), 'complementary studies', 'general education']
                }
                
                courses.append(course)
        
        return courses

    def upload_cse_electives(self, courses_data: List[Dict[str, Any]]):
        """Upload CSE electives to Supabase"""
        print(f"📚 Uploading {len(courses_data)} CSE electives...")
        
        # Upload in batches using upsert to handle duplicates
        batch_size = 50
        for i in range(0, len(courses_data), batch_size):
            batch = courses_data[i:i + batch_size]
            result = self.supabase.table('courses').upsert(batch, on_conflict='id').execute()
            print(f"✅ Uploaded batch {i//batch_size + 1}/{(len(courses_data) + batch_size - 1)//batch_size}")
        
        print(f"✅ Successfully uploaded {len(courses_data)} CSE electives!")

    def process_csv_file(self, csv_file_path: str):
        """Main method to process the CSV file"""
        print(f"📖 Reading CSV file: {csv_file_path}")
        
        if not os.path.exists(csv_file_path):
            print(f"❌ Error: File {csv_file_path} not found")
            sys.exit(1)
        
        print("🔄 Processing CSE electives...")
        courses_data = self.process_cse_electives(csv_file_path)
        
        print(f"📊 Found {len(courses_data)} CSE electives")
        
        print("💾 Uploading CSE electives to Supabase...")
        self.upload_cse_electives(courses_data)
        
        print("🎉 CSE electives processing complete!")

def main():
    if len(sys.argv) < 2:
        print("Usage: python ingest-cse-electives.py <csv_file_path>")
        print("Example: python ingest-cse-electives.py 'CSE_s (1).csv'")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    processor = CSEElectivesIngestion()
    processor.process_csv_file(csv_file)

if __name__ == "__main__":
    main()
