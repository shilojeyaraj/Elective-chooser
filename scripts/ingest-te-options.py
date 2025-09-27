#!/usr/bin/env python3
"""
Ingest Technical Elective (TE) options from CSV file
"""

import os
import csv
import sys
from supabase import create_client, Client
from typing import Dict, List, Any

class TEOptionsIngestion:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            print("❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set")
            sys.exit(1)
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        print("✅ Connected to Supabase")

    def parse_course_code(self, course_code: str) -> Dict[str, Any]:
        """Parse course code like 'AE 301' into components"""
        if not course_code or course_code.strip() == '':
            return None
            
        parts = course_code.strip().split()
        if len(parts) < 2:
            return None
            
        dept = parts[0]
        number_str = parts[1]
        
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

    def process_te_options(self, csv_file_path: str) -> List[Dict[str, Any]]:
        """Process TE options CSV and create options data"""
        options = []
        seen_ids = set()
        
        print("🔄 Processing TE options from CSV...")
        
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                program = row['Program']
                course_code = row['Course_Code']
                course_title = row['Course_Title']
                bucket = row['Bucket']
                rule = row['Rule']
                helps_fulfill = row['Helps_Fulfill_Option']
                
                if not course_code or not course_title:
                    continue
                
                # Parse course code
                course_info = self.parse_course_code(course_code)
                if not course_info:
                    continue
                
                # Create unique option ID with row number to avoid duplicates
                option_id = f"{program.lower().replace(' ', '-')}-{course_code.replace(' ', '-')}-{len(options)}"
                
                # Skip if we've already seen this exact combination
                unique_key = f"{program}-{course_code}-{course_title}"
                if unique_key in seen_ids:
                    continue
                seen_ids.add(unique_key)
                
                # Create option entry
                option = {
                    'id': option_id,
                    'name': course_title,
                    'program': program,
                    'faculty': 'Engineering',
                    'description': f"Technical elective for {program} - {helps_fulfill}",
                    'required_courses': [course_code],
                    'selective_rules': {
                        'bucket': bucket,
                        'rule': rule,
                        'helps_fulfill': helps_fulfill
                    },
                    'source_url': f"https://uwaterloo.ca/engineering/undergraduate-studies/{program.lower().replace(' ', '-')}",
                    'course_code': course_code,
                    'course_title': course_title,
                    'dept': course_info['dept'],
                    'number': course_info['number'],
                    'level': course_info['level']
                }
                
                options.append(option)
        
        return options

    def upload_te_options(self, options_data: List[Dict[str, Any]]):
        """Upload TE options to Supabase"""
        print(f"📋 Uploading {len(options_data)} TE options...")
        
        # Clear existing options first
        print("🗑️ Clearing existing options...")
        self.supabase.table('options').delete().neq('id', '').execute()
        
        # Upload in batches using upsert to handle duplicates
        batch_size = 50
        for i in range(0, len(options_data), batch_size):
            batch = options_data[i:i + batch_size]
            result = self.supabase.table('options').upsert(batch, on_conflict='id').execute()
            print(f"✅ Uploaded batch {i//batch_size + 1}/{(len(options_data) + batch_size - 1)//batch_size}")
        
        print(f"✅ Successfully uploaded {len(options_data)} TE options!")

    def process_csv_file(self, csv_file_path: str):
        """Main method to process the CSV file"""
        print(f"📖 Reading CSV file: {csv_file_path}")
        
        if not os.path.exists(csv_file_path):
            print(f"❌ Error: File {csv_file_path} not found")
            sys.exit(1)
        
        print("🔄 Processing TE options...")
        options_data = self.process_te_options(csv_file_path)
        
        print(f"📊 Found {len(options_data)} TE options")
        
        print("💾 Uploading TE options to Supabase...")
        self.upload_te_options(options_data)
        
        print("🎉 TE options processing complete!")

def main():
    if len(sys.argv) < 2:
        print("Usage: python ingest-te-options.py <csv_file_path>")
        print("Example: python ingest-te-options.py waterloo_engineering_TE_options_full_ALL_programs_with_option_column.csv")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    processor = TEOptionsIngestion()
    processor.process_csv_file(csv_file)

if __name__ == "__main__":
    main()
