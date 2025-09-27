#!/usr/bin/env python3
"""
Comprehensive option mapping script
Maps every course to all options/specializations/diplomas it can fulfill
"""

import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# Initialize Supabase client
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

def create_detailed_option_mappings():
    """Create detailed mappings for all options with their specific course requirements"""
    
    # Software Engineering Option - Complete mapping
    software_engineering_courses = {
        'required': [
            'CS445', 'ECE451', 'SE463',  # Software Requirements
            'CS446', 'ECE452', 'SE464',  # Software Design  
            'CS447', 'ECE453', 'SE465',  # Software Testing
        ],
        'list1_programming': [
            'AE121', 'BME121', 'CHE120', 'CIVE121', 'CS115', 'CS116', 'CS135', 'CS137', 'CS145',
            'ECE150', 'ENVE121', 'GEOE121', 'ME101', 'MSE121', 'MTE121', 'NE111', 'SYDE121',
        ],
        'list2_data_structures': [
            'BME122', 'CS136', 'CS138', 'CS146', 'CS231', 'ECE250', 'MSE240', 'MTE140', 'SYDE223',
        ],
        'list3_advanced_computing': [
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
        ],
        'list4_social_implications': [
            'CS492', 'HIST212', 'MSE442', 'SOC324', 'STV205', 'STV208', 'STV210', 'STV302',
        ]
    }

def update_course_option_mappings():
    """Update all courses with their option fulfillment data"""
    print("🔄 Updating comprehensive course-option mappings...")
    
    option_mappings = create_detailed_option_mappings()
    
    # Fetch all courses
    try:
        response = supabase.from_('courses').select('id').execute()
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        all_course_ids = [c['id'] for c in response.data] if response.data else []
        print(f"📚 Found {len(all_course_ids)} courses to update")
        
        updated_count = 0
        for course_id in all_course_ids:
            fulfills_options = []
            fulfills_specializations = []
            
            # Check which options this course fulfills
            for option_id, courses in option_mappings.items():
                if course_id in courses:
                    fulfills_options.append(option_id)
                    fulfills_specializations.append(option_id)  # Assuming specializations = options for now
            
            # Update the course in the database
            try:
                update_response = supabase.from_('courses').update({
                    'fulfills_options': fulfills_options,
                    'fulfills_specializations': fulfills_specializations
                }).eq('id', course_id).execute()
                
                if hasattr(update_response, 'error') and update_response.error:
                    print(f"❌ Error updating course {course_id}: {update_response.error}")
                else:
                    if fulfills_options:  # Only log courses that fulfill options
                        print(f"✅ Updated {course_id}: options={fulfills_options}")
                        updated_count += 1
            except Exception as e:
                print(f"❌ Error updating course {course_id}: {e}")
        
        print(f"🎉 Successfully updated {updated_count} courses with option mappings!")
                
    except Exception as e:
        print(f"❌ Error fetching courses: {e}")

def create_option_definitions():
    """Create option definitions in the database"""
    print("🔄 Creating option definitions...")
    
    options = [
        {
            'id': 'artificial-intelligence',
            'name': 'Artificial Intelligence',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Study and advance ever-greater degrees of efficacy, reliability, and safety, the ways in which machines and systems perceive, see, speak, decide, respond, act, and plan.'
        },
        {
            'id': 'biomechanics',
            'name': 'Biomechanics',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Study solutions to health-care problems, birth defect prevention, medical imaging, prosthesis design, and ergonomics.'
        },
        {
            'id': 'computer-engineering',
            'name': 'Computer Engineering',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Develop skills in the areas of logic, digital hardware, operating systems, computing systems, databases, networks, and security and privacy.'
        },
        {
            'id': 'computing',
            'name': 'Computing',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Enrich your studies with knowledge in programming, data structures and algorithms, digital systems, human-computer interaction, and more.'
        },
        {
            'id': 'entrepreneurship',
            'name': 'Entrepreneurship',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Pursue an innovative pathway in engineering, and enrich your studies with courses in venture creation and corporate entrepreneurship.'
        },
        {
            'id': 'environmental-engineering',
            'name': 'Environmental Engineering',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Study pollution control, waste disposal, and health and sanitation.'
        },
        {
            'id': 'life-sciences',
            'name': 'Life Sciences',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Understand the structure and function of biological systems (choice of four sub-options): Molecular & Cell Biology, Environmental/Ecological Science, Biophysical Science, Biochemical Science.'
        },
        {
            'id': 'management-science',
            'name': 'Management Science',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Solve management problems using social sciences and mathematical models.'
        },
        {
            'id': 'mechatronics',
            'name': 'Mechatronics',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Design and develop "thinking" machines and devices.'
        },
        {
            'id': 'physical-sciences',
            'name': 'Physical Sciences',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Understand the basic physical sciences that lay behind many engineering applications (choice of three sub-options): Physics, Chemistry, Earth & Environmental Sciences.'
        },
        {
            'id': 'quantum-engineering',
            'name': 'Quantum Engineering',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Focus on foundations, design methodologies and experimental skills to analyze and implement technological platforms using quantum devices, systems and algorithms.'
        },
        {
            'id': 'software-engineering',
            'name': 'Software Engineering',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Learn about the design, implementation, and maintenance of large-scale software systems. Complete 4.0 units including required courses in software requirements, design, and testing, plus approved courses from programming fundamentals, data structures, advanced computing, and social implications.'
        },
        {
            'id': 'statistics',
            'name': 'Statistics',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Gain a broad background in applied statistics, including multiple regression, quality control, experimental design, and applied probability.'
        }
    ]
    
    for option in options:
        try:
            response = supabase.from_('options').upsert(option).execute()
            if response.data:
                print(f"✅ Created option: {option['name']}")
            else:
                print(f"❌ Error creating option {option['id']}: {response.error}")
        except Exception as e:
            print(f"❌ Error creating option {option['id']}: {e}")

def main():
    print("🚀 Starting comprehensive option mapping setup...")
    
    try:
        # Step 1: Create option definitions
        create_option_definitions()
        
        # Step 2: Update course mappings
        update_course_option_mappings()
        
        print("✅ Comprehensive option mapping setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
