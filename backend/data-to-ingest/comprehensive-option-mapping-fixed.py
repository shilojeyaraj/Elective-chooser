#!/usr/bin/env python3
"""
Comprehensive option mapping script with correct course ID format
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
    
    return {
        'software-engineering': [
            # Required Courses
            'CS445', 'ECE451', 'SE463', 'CS446', 'ECE452', 'SE464', 'CS447', 'ECE453', 'SE465',
            # List 1 - Programming Fundamentals
            'AE121', 'BME121', 'CHE120', 'CIVE121', 'CS115', 'CS116', 'CS135', 'CS137', 'CS145',
            'ECE150', 'ENVE121', 'GEOE121', 'ME101', 'MSE121', 'MTE121', 'NE111', 'SYDE121',
            # List 2 - Data Structures and Algorithms
            'BME122', 'CS136', 'CS138', 'CS146', 'CS231', 'ECE250', 'MSE240', 'MTE140', 'SYDE223',
            # List 3 - Advanced Computing
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
            # List 4 - Social Implications
            'CS492', 'HIST212', 'MSE442', 'SOC324', 'STV205', 'STV208', 'STV210', 'STV302',
        ],
        'artificial-intelligence': [
            # List 1 - Social Implications
            'HIST212', 'MSE442', 'STV205', 'STV208', 'STV210', 'STV302',
            # List 2 - Core AI
            'CS480', 'CS485', 'CS486', 'ECE457A', 'ECE457B', 'ECE457C', 'MSE435', 'MSE446', 'SYDE522',
            # List 3 - Advanced AI
            'AMATH449', 'BIOL487', 'CHE521', 'CHE522', 'CHE524', 'CO367', 'CO456', 'CO463', 'CO466',
            'CS452', 'CS479', 'CS484', 'ECE423', 'ECE455', 'ECE481', 'ECE484', 'ECE486', 'ECE488', 'ECE495',
            'MSE546', 'MTE544', 'MTE546', 'STAT341', 'STAT440', 'STAT441', 'STAT444',
            'SYDE552', 'SYDE556', 'SYDE572', 'SYDE577',
        ],
        'biomechanics': [
            # Required Biomechanics
            'BME588', 'CIVE460', 'ME574',
            # Anatomy and Physiology
            'BIOL201', 'BIOL273', 'BME284', 'SYDE584', 'KIN100', 'KIN100L',
            # Movement Analysis
            'KIN320', 'KIN420', 'SYDE162', 'SYDE543', 'SYDE548', 'KIN121', 'KIN121L',
            # Engineering Fundamentals
            'CHE341', 'CIVE306', 'CIVE422', 'ECE380', 'ECE486', 'ME322', 'ME360', 'ME423', 'ME547',
            'ME555', 'ME559', 'ME566', 'MTE360', 'NE336', 'PHYS395', 'SYDE352', 'SYDE543', 'SYDE544',
            'SYDE553', 'SYDE572', 'SYDE575',
            # Advanced Biomechanics
            'BME551', 'KIN312', 'KIN340', 'KIN356', 'KIN416', 'KIN420', 'KIN422', 'KIN425', 'KIN472',
            'KIN221', 'KIN221L', 'KIN255', 'KIN255L',
            # Design Projects
            'CHE482', 'CHE483', 'CIVE400', 'CIVE401', 'ECE498A', 'ECE498B', 'ENVE400', 'ENVE401',
            'GENE403', 'GENE404', 'ME481', 'ME482', 'MTE481', 'MTE482', 'NE408', 'NE409',
            'SYDE461', 'SYDE462',
        ],
        'computer-engineering': [
            # Required Courses (choose 2)
            'ECE320', 'ECE327', 'ECE423', 'ECE455',
            # List 1 - Programming Fundamentals
            'AE121', 'BME121', 'CHE120', 'CIVE121', 'CS115', 'CS116', 'CS135', 'CS137', 'CS145',
            'ECE150', 'ENVE121', 'GEOE121', 'ME101', 'MSE121', 'MTE121', 'NE111', 'SYDE121',
            # List 2 - Data Structures and Algorithms
            'BME122', 'CS136', 'CS138', 'CS146', 'CS231', 'ECE250', 'MSE240', 'MTE140', 'SYDE223',
            # List 3 - Advanced Computing
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
            # List 4 - Social Implications
            'CS492', 'HIST212', 'MSE442', 'SOC324', 'STV205', 'STV208', 'STV210', 'STV302',
        ],
        'computing': [
            # List 1 - Programming Fundamentals
            'AE121', 'BME121', 'CHE120', 'CIVE121', 'CS115', 'CS116', 'CS135', 'CS137', 'CS145',
            'ECE150', 'ENVE121', 'GEOE121', 'ME101', 'MSE121', 'MTE121', 'NE111', 'SYDE121',
            # List 2 - Data Structures and Algorithms
            'BME122', 'CS136', 'CS138', 'CS146', 'CS231', 'ECE250', 'MSE240', 'MTE140', 'SYDE223',
            # List 3 - Advanced Computing
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
        'entrepreneurship': [
            # Required BET Courses
            'BET100', 'BET320', 'BET340',
        ],
        'environmental-engineering': [
            # List 1 - Law and Ethics
            'ENVE391', 'ERS215', 'ERS270', 'ERS315', 'ERS370', 'ERS372', 'ERS404', 'GEOE391', 'PSCI432',
            # List 2 - Environmental Science
            'BIOL150', 'BIOL240', 'BIOL354', 'BIOL383', 'EARTH221', 'ENVE275', 'ENVS200', 'ERS383',
            'GEOG432', 'HLTH420', 'PLAN432',
            # List 3 - Environmental Engineering
            'CHE571', 'CHE572', 'CHE574', 'CIVE375', 'ENVE375', 'ENVE376', 'ENVE577', 'ME452', 'ME459',
            # List 4 - Advanced Topics
            'CIVE230', 'EARTH456', 'EARTH458', 'ENVE335', 'ENVE573', 'ME571', 'MSE452', 'SYDE532', 'SYDE533',
        ],
        'life-sciences': [
            # Theme 1: Molecular and Cell Biology
            'BIOL130', 'BIOL239', 'BIOL240', 'CHEM262', 'CHEM266', 'NE222',
            'AMATH382', 'BIOL266', 'BIOL308', 'BIOL331', 'BIOL342', 'BIOL349', 'BIOL382', 'BIOL434', 'CHE565',
            # Theme 2: Environmental/Ecological Science
            'BIOL239', 'BIOL240', 'BME285', 'CHE161', 'BME186', 'CHE102', 'CHEM123', 'NE121',
            'BIOL150', 'BIOL241', 'BIOL349', 'BIOL350', 'BIOL351', 'BIOL354', 'BIOL462', 'CHE565', 'EARTH444',
            # Theme 3: Biophysical Science
            'ECE105', 'PHYS380', 'BIOL280', 'PHYS280', 'BME186', 'CHE102', 'CHEM123', 'NE121',
            'BIOL349', 'CHE565', 'CHEM233', 'CHEM237', 'CHEM262', 'CHEM266', 'CHEM357', 'NE222', 'PHYS395', 'PHYS396',
            # Theme 4: Biochemical Science
            'CHEM267', 'BME186', 'CHE102', 'CHEM123', 'NE121', 'BME285', 'CHE161', 'CHEM262', 'CHEM266', 'NE222',
            'CHEM220', 'CHEM233', 'CHEM237', 'CHEM333', 'CHEM357', 'CHEM430', 'CHEM432',
        ],
        'management-science': [
            # Required Organizational Behavior (choose 1)
            'MSE211', 'MSE311', 'PSYCH238',
            # Required Optimization (choose 1)
            'BME411', 'CHE521', 'CIVE332', 'CO250', 'ENVE335', 'MSE331', 'SYDE411',
            # Core Management Science Courses (choose 4)
            'CIVE343', 'ECON371', 'HRM200', 'MSE311', 'MSE332', 'MSE343', 'MSE422', 'MSE431', 'MSE432',
            'MSE433', 'MSE435', 'MSE442', 'MSE452', 'MSE454', 'MSE531', 'MSE541', 'MSE543', 'MSE546',
            'MSE551', 'MSE555', 'MSE597', 'MSE598', 'SYDE531', 'SYDE533',
            # Economics (choose max 1)
            'AE392', 'BME364', 'CIVE392', 'ENVE392', 'GEOE392', 'MSE261', 'SYDE262',
            # Leadership (choose max 1)
            'BET450', 'MSE411',
            # Machine Learning (choose max 1)
            'CS480', 'ECE457B', 'MSE446', 'SYDE522',
            # Economics Theory (choose max 1)
            'ECON201', 'MSE263',
            # Organizational Behavior (choose max 1)
            'MSE211', 'PSYCH238',
        ],
        'mechatronics': [
            # Required Courses (choose 1 from each category)
            'BME294', 'ECE240', 'MTE220', 'SYDE292',  # Circuits and Instrumentation
            'ECE224', 'MTE325',  # Embedded Systems
            'ECE260', 'ME269', 'MTE320',  # Electromechanical Energy
            'ME321', 'MTE321',  # Dynamics
            'ECE481', 'ECE484', 'ECE488', 'MTE460',  # Control Systems
            'ECE486', 'ME547', 'MTE544',  # Robotics
            'ME322', 'ME524', 'MTE322', 'SYDE553',  # Mechanical Design
            'ECE356', 'ECE454', 'ECE455', 'ECE457A', 'ECE457B', 'ECE459', 'ECE463', 'ME561', 'SYDE522', 'SYDE572', 'SYDE575',  # Computing/Software
            # Design Projects (choose 1 complete set)
            'BME461', 'BME462',  # Biomedical Engineering
            'ECE498A', 'ECE498B',  # Electrical Engineering
            'GENE403', 'GENE404',  # General Engineering
            'ME481', 'ME482',  # Mechanical Engineering
            'SYDE461', 'SYDE462',  # Systems Design Engineering
        ],
        'physical-sciences': [
            # Theme 1: Physics
            'ECE105', 'NE131', 'PHYS115', 'PHYS121',  # Choose 1 - Mechanics
            'ECE106', 'NE241', 'PHYS122', 'SYDE283',  # Choose 1 - Electricity and Magnetism
            'ECE140', 'PHYS242', 'PHYS263', 'PHYS334', 'PHYS358',  # Choose 1 - Advanced Physics
            'NE332', 'PHYS234',  # Choose 1 - Quantum Mechanics
            'AMATH473', 'CO481', 'CS467', 'NE334', 'PHYS275', 'PHYS334', 'PHYS335', 'PHYS342', 'PHYS359', 'PHYS364', 'PHYS365', 'PHYS375', 'PHYS434', 'PHYS435', 'PHYS442', 'PHYS454', 'PHYS467', 'PHYS475',  # Choose 3 - Advanced Physics
            
            # Theme 2: Chemistry
            'CHEM209',  # Required - Spectroscopy
            'CHE102', 'CHEM123', 'NE121',  # Choose 1 - General Chemistry
            'CHEM212', 'NE225',  # Choose 1 - Structure and Bonding
            'CHEM262', 'CHEM264', 'NE222',  # Choose 1 - Organic Chemistry
            'CHEM220', 'CHEM221', 'CHEM265', 'CHEM310', 'CHEM313', 'CHEM323', 'CHEM340', 'CHEM350', 'CHEM360',  # Choose 3 - Advanced Chemistry
            'CHE230', 'CHEM254', 'ME250', 'SYDE381',  # Choose max 1 - Thermodynamics
            'CHEM356', 'NE332', 'PHYS234',  # Choose max 1 - Quantum Mechanics
            'CHEM370', 'NE333',  # Choose max 1 - Polymer Science
            
            # Theme 3: Earth and Environmental Sciences
            'CHE102', 'CHEM123', 'NE121',  # Choose 1 - Chemistry
            'ECE105', 'NE131', 'PHYS115', 'PHYS121',  # Choose 1 - Physics
            'ECE106', 'PHYS122',  # Choose 1 - Electricity and Magnetism
            'EARTH121', 'EARTH121L',  # Required - Earth Sciences
            'EARTH122', 'EARTH122L',  # Required - Environmental Sciences
            'CIVE153', 'ENVE153', 'GEOE153',  # Choose 1 - Earth Engineering
            'BIOL462', 'EARTH221', 'EARTH231', 'EARTH232', 'EARTH235', 'EARTH260', 'EARTH270', 'EARTH281', 'EARTH333', 'EARTH358', 'EARTH421', 'EARTH438', 'EARTH440', 'EARTH444', 'EARTH456', 'EARTH458', 'EARTH459', 'EARTH460', 'EARTH471',  # Choose 3 - Advanced Earth Sciences
        ],
        'quantum-engineering': [
            # Required Courses
            'ECE405C',  # Programming of Quantum Computing Algorithms
            'AMATH373', 'CHEM356', 'ECE305', 'NE332', 'PHYS233', 'PHYS234',  # Choose 1 - Quantum Mechanics
            'ECE405A', 'PHYS468',  # Choose 1 - Quantum Information Processing Devices
            'ECE405B', 'ECE405D',  # Choose 1 - Experimental Quantum Information
            
            # List 1 - Differential Equations (choose 1)
            'AE223', 'CIVE222', 'ECE205', 'ENVE223', 'GEOE223', 'MATH211', 'MATH213', 'MATH217', 'MATH218',
            'ME203', 'MSE271', 'MTE202', 'NE216', 'SYDE211',
            
            # List 2 - Electrical Circuits (choose 1)
            'AE123', 'BME294', 'CIVE123', 'ECE106', 'ECE140', 'ECE375', 'ENVE123', 'GENE123', 'GEOE123',
            'ME123', 'MTE120', 'NE241', 'PHYS342', 'SYDE292',
        ],
        'statistics': [
            # Required Courses
            'STAT435',  # Statistical Methods for Process Improvements
            'CHE220', 'CIVE224', 'ENVE224', 'GEOE224', 'ME202', 'MSE251', 'MTE201', 'NE215', 'STAT231', 'SYDE212',  # Choose 1 - Probability and Statistics
            'CHE225', 'CHE425', 'MSE253', 'STAT332',  # Choose 1 - Process Improvement/Experimental Design
            'STAT331', 'SYDE334',  # Choose 1 - Applied Linear Models
            
            # Additional Courses (choose 3)
            'CHE341', 'CHE522', 'CHE524', 'CIVE343', 'CIVE375', 'CIVE440', 'ENVE573', 'ME340',
            'MSE431', 'MSE432', 'MSE452', 'PLAN478', 'STAT230', 'STAT333', 'STAT430', 'STAT431',
            'STAT433', 'STAT443', 'SYDE531', 'SYDE533', 'SYDE572',
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
