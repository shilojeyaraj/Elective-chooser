#!/usr/bin/env python3
"""
Ingest the waterloo_engineering_minors_concurrent_accelerated.json file
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

class MinorsConcurrentIngestion:
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
    
    def process_minors(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process minors data"""
        print("📖 Processing minors data...")
        
        minors = []
        general_info = data.get('minors', {}).get('general_info', {})
        examples = data.get('minors', {}).get('examples', [])
        
        # Add general minors information
        minors.append({
            'name': 'General Minors Information',
            'faculty': 'Various Faculties',
            'description': general_info.get('description', ''),
            'requirements': general_info.get('requirements', ''),
            'diploma_note': general_info.get('diploma_note', ''),
            'advice': general_info.get('advice', ''),
            'is_engineering_offered': False,
            'available_to_engineering': True,
            'units_required': 5.0,
            'courses_required': 10,
            'description_long': general_info.get('description', ''),
            'source_url': 'https://uwaterloo.ca/engineering/undergraduate-studies/minors'
        })
        
        # Add example minors
        for example in examples:
            # Parse faculty from example string
            if '(' in example and ')' in example:
                name = example.split('(')[0].strip()
                faculty = example.split('(')[1].split(')')[0].strip()
            else:
                name = example
                faculty = 'Unknown'
            
            minors.append({
                'name': name,
                'faculty': faculty,
                'description': f"Example minor available to engineering students: {name}",
                'requirements': 'Normally requires a minimum of 10 courses (approx. 5.0 units)',
                'diploma_note': 'Minors are noted on your diploma',
                'advice': 'Contact your academic advisor for more information',
                'is_engineering_offered': False,
                'available_to_engineering': True,
                'units_required': 5.0,
                'courses_required': 10,
                'description_long': f"Example minor available to engineering students: {name}",
                'source_url': 'https://uwaterloo.ca/engineering/undergraduate-studies/minors'
            })
        
        print(f"✅ Processed {len(minors)} minors entries")
        return minors
    
    def process_concurrent_degrees(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process concurrent degrees data"""
        print("📖 Processing concurrent degrees data...")
        
        concurrent_degrees = []
        general_info = data.get('concurrent_degrees', {}).get('general_info', {})
        
        concurrent_degrees.append({
            'name': 'Concurrent Bachelor of Arts (BA)',
            'description': general_info.get('description', ''),
            'requirements': general_info.get('requirements', ''),
            'advice': general_info.get('advice', ''),
            'available_to_engineering': True,
            'extra_courses_required': 'Significant number of extra courses',
            'approval_required': 'Agreement from both Faculties',
            'source_url': 'https://uwaterloo.ca/engineering/undergraduate-studies/concurrent-degrees'
        })
        
        print(f"✅ Processed {len(concurrent_degrees)} concurrent degrees entries")
        return concurrent_degrees
    
    def process_accelerated_masters(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process accelerated masters data"""
        print("📖 Processing accelerated masters data...")
        
        accelerated_masters = []
        accel_data = data.get('accelerated_masters', {})
        
        # Process funding options
        funding_options = accel_data.get('funding_options', [])
        
        # Process tuition reimbursement
        tuition_reimbursement = accel_data.get('tuition_reimbursement', {})
        
        # Process application process
        application_process = accel_data.get('application_process', [])
        
        accelerated_masters.append({
            'program_name': accel_data.get('program_name', ''),
            'description': accel_data.get('description', ''),
            'administered_by': accel_data.get('administered_by', ''),
            'offered_by': accel_data.get('offered_by', ''),
            'average_requirement': accel_data.get('eligibility', {}).get('average_requirement', ''),
            'record_requirement': accel_data.get('eligibility', {}).get('record_requirement', ''),
            'graduate_courses_info': accel_data.get('structure', {}).get('graduate_courses', ''),
            'research_opportunities': accel_data.get('structure', {}).get('research', ''),
            'funding_options': funding_options,
            'tuition_reimbursement': tuition_reimbursement,
            'application_process': application_process,
            'available_to_engineering': True,
            'source_url': 'https://uwaterloo.ca/engineering/undergraduate-studies/accelerated-masters'
        })
        
        print(f"✅ Processed {len(accelerated_masters)} accelerated masters entries")
        return accelerated_masters
    
    def create_engineering_program_associations(self, data: Dict[str, Any]):
        """Create associations between programs and engineering programs"""
        print("🔗 Creating engineering program associations...")
        
        engineering_programs = data.get('engineering_programs', [])
        
        # Get the IDs of the created records
        minors_result = self.supabase.table('minors').select('id, name').execute()
        concurrent_result = self.supabase.table('concurrent_degrees').select('id, name').execute()
        accelerated_result = self.supabase.table('accelerated_masters').select('id, program_name').execute()
        
        # Create associations for minors
        for minor in minors_result.data:
            for program in engineering_programs:
                self.supabase.table('minors_engineering_programs').insert({
                    'minor_id': minor['id'],
                    'engineering_program': program
                }).execute()
        
        # Create associations for concurrent degrees
        for concurrent in concurrent_result.data:
            for program in engineering_programs:
                self.supabase.table('concurrent_degrees_engineering_programs').insert({
                    'concurrent_degree_id': concurrent['id'],
                    'engineering_program': program
                }).execute()
        
        # Create associations for accelerated masters
        for accelerated in accelerated_result.data:
            for program in engineering_programs:
                self.supabase.table('accelerated_masters_engineering_programs').insert({
                    'accelerated_master_id': accelerated['id'],
                    'engineering_program': program
                }).execute()
        
        print("✅ Created engineering program associations")
    
    def upload_data(self, table_name: str, data: List[Dict[str, Any]]):
        """Upload data to Supabase table"""
        if not data:
            print(f"⚠️ No data to upload for {table_name}")
            return
        
        print(f"📤 Uploading {len(data)} records to {table_name}...")
        
        try:
            # Use insert instead of upsert since we cleared the data
            result = self.supabase.table(table_name).insert(data).execute()
            print(f"✅ Successfully uploaded {len(data)} records to {table_name}!")
        except Exception as e:
            print(f"❌ Error uploading to {table_name}: {e}")
            # Try to upload one by one to see which record fails
            for i, record in enumerate(data):
                try:
                    self.supabase.table(table_name).insert(record).execute()
                    print(f"✅ Record {i+1} uploaded successfully")
                except Exception as record_error:
                    print(f"❌ Record {i+1} failed: {record_error}")
                    print(f"Record data: {record}")
    
    def ingest_minors_concurrent(self):
        """Main method to ingest the minors/concurrent/accelerated masters data"""
        print("🚀 Starting minors/concurrent/accelerated masters data ingestion...")
        
        # Load JSON data
        with open('waterloo_engineering_minors_concurrent_accelerated.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Process each data type
        minors = self.process_minors(data)
        concurrent_degrees = self.process_concurrent_degrees(data)
        accelerated_masters = self.process_accelerated_masters(data)
        
        # Clear existing data
        print("🗑️ Clearing existing data...")
        self.supabase.table('minors_engineering_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        self.supabase.table('concurrent_degrees_engineering_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        self.supabase.table('accelerated_masters_engineering_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        self.supabase.table('minors').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        self.supabase.table('concurrent_degrees').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        self.supabase.table('accelerated_masters').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        # Upload data
        self.upload_data('minors', minors)
        self.upload_data('concurrent_degrees', concurrent_degrees)
        self.upload_data('accelerated_masters', accelerated_masters)
        
        # Create associations
        self.create_engineering_program_associations(data)
        
        print("🎉 Minors/concurrent/accelerated masters data ingestion complete!")
        print(f"📊 Summary:")
        print(f"  - Minors: {len(minors)}")
        print(f"  - Concurrent Degrees: {len(concurrent_degrees)}")
        print(f"  - Accelerated Masters: {len(accelerated_masters)}")

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("Usage: python ingest-minors-concurrent.py")
        print("This script will process waterloo_engineering_minors_concurrent_accelerated.json and update the database")
        return
    
    processor = MinorsConcurrentIngestion()
    processor.ingest_minors_concurrent()

if __name__ == "__main__":
    main()
