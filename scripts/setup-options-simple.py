#!/usr/bin/env python3
"""
Simple setup script for option fulfillment
Run this to set up the complete options database
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
key = os.getenv('SUPABASE_KEY')  # Changed from SUPABASE_ANON_KEY to SUPABASE_KEY
supabase = create_client(url, key)

def run_sql_migration():
    """Run the SQL migration to add option fulfillment columns"""
    print("🔄 Running database migration...")
    
    # Read the SQL migration file
    with open('add-option-fulfillment-column.sql', 'r') as f:
        sql_content = f.read()
    
    # Split by semicolon and execute each statement
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
    
    for stmt in statements:
        if stmt:
            print(f'Executing: {stmt[:50]}...')
            try:
                result = supabase.rpc('exec_sql', {'sql': stmt})
                print('✅ Success')
            except Exception as e:
                print(f'❌ Error: {e}')

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
            'description': 'Learn about the design, implementation, and maintenance of large-scale software systems.'
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

def update_course_options():
    """Update courses with option fulfillment data"""
    print("🔄 Updating course options...")
    
    # Define option mappings for common courses
    OPTION_MAPPINGS = {
        'artificial-intelligence': [
            'CS 486', 'ECE 456', 'CS 480', 'ECE 457', 'CS 485', 'ECE 457A', 'ECE 457B', 'CS 489', 'CS 490',
        ],
        'biomechanics': [
            'MTE 453', 'MTE 454', 'MTE 380', 'MTE 481', 'ECE 456', 'ECE 457',
        ],
        'computer-engineering': [
            'CS 486', 'CS 480', 'CS 488', 'CS 489', 'CS 490', 'ECE 456', 'ECE 457', 'CS 485', 'ECE 486',
        ],
        'computing': [
            'CS 486', 'CS 480', 'CS 488', 'CS 489', 'CS 490', 'CS 485', 'ECE 456', 'ECE 457',
        ],
        'entrepreneurship': [
            'CS 486', 'ECE 456', 'MTE 453', 'MTE 454',
        ],
        'environmental-engineering': [
            'MTE 380', 'MTE 481', 'ECE 486',
        ],
        'life-sciences': [
            'MTE 453', 'MTE 454', 'ECE 456', 'ECE 457', 'MTE 380',
        ],
        'management-science': [
            'CS 486', 'ECE 456', 'CS 480', 'ECE 457', 'CS 485',
        ],
        'mechatronics': [
            'MTE 453', 'MTE 454', 'MTE 380', 'MTE 481', 'ECE 456', 'ECE 457', 'ECE 486',
        ],
        'physical-sciences': [
            'MTE 380', 'MTE 481', 'ECE 486', 'ECE 456', 'ECE 457',
        ],
        'quantum-engineering': [
            'ECE 456', 'ECE 457', 'ECE 486', 'CS 486',
        ],
        'software-engineering': [
            # Required Courses
            'CS 445', 'ECE 451', 'SE 463',  # Software Requirements
            'CS 446', 'ECE 452', 'SE 464',  # Software Design
            'CS 447', 'ECE 453', 'SE 465',  # Software Testing
            
            # List 1 - Programming Fundamentals
            'AE 121', 'BME 121', 'CHE 120', 'CIVE 121', 'CS 115', 'CS 116', 'CS 135', 'CS 137', 'CS 145',
            'ECE 150', 'ENVE 121', 'GEOE 121', 'ME 101', 'MSE 121', 'MTE 121', 'NE 111', 'SYDE 121',
            
            # List 2 - Data Structures and Algorithms
            'BME 122', 'CS 136', 'CS 138', 'CS 146', 'CS 231', 'ECE 250', 'MSE 240', 'MTE 140', 'SYDE 223',
            
            # List 3 - Advanced Computing Courses
            'BIOL 487', 'BME 393', 'BME 411', 'CHE 322', 'CIVE 422', 'EARTH 456', 'ENVE 225', 'NE 336',
            'CS 230', 'CS 234', 'CS 245', 'CS 338', 'CS 445', 'CS 446', 'CS 447',
            'ECE 124', 'ECE 204', 'ECE 208', 'ECE 222', 'ECE 224', 'ECE 252', 'ECE 320', 'ECE 327', 'ECE 350',
            'ECE 351', 'ECE 356', 'ECE 358', 'ECE 406', 'ECE 409', 'ECE 417', 'ECE 423', 'ECE 451', 'ECE 452',
            'ECE 453', 'ECE 454', 'ECE 455', 'ECE 457A', 'ECE 457B', 'ECE 457C', 'ECE 458', 'ECE 459',
            'ME 262', 'ME 559', 'ME 566',
            'MSE 245', 'MSE 342', 'MSE 343', 'MSE 436', 'MSE 446', 'MSE 541', 'MSE 543', 'MSE 546',
            'MTE 204', 'MTE 241', 'MTE 262', 'MTE 325', 'MTE 544', 'MTE 546',
            'SE 212', 'SE 350', 'SE 463', 'SE 464', 'SE 465',
            'SYDE 192', 'SYDE 411', 'SYDE 522', 'SYDE 542', 'SYDE 543', 'SYDE 548', 'SYDE 552', 'SYDE 556',
            'SYDE 572', 'SYDE 575', 'SYDE 577',
            
            # List 4 - Social Implications
            'CS 492', 'HIST 212', 'MSE 442', 'SOC 324', 'STV 205', 'STV 208', 'STV 210', 'STV 302',
        ],
        'statistics': [
            'CS 485', 'ECE 456', 'ECE 457', 'CS 480',
        ]
    }
    
    # Fetch all courses
    try:
        response = supabase.from_('courses').select('id').execute()
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        all_course_ids = [c['id'] for c in response.data] if response.data else []
        print(f"📚 Found {len(all_course_ids)} courses to update")
        
        for course_id in all_course_ids:
            fulfills_options = []
            fulfills_specializations = []  # Assuming specializations are similar for now
            
            for option_id, mapped_courses in OPTION_MAPPINGS.items():
                if course_id in mapped_courses:
                    fulfills_options.append(option_id)
                    fulfills_specializations.append(option_id)  # Assuming specializations are the same as options for now
            
            # Update the course in the database
            try:
                update_response = supabase.from_('courses').update({
                    'fulfills_options': fulfills_options,
                    'fulfills_specializations': fulfills_specializations
                }).eq('id', course_id).execute()
                
                if hasattr(update_response, 'error') and update_response.error:
                    print(f"❌ Error updating course {course_id}: {update_response.error}")
                else:
                    print(f"✅ Updated {course_id}: options={fulfills_options}")
            except Exception as e:
                print(f"❌ Error updating course {course_id}: {e}")
                
    except Exception as e:
        print(f"❌ Error fetching courses: {e}")

def populate_options():
    """Populate the options database"""
    print("🔄 Populating options data...")
    
    # Create option definitions
    create_option_definitions()
    
    # Update course options
    update_course_options()

def main():
    print("🚀 Starting complete option fulfillment setup...")
    
    try:
        # Step 1: Run database migration
        run_sql_migration()
        
        # Step 2: Populate options data
        populate_options()
        
        print("✅ Option fulfillment setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
