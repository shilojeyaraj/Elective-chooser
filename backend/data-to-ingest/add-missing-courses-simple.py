#!/usr/bin/env python3
"""
Simple script to add missing courses to the database
"""

import os
import sys
from supabase import create_client
from dotenv import load_dotenv
import time

# Load environment variables
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# Initialize Supabase client
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

def create_basic_course_info(course_id):
    """Create basic course information matching the database schema"""
    clean_id = course_id.replace(' ', '')
    
    # Extract department and number
    dept = clean_id[:3] if len(clean_id) >= 3 else clean_id[:2]
    number = int(clean_id[3:]) if len(clean_id) > 3 and clean_id[3:].isdigit() else 200
    
    # Determine faculty based on department
    faculty = 'Engineering'
    if dept in ['CS', 'MATH', 'STAT']:
        faculty = 'Mathematics'
    elif dept in ['BIOL', 'CHEM', 'PHYS']:
        faculty = 'Science'
    elif dept in ['ECON', 'PSYCH', 'SOC', 'HIST', 'PHIL', 'ENGL', 'FR', 'GER', 'SPAN', 'GRK', 'DUTCH']:
        faculty = 'Arts'
    elif dept in ['BET', 'MGMT', 'MSCI', 'COMMST']:
        faculty = 'Arts'
    elif dept in ['KIN', 'HLTH', 'HEALTH']:
        faculty = 'Health'
    elif dept in ['GEOG', 'PLAN', 'ERS', 'ENVS']:
        faculty = 'Environment'
    
    return {
        'id': clean_id,
        'title': f'{clean_id} - Course',
        'description': f'Course {clean_id} covering various topics in {dept}.',
        'units': 0.5,
        'level': number,
        'terms_offered': ['F', 'W', 'S'],
        'prereqs': '',
        'workload': {'labs': 0, 'reading': 2, 'projects': 0, 'assignments': 2},
        'skills': ['General Knowledge', 'Critical Thinking', 'Analysis'],
        'assessments': {'final': 40, 'midterm': 30, 'assignments': 20, 'participation': 10},
        'source_url': f'https://uwaterloo.ca/engineering/undergraduate-studies/course-catalog/{clean_id.lower()}',
        'dept': dept,
        'number': number,
        'faculty': faculty,
        'cse_classification': 'A',
        'embedding': None,
        'fulfills_options': [],
        'fulfills_specializations': [],
        'fulfills_certificates': [],
        'fulfills_diplomas': []
    }

def add_missing_courses():
    """Add all missing courses to the database"""
    
    # Get all courses that should exist based on our comprehensive mapping
    all_required_courses = set()
    
    # Software Engineering courses
    software_engineering_courses = [
        'CS445', 'ECE451', 'SE463', 'CS446', 'ECE452', 'SE464', 'CS447', 'ECE453', 'SE465',
        'AE121', 'BME121', 'CHE120', 'CIVE121', 'CS115', 'CS116', 'CS135', 'CS137', 'CS145',
        'ECE150', 'ENVE121', 'GEOE121', 'ME101', 'MSE121', 'MTE121', 'NE111', 'SYDE121',
        'BME122', 'CS136', 'CS138', 'CS146', 'CS231', 'ECE250', 'MSE240', 'MTE140', 'SYDE223',
        'BIOL487', 'BME393', 'BME411', 'CHE322', 'CIVE422', 'EARTH456', 'ENVE225', 'NE336',
        'CS230', 'CS234', 'CS245', 'CS338', 'CS445', 'CS446', 'CS447',
        'ECE124', 'ECE204', 'ECE208', 'ECE222', 'ECE224', 'ECE252', 'ECE320', 'ECE327', 'ECE350',
        'ECE351', 'ECE356', 'ECE358', 'ECE406', 'ECE409', 'ECE417', 'ECE423', 'ECE451', 'ECE452',
        'ECE453', 'ECE454', 'ECE455', 'ECE457A', 'ECE457B', 'ECE457C', 'ECE458', 'ECE459',
        'ME262', 'ME559', 'ME566',
        'MSE245', 'MSE342', 'MSE343', 'MSE436', 'MSE446', 'MSE541', 'MSE543', 'MSE546',
        'MTE204', 'MTE241', 'MTE262', 'MTE325', 'MTE544', 'MTE546',
        'SE212', 'SE350', 'SE463', 'SE464', 'SE465',
        'SYDE192', 'SYDE411', 'SYDE522', 'SYDE542', 'SYDE543', 'SYDE548', 'SYDE552', 'SYDE556',
        'SYDE572', 'SYDE575', 'SYDE577',
        'CS492', 'HIST212', 'MSE442', 'SOC324', 'STV205', 'STV208', 'STV210', 'STV302',
    ]
    
    # Add all courses from our comprehensive mapping
    all_required_courses.update(software_engineering_courses)
    
    # Get existing courses from database
    response = supabase.from_('courses').select('id').execute()
    existing_courses = {c['id'] for c in response.data} if response.data else set()
    
    # Find missing courses
    missing_courses = all_required_courses - existing_courses
    
    print(f"📚 Found {len(existing_courses)} existing courses")
    print(f"🔍 Need {len(all_required_courses)} total courses")
    print(f"➕ Missing {len(missing_courses)} courses")
    
    if not missing_courses:
        print("✅ All required courses already exist in the database!")
        return
    
    print(f"\n🔄 Adding {len(missing_courses)} missing courses...")
    
    added_count = 0
    for course_id in sorted(missing_courses):
        try:
            course_info = create_basic_course_info(course_id)
            
            # Insert course into database
            response = supabase.from_('courses').insert(course_info).execute()
            
            if response.data:
                print(f"✅ Added {course_id}: {course_info['title']}")
                added_count += 1
            else:
                print(f"❌ Failed to add {course_id}: {response.error}")
                
        except Exception as e:
            print(f"❌ Error adding {course_id}: {e}")
        
        # Small delay to avoid overwhelming the database
        time.sleep(0.1)
    
    print(f"\n🎉 Successfully added {added_count} courses to the database!")

def main():
    print("🚀 Starting missing courses addition...")
    
    try:
        add_missing_courses()
        print("✅ Missing courses addition completed successfully!")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
