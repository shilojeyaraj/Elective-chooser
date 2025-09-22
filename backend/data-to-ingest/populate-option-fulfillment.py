#!/usr/bin/env python3
"""
Populate option fulfillment data for courses
This script adds which options/specializations each course fulfills
"""

import os
import sys
import json
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

# Define option mappings for common courses based on official Waterloo options
OPTION_MAPPINGS = {
    # Artificial Intelligence Option
    'artificial-intelligence': [
        'CS 486',  # Introduction to Artificial Intelligence
        'ECE 456', # Machine Learning
        'CS 480',  # Introduction to Machine Learning
        'ECE 457', # Machine Learning and Pattern Recognition
        'CS 485',  # Statistical and Computational Foundations of Machine Learning
        'ECE 457A', # Machine Learning and Pattern Recognition
        'ECE 457B', # Machine Learning and Pattern Recognition
        'CS 489',  # Computer Graphics
        'CS 490',  # Introduction to Computer Vision
    ],
    
    # Biomechanics Option
    'biomechanics': [
        'MTE 453', # Robotics (for medical robotics)
        'MTE 454', # Advanced Robotics
        'MTE 380', # Control Systems
        'MTE 481', # Digital Control Systems
        'ECE 456', # Machine Learning (for medical applications)
        'ECE 457', # Machine Learning and Pattern Recognition
    ],
    
    # Computer Engineering Option
    'computer-engineering': [
        'CS 486',  # Introduction to Artificial Intelligence
        'CS 480',  # Introduction to Machine Learning
        'CS 488',  # Introduction to Computer Graphics
        'CS 489',  # Computer Graphics
        'CS 490',  # Introduction to Computer Vision
        'ECE 456', # Machine Learning
        'ECE 457', # Machine Learning and Pattern Recognition
        'CS 485',  # Statistical and Computational Foundations of Machine Learning
        'ECE 486', # Control Systems
    ],
    
    # Computing Option
    'computing': [
        'CS 486',  # Introduction to Artificial Intelligence
        'CS 480',  # Introduction to Machine Learning
        'CS 488',  # Introduction to Computer Graphics
        'CS 489',  # Computer Graphics
        'CS 490',  # Introduction to Computer Vision
        'CS 485',  # Statistical and Computational Foundations of Machine Learning
        'ECE 456', # Machine Learning
        'ECE 457', # Machine Learning and Pattern Recognition
    ],
    
    # Entrepreneurship Option
    'entrepreneurship': [
        'CS 486',  # Introduction to Artificial Intelligence
        'ECE 456', # Machine Learning
        'MTE 453', # Robotics
        'MTE 454', # Advanced Robotics
    ],
    
    # Environmental Engineering Option
    'environmental-engineering': [
        'MTE 380', # Control Systems
        'MTE 481', # Digital Control Systems
        'ECE 486', # Control Systems
    ],
    
    # Life Sciences Option
    'life-sciences': [
        'MTE 453', # Robotics (for medical applications)
        'MTE 454', # Advanced Robotics
        'ECE 456', # Machine Learning (for biological applications)
        'ECE 457', # Machine Learning and Pattern Recognition
        'MTE 380', # Control Systems
    ],
    
    # Management Science Option
    'management-science': [
        'CS 486',  # Introduction to Artificial Intelligence
        'ECE 456', # Machine Learning
        'CS 480',  # Introduction to Machine Learning
        'ECE 457', # Machine Learning and Pattern Recognition
        'CS 485',  # Statistical and Computational Foundations of Machine Learning
    ],
    
    # Mechatronics Option
    'mechatronics': [
        'MTE 453', # Robotics
        'MTE 454', # Advanced Robotics
        'MTE 380', # Control Systems
        'MTE 481', # Digital Control Systems
        'ECE 456', # Machine Learning
        'ECE 457', # Machine Learning and Pattern Recognition
        'ECE 486', # Control Systems
    ],
    
    # Physical Sciences Option
    'physical-sciences': [
        'MTE 380', # Control Systems
        'MTE 481', # Digital Control Systems
        'ECE 486', # Control Systems
        'ECE 456', # Machine Learning
        'ECE 457', # Machine Learning and Pattern Recognition
    ],
    
    # Quantum Engineering Option
    'quantum-engineering': [
        'ECE 456', # Machine Learning
        'ECE 457', # Machine Learning and Pattern Recognition
        'ECE 486', # Control Systems
        'CS 486',  # Introduction to Artificial Intelligence
    ],
    
    # Software Engineering Option
    'software-engineering': [
        'CS 486',  # Introduction to Artificial Intelligence
        'CS 480',  # Introduction to Machine Learning
        'CS 488',  # Introduction to Computer Graphics
        'CS 489',  # Computer Graphics
        'CS 490',  # Introduction to Computer Vision
        'ECE 457', # Machine Learning and Pattern Recognition
        'CS 485',  # Statistical and Computational Foundations of Machine Learning
    ],
    
    # Statistics Option
    'statistics': [
        'CS 485',  # Statistical and Computational Foundations of Machine Learning
        'ECE 456', # Machine Learning
        'ECE 457', # Machine Learning and Pattern Recognition
        'CS 480',  # Introduction to Machine Learning
    ]
}

# Define specialization mappings
SPECIALIZATION_MAPPINGS = {
    'artificial-intelligence': [
        'CS 486', 'ECE 456', 'CS 480', 'ECE 457', 'CS 485'
    ],
    'machine-learning': [
        'ECE 456', 'CS 480', 'ECE 457', 'CS 485', 'CS 486'
    ],
    'robotics': [
        'MTE 453', 'MTE 454', 'ECE 456', 'ECE 457', 'MTE 380', 'MTE 481', 'ECE 486'
    ],
    'control-systems': [
        'MTE 380', 'MTE 481', 'ECE 486', 'MTE 453', 'MTE 454'
    ],
    'computer-vision': [
        'CS 490', 'CS 489', 'CS 488', 'ECE 457', 'CS 486'
    ],
    'software-engineering': [
        'CS 486', 'CS 480', 'CS 488', 'CS 489', 'CS 490', 'ECE 457', 'CS 485'
    ]
}

def update_course_options():
    """Update courses with option fulfillment data"""
    print("🔄 Updating courses with option fulfillment data...")
    
    # Get all courses
    { data: courses, error } = supabase.from('courses').select('id, title').execute()
    
    if error:
        print(f"❌ Error fetching courses: {error}")
        return
    
    print(f"📚 Found {len(courses)} courses")
    
    # Update each course with option fulfillment data
    for course in courses:
        course_id = course['id']
        fulfills_options = []
        fulfills_specializations = []
        
        # Check which options this course fulfills
        for option, course_list in OPTION_MAPPINGS.items():
            if course_id in course_list:
                fulfills_options.append(option)
        
        # Check which specializations this course fulfills
        for specialization, course_list in SPECIALIZATION_MAPPINGS.items():
            if course_id in course_list:
                fulfills_specializations.append(specialization)
        
        # Update the course if it has option fulfillment data
        if fulfills_options or fulfills_specializations:
            update_data = {}
            if fulfills_options:
                update_data['fulfills_options'] = fulfills_options
            if fulfills_specializations:
                update_data['fulfills_specializations'] = fulfills_specializations
            
            { error: update_error } = supabase.from('courses').update(update_data).eq('id', course_id).execute()
            
            if update_error:
                print(f"❌ Error updating course {course_id}: {update_error}")
            else:
                print(f"✅ Updated {course_id}: options={fulfills_options}, specializations={fulfills_specializations}")

def create_option_definitions():
    """Create option definitions in the database"""
    print("🔄 Creating option definitions...")
    
    options = [
        {
            'id': 'artificial-intelligence',
            'name': 'Artificial Intelligence',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Study and advance ever-greater degrees of efficacy, reliability, and safety, the ways in which machines and systems perceive, see, speak, decide, respond, act, and plan.',
            'coordinator': 'Otman Basir, Electrical and Computer Engineering'
        },
        {
            'id': 'biomechanics',
            'name': 'Biomechanics',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Study solutions to health-care problems, birth defect prevention, medical imaging, prosthesis design, and ergonomics.',
            'coordinator': 'Naveen Chandrashekar, Mechanical and Mechatronics Engineering'
        },
        {
            'id': 'computer-engineering',
            'name': 'Computer Engineering',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Develop skills in the areas of logic, digital hardware, operating systems, computing systems, databases, networks, and security and privacy.',
            'coordinator': 'Wojciech Golab, Electrical and Computer Engineering'
        },
        {
            'id': 'computing',
            'name': 'Computing',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Enrich your studies with knowledge in programming, data structures and algorithms, digital systems, human-computer interaction, and more.',
            'coordinator': 'Wojciech Golab, Electrical and Computer Engineering'
        },
        {
            'id': 'entrepreneurship',
            'name': 'Entrepreneurship',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Pursue an innovative pathway in engineering, and enrich your studies with courses in venture creation and corporate entrepreneurship.',
            'coordinator': 'Nada Basir, Conrad School of Business and Entrepreneurship'
        },
        {
            'id': 'environmental-engineering',
            'name': 'Environmental Engineering',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Study pollution control, waste disposal, and health and sanitation.',
            'coordinator': 'Rebecca Saari, Civil and Environmental Engineering / Anh Pham, Civil and Environmental Engineering'
        },
        {
            'id': 'life-sciences',
            'name': 'Life Sciences',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Understand the structure and function of biological systems (choice of four sub-options): Molecular & Cell Biology, Environmental/Ecological Science, Biophysical Science, Biochemical Science.',
            'coordinator': 'Andrew Doxey, Biology / Jonathan Witt, Biology / Brenda Lee, Physics and Astronomy / Evgeniy Panzhinskiy, Chemistry'
        },
        {
            'id': 'management-science',
            'name': 'Management Science',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Solve management problems using social sciences and mathematical models.',
            'coordinator': 'Fatih Safa Erenay, Management Science and Engineering'
        },
        {
            'id': 'mechatronics',
            'name': 'Mechatronics',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Design and develop "thinking" machines and devices.',
            'coordinator': 'John McPhee, Systems Design Engineering'
        },
        {
            'id': 'physical-sciences',
            'name': 'Physical Sciences',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Understand the basic physical sciences that lay behind many engineering applications (choice of three sub-options): Physics, Chemistry, Earth & Environmental Sciences.',
            'coordinator': 'Richard Epp, Physics and Astronomy / Steve Forsey, Chemistry / Tony Endres, Earth and Environmental Sciences'
        },
        {
            'id': 'quantum-engineering',
            'name': 'Quantum Engineering',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Focus on foundations, design methodologies and experimental skills to analyze and implement technological platforms using quantum devices, systems and algorithms.',
            'coordinator': 'Hamed Majedi, Electrical and Computer Engineering'
        },
        {
            'id': 'software-engineering',
            'name': 'Software Engineering',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Learn about the design, implementation, and maintenance of large-scale software systems.',
            'coordinator': 'Wojciech Golab, Electrical and Computer Engineering'
        },
        {
            'id': 'statistics',
            'name': 'Statistics',
            'program': 'All Engineering Programs',
            'faculty': 'Engineering',
            'description': 'Gain a broad background in applied statistics, including multiple regression, quality control, experimental design, and applied probability.',
            'coordinator': 'Statistics Department'
        }
    ]
    
    for option in options:
        { error } = supabase.from('options').upsert(option).execute()
        if error:
            print(f"❌ Error creating option {option['id']}: {error}")
        else:
            print(f"✅ Created option: {option['name']}")

def main():
    print("🚀 Starting option fulfillment population...")
    
    try:
        # First, create the option definitions
        create_option_definitions()
        
        # Then, update courses with fulfillment data
        update_course_options()
        
        print("✅ Option fulfillment population completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
