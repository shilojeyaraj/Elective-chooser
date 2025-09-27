#!/usr/bin/env python3
"""
Comprehensive course-to-option mapping
This script maps every course to all possible options/specializations/diplomas it can fulfill
"""

import os
import sys
import json
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(url, key)

# Comprehensive mapping of courses to all possible options they can fulfill
COMPREHENSIVE_COURSE_MAPPINGS = {
    # Computer Science Courses
    'CS 486': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering', 'quantum-engineering'],
        'specializations': ['artificial-intelligence', 'machine-learning', 'computer-vision', 'software-engineering'],
        'diplomas': ['ai-diploma', 'software-diploma']
    },
    'CS 480': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering', 'statistics'],
        'specializations': ['machine-learning', 'artificial-intelligence', 'data-science'],
        'diplomas': ['ai-diploma', 'data-science-diploma']
    },
    'CS 488': {
        'options': ['computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['computer-graphics', 'software-engineering', 'computer-vision'],
        'diplomas': ['software-diploma', 'graphics-diploma']
    },
    'CS 489': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['computer-graphics', 'computer-vision', 'software-engineering'],
        'diplomas': ['graphics-diploma', 'software-diploma']
    },
    'CS 490': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['computer-vision', 'artificial-intelligence', 'machine-learning'],
        'diplomas': ['ai-diploma', 'computer-vision-diploma']
    },
    'CS 485': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering', 'statistics', 'management-science'],
        'specializations': ['machine-learning', 'data-science', 'statistics'],
        'diplomas': ['data-science-diploma', 'ai-diploma']
    },
    'CS 135': {
        'options': ['computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['programming', 'software-engineering'],
        'diplomas': ['programming-diploma']
    },
    'CS 136': {
        'options': ['computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['programming', 'software-engineering', 'algorithms'],
        'diplomas': ['programming-diploma']
    },
    'CS 137': {
        'options': ['computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['programming', 'software-engineering'],
        'diplomas': ['programming-diploma']
    },
    
    # Electrical and Computer Engineering Courses
    'ECE 456': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering', 'quantum-engineering', 'statistics', 'management-science', 'mechatronics'],
        'specializations': ['machine-learning', 'artificial-intelligence', 'data-science', 'robotics'],
        'diplomas': ['ai-diploma', 'data-science-diploma', 'robotics-diploma']
    },
    'ECE 457': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering', 'statistics', 'management-science', 'mechatronics', 'biomechanics', 'life-sciences'],
        'specializations': ['machine-learning', 'pattern-recognition', 'artificial-intelligence', 'robotics'],
        'diplomas': ['ai-diploma', 'robotics-diploma']
    },
    'ECE 457A': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering', 'statistics', 'management-science', 'mechatronics'],
        'specializations': ['machine-learning', 'pattern-recognition', 'artificial-intelligence'],
        'diplomas': ['ai-diploma']
    },
    'ECE 457B': {
        'options': ['artificial-intelligence', 'computer-engineering', 'computing', 'software-engineering', 'statistics', 'management-science', 'mechatronics'],
        'specializations': ['machine-learning', 'pattern-recognition', 'artificial-intelligence'],
        'diplomas': ['ai-diploma']
    },
    'ECE 486': {
        'options': ['computer-engineering', 'mechatronics', 'physical-sciences', 'quantum-engineering', 'environmental-engineering'],
        'specializations': ['control-systems', 'robotics', 'signal-processing'],
        'diplomas': ['control-diploma', 'robotics-diploma']
    },
    'ECE 150': {
        'options': ['computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['programming', 'software-engineering'],
        'diplomas': ['programming-diploma']
    },
    'ECE 155': {
        'options': ['computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['programming', 'software-engineering'],
        'diplomas': ['programming-diploma']
    },
    'ECE 250': {
        'options': ['computer-engineering', 'computing', 'software-engineering'],
        'specializations': ['programming', 'software-engineering'],
        'diplomas': ['programming-diploma']
    },
    
    # Mechatronics Engineering Courses
    'MTE 453': {
        'options': ['mechatronics', 'biomechanics', 'life-sciences', 'entrepreneurship', 'artificial-intelligence'],
        'specializations': ['robotics', 'control-systems', 'mechatronics-design'],
        'diplomas': ['robotics-diploma', 'mechatronics-diploma']
    },
    'MTE 454': {
        'options': ['mechatronics', 'biomechanics', 'life-sciences', 'entrepreneurship'],
        'specializations': ['robotics', 'advanced-robotics', 'mechatronics-design'],
        'diplomas': ['robotics-diploma', 'mechatronics-diploma']
    },
    'MTE 380': {
        'options': ['mechatronics', 'biomechanics', 'life-sciences', 'physical-sciences', 'environmental-engineering', 'control-systems'],
        'specializations': ['control-systems', 'robotics', 'mechatronics-design'],
        'diplomas': ['control-diploma', 'robotics-diploma']
    },
    'MTE 481': {
        'options': ['mechatronics', 'biomechanics', 'life-sciences', 'physical-sciences', 'environmental-engineering', 'control-systems'],
        'specializations': ['digital-control', 'control-systems', 'robotics'],
        'diplomas': ['control-diploma', 'robotics-diploma']
    },
    'MTE 100': {
        'options': ['mechatronics', 'physical-sciences'],
        'specializations': ['mechatronics-fundamentals', 'mechanical-design'],
        'diplomas': ['mechatronics-diploma']
    },
    'MTE 100L': {
        'options': ['mechatronics', 'physical-sciences'],
        'specializations': ['mechatronics-fundamentals', 'laboratory-skills'],
        'diplomas': ['mechatronics-diploma']
    },
    'MTE 120': {
        'options': ['mechatronics', 'physical-sciences'],
        'specializations': ['mechatronics-fundamentals', 'mechanical-design'],
        'diplomas': ['mechatronics-diploma']
    },
    'MTE 140': {
        'options': ['mechatronics', 'physical-sciences'],
        'specializations': ['mechatronics-fundamentals', 'mechanical-design'],
        'diplomas': ['mechatronics-diploma']
    },
    
    # Mechanical Engineering Courses
    'ME 200': {
        'options': ['mechatronics', 'physical-sciences', 'biomechanics'],
        'specializations': ['mechanical-design', 'thermodynamics'],
        'diplomas': ['mechanical-diploma']
    },
    'ME 250': {
        'options': ['mechatronics', 'physical-sciences', 'biomechanics'],
        'specializations': ['mechanical-design', 'materials'],
        'diplomas': ['mechanical-diploma']
    },
    'ME 300': {
        'options': ['mechatronics', 'physical-sciences', 'biomechanics'],
        'specializations': ['mechanical-design', 'advanced-thermodynamics'],
        'diplomas': ['mechanical-diploma']
    },
    
    # Mathematics Courses
    'MATH 211': {
        'options': ['statistics', 'management-science', 'physical-sciences'],
        'specializations': ['mathematics', 'statistics'],
        'diplomas': ['mathematics-diploma']
    },
    'MATH 213': {
        'options': ['statistics', 'management-science', 'physical-sciences'],
        'specializations': ['mathematics', 'statistics'],
        'diplomas': ['mathematics-diploma']
    },
    'MATH 215': {
        'options': ['statistics', 'management-science', 'physical-sciences'],
        'specializations': ['mathematics', 'statistics'],
        'diplomas': ['mathematics-diploma']
    },
    'MATH 115': {
        'options': ['statistics', 'management-science', 'physical-sciences'],
        'specializations': ['mathematics', 'statistics'],
        'diplomas': ['mathematics-diploma']
    },
    'MATH 117': {
        'options': ['statistics', 'management-science', 'physical-sciences'],
        'specializations': ['mathematics', 'statistics'],
        'diplomas': ['mathematics-diploma']
    },
    'MATH 119': {
        'options': ['statistics', 'management-science', 'physical-sciences'],
        'specializations': ['mathematics', 'statistics'],
        'diplomas': ['mathematics-diploma']
    },
    
    # Physics Courses
    'PHYS 115': {
        'options': ['physical-sciences', 'quantum-engineering'],
        'specializations': ['physics', 'quantum-physics'],
        'diplomas': ['physics-diploma']
    },
    'PHYS 125': {
        'options': ['physical-sciences', 'quantum-engineering'],
        'specializations': ['physics', 'quantum-physics'],
        'diplomas': ['physics-diploma']
    },
    'PHYS 175': {
        'options': ['physical-sciences', 'quantum-engineering'],
        'specializations': ['physics', 'quantum-physics'],
        'diplomas': ['physics-diploma']
    },
    
    # Chemistry Courses
    'CHE 102': {
        'options': ['physical-sciences', 'life-sciences', 'environmental-engineering'],
        'specializations': ['chemistry', 'biochemistry'],
        'diplomas': ['chemistry-diploma']
    },
    
    # Biology Courses
    'BIOL 130': {
        'options': ['life-sciences', 'biomechanics'],
        'specializations': ['biology', 'molecular-biology', 'cell-biology'],
        'diplomas': ['biology-diploma']
    },
    'BIOL 140': {
        'options': ['life-sciences', 'biomechanics'],
        'specializations': ['biology', 'molecular-biology', 'cell-biology'],
        'diplomas': ['biology-diploma']
    },
    
    # Business/Management Courses
    'BUS 111': {
        'options': ['entrepreneurship', 'management-science'],
        'specializations': ['business', 'entrepreneurship', 'management'],
        'diplomas': ['business-diploma', 'entrepreneurship-diploma']
    },
    'BUS 121': {
        'options': ['entrepreneurship', 'management-science'],
        'specializations': ['business', 'entrepreneurship', 'management'],
        'diplomas': ['business-diploma', 'entrepreneurship-diploma']
    },
    
    # Environmental Courses
    'ENV 200': {
        'options': ['environmental-engineering', 'life-sciences'],
        'specializations': ['environmental-science', 'sustainability'],
        'diplomas': ['environmental-diploma']
    },
    'ENV 300': {
        'options': ['environmental-engineering', 'life-sciences'],
        'specializations': ['environmental-science', 'sustainability'],
        'diplomas': ['environmental-diploma']
    }
}

def update_all_courses_with_comprehensive_mapping():
    """Update all courses with comprehensive option/specialization/diploma mappings"""
    print("🔄 Updating all courses with comprehensive mappings...")
    
    # Get all courses from database
    { data: courses, error } = supabase.from('courses').select('id, title').execute()
    
    if error:
        print(f"❌ Error fetching courses: {error}")
        return
    
    print(f"📚 Found {len(courses)} courses to update")
    
    updated_count = 0
    for course in courses:
        course_id = course['id']
        
        # Get mappings for this course
        mappings = COMPREHENSIVE_COURSE_MAPPINGS.get(course_id, {})
        
        if mappings:
            update_data = {}
            
            if 'options' in mappings:
                update_data['fulfills_options'] = mappings['options']
            
            if 'specializations' in mappings:
                update_data['fulfills_specializations'] = mappings['specializations']
            
            if 'diplomas' in mappings:
                update_data['fulfills_diplomas'] = mappings['diplomas']
            
            # Update the course
            { error: update_error } = supabase.from('courses').update(update_data).eq('id', course_id).execute()
            
            if update_error:
                print(f"❌ Error updating course {course_id}: {update_error}")
            else:
                print(f"✅ Updated {course_id}: {update_data}")
                updated_count += 1
        else:
            # For courses not in our mapping, set empty arrays
            update_data = {
                'fulfills_options': [],
                'fulfills_specializations': [],
                'fulfills_diplomas': []
            }
            
            { error: update_error } = supabase.from('courses').update(update_data).eq('id', course_id).execute()
            
            if update_error:
                print(f"❌ Error updating course {course_id}: {update_error}")
            else:
                print(f"ℹ️ Set empty mappings for {course_id}")
                updated_count += 1
    
    print(f"✅ Updated {updated_count} courses with comprehensive mappings")

def create_specialization_definitions():
    """Create specialization definitions in the database"""
    print("🔄 Creating specialization definitions...")
    
    specializations = [
        {
            'id': 'artificial-intelligence',
            'name': 'Artificial Intelligence',
            'description': 'Focus on AI algorithms, machine learning, and intelligent systems',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'machine-learning',
            'name': 'Machine Learning',
            'description': 'Advanced machine learning techniques and applications',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'robotics',
            'name': 'Robotics',
            'description': 'Robotic systems design and control',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'control-systems',
            'name': 'Control Systems',
            'description': 'Control theory and system design',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'computer-vision',
            'name': 'Computer Vision',
            'description': 'Image processing and computer vision techniques',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'software-engineering',
            'name': 'Software Engineering',
            'description': 'Large-scale software system design and development',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'data-science',
            'name': 'Data Science',
            'description': 'Data analysis, statistics, and machine learning',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'mechatronics-design',
            'name': 'Mechatronics Design',
            'description': 'Integrated mechanical, electrical, and software design',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'biomechanics',
            'name': 'Biomechanics',
            'description': 'Application of engineering principles to biological systems',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'quantum-physics',
            'name': 'Quantum Physics',
            'description': 'Quantum mechanics and quantum engineering applications',
            'program': 'All Engineering Programs'
        }
    ]
    
    for spec in specializations:
        { error } = supabase.from('specializations').upsert(spec).execute()
        if error:
            print(f"❌ Error creating specialization {spec['id']}: {error}")
        else:
            print(f"✅ Created specialization: {spec['name']}")

def create_diploma_definitions():
    """Create diploma definitions in the database"""
    print("🔄 Creating diploma definitions...")
    
    diplomas = [
        {
            'id': 'ai-diploma',
            'name': 'Artificial Intelligence Diploma',
            'description': 'Comprehensive AI and machine learning education',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'robotics-diploma',
            'name': 'Robotics Diploma',
            'description': 'Advanced robotics and automation systems',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'software-diploma',
            'name': 'Software Engineering Diploma',
            'description': 'Professional software development skills',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'data-science-diploma',
            'name': 'Data Science Diploma',
            'description': 'Data analysis and machine learning expertise',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'mechatronics-diploma',
            'name': 'Mechatronics Diploma',
            'description': 'Integrated mechanical and electrical systems',
            'program': 'All Engineering Programs'
        },
        {
            'id': 'control-diploma',
            'name': 'Control Systems Diploma',
            'description': 'Advanced control theory and applications',
            'program': 'All Engineering Programs'
        }
    ]
    
    for diploma in diplomas:
        { error } = supabase.from('diplomas').upsert(diploma).execute()
        if error:
            print(f"❌ Error creating diploma {diploma['id']}: {error}")
        else:
            print(f"✅ Created diploma: {diploma['name']}")

def main():
    print("🚀 Starting comprehensive course-option mapping...")
    
    try:
        # Step 1: Create specializations
        create_specialization_definitions()
        
        # Step 2: Create diplomas
        create_diploma_definitions()
        
        # Step 3: Update all courses with comprehensive mappings
        update_all_courses_with_comprehensive_mapping()
        
        print("✅ Comprehensive course-option mapping completed!")
        
    except Exception as e:
        print(f"❌ Mapping failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
