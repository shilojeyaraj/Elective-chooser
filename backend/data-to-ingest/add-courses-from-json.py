#!/usr/bin/env python3
"""
Script to add missing courses from AllDepartments.json to the database
"""

import os
import json
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

def load_courses_from_json():
    """Load all courses from the AllDepartments.json file"""
    json_file_path = os.path.join(os.path.dirname(__file__), 'AllDepartments.json')
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    all_courses = []
    for department, courses in data.items():
        all_courses.extend(courses)
    
    return all_courses

def get_missing_course_ids():
    """Get the list of missing course IDs from our comprehensive mapping"""
    # All courses from our comprehensive option mapping
    all_courses = set()
    
    # Software Engineering Option courses
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
    
    # Artificial Intelligence Option courses
    artificial_intelligence_courses = [
        'HIST212', 'MSE442', 'STV205', 'STV208', 'STV210', 'STV302',
        'CS480', 'CS485', 'CS486', 'ECE457A', 'ECE457B', 'ECE457C', 
        'MSE435', 'MSE446', 'SYDE522',
        'AMATH449', 'BIOL487', 'CHE521', 'CHE522', 'CHE524', 'CO367', 'CO456', 'CO463', 'CO466',
        'CS452', 'CS479', 'CS484', 'ECE423', 'ECE455', 'ECE481', 'ECE484', 'ECE486', 'ECE488', 'ECE495',
        'MSE546', 'MTE544', 'MTE546', 'STAT341', 'STAT440', 'STAT441', 'STAT444',
        'SYDE552', 'SYDE556', 'SYDE572', 'SYDE577',
    ]
    
    # Computer Engineering Option courses
    computer_engineering_courses = [
        'ECE320', 'ECE327', 'ECE423', 'ECE455',
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
    
    # Computing Option courses
    computing_courses = [
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
    ]
    
    # Entrepreneurship Option courses
    entrepreneurship_courses = [
        'BET100', 'BET320', 'BET340',
    ]
    
    # Environmental Engineering Option courses
    environmental_engineering_courses = [
        'ENVE391', 'ERS215', 'ERS270', 'ERS315', 'ERS370', 'ERS372', 'ERS404', 'GEOE391', 'PSCI432',
        'BIOL150', 'BIOL240', 'BIOL354', 'BIOL383', 'EARTH221', 'ENVE275', 'ENVS200', 'ERS383',
        'GEOG432', 'HLTH420', 'PLAN432',
        'CHE571', 'CHE572', 'CHE574', 'CIVE375', 'ENVE375', 'ENVE376', 'ENVE577', 'ME452', 'ME459',
        'CIVE230', 'EARTH456', 'EARTH458', 'ENVE335', 'ENVE573', 'ME571', 'MSE452', 'SYDE532', 'SYDE533',
    ]
    
    # Life Sciences Option courses
    life_sciences_courses = [
        'BIOL130', 'BIOL239', 'BIOL240', 'CHEM262', 'CHEM266', 'NE222',
        'AMATH382', 'BIOL266', 'BIOL308', 'BIOL331', 'BIOL342', 'BIOL349', 'BIOL382', 'BIOL434', 'CHE565',
        'BME285', 'CHE161', 'BME186', 'CHE102', 'CHEM123', 'NE121',
        'BIOL150', 'BIOL241', 'BIOL349', 'BIOL350', 'BIOL351', 'BIOL354', 'BIOL462', 'CHE565', 'EARTH444',
        'ECE105', 'PHYS380', 'BIOL280', 'PHYS280', 'BME186', 'CHE102', 'CHEM123', 'NE121',
        'BIOL349', 'CHE565', 'CHEM233', 'CHEM237', 'CHEM262', 'CHEM266', 'CHEM357', 'NE222', 'PHYS395', 'PHYS396',
        'CHEM267', 'BME186', 'CHE102', 'CHEM123', 'NE121', 'BME285', 'CHE161',
        'CHEM220', 'CHEM233', 'CHEM237', 'CHEM333', 'CHEM357', 'CHEM430', 'CHEM432',
    ]
    
    # Management Science Option courses
    management_science_courses = [
        'MSE211', 'MSE311', 'PSYCH238', 'BME411', 'CHE521', 'CIVE332', 'CO250', 'ENVE335', 'MSE331', 'SYDE411',
        'CIVE343', 'ECON371', 'HRM200', 'MSE311', 'MSE332', 'MSE343', 'MSE422', 'MSE431', 'MSE432',
        'MSE433', 'MSE435', 'MSE442', 'MSE452', 'MSE454', 'MSE531', 'MSE541', 'MSE543', 'MSE546',
        'MSE551', 'MSE555', 'MSE597', 'MSE598', 'SYDE531', 'SYDE533',
        'AE392', 'BME364', 'CIVE392', 'ENVE392', 'GEOE392', 'MSE261', 'SYDE262',
        'BET450', 'MSE411', 'CS480', 'ECE457B', 'MSE446', 'SYDE522',
        'ECON201', 'MSE263', 'MSE211', 'PSYCH238',
    ]
    
    # Mechatronics Option courses
    mechatronics_courses = [
        'BME294', 'ECE240', 'MTE220', 'SYDE292', 'ECE224', 'MTE325',
        'ECE260', 'ME269', 'MTE320', 'ME321', 'MTE321',
        'ECE481', 'ECE484', 'ECE488', 'MTE460', 'ECE486', 'ME547', 'MTE544',
        'ME322', 'ME524', 'MTE322', 'SYDE553',
        'ECE356', 'ECE454', 'ECE455', 'ECE457A', 'ECE457B', 'ECE459', 'ECE463', 'ME561', 'SYDE522', 'SYDE572', 'SYDE575',
        'BME461', 'BME462', 'ECE498A', 'ECE498B', 'GENE403', 'GENE404',
        'ME481', 'ME482', 'SYDE461', 'SYDE462',
    ]
    
    # Physical Sciences Option courses
    physical_sciences_courses = [
        'ECE105', 'NE131', 'PHYS115', 'PHYS121', 'ECE106', 'NE241', 'PHYS122', 'SYDE283',
        'ECE140', 'PHYS242', 'PHYS263', 'PHYS334', 'PHYS358', 'NE332', 'PHYS234',
        'AMATH473', 'CO481', 'CS467', 'NE334', 'PHYS275', 'PHYS334', 'PHYS335', 'PHYS342', 'PHYS359', 'PHYS364', 'PHYS365', 'PHYS375', 'PHYS434', 'PHYS435', 'PHYS442', 'PHYS454', 'PHYS467', 'PHYS475',
        'CHEM209', 'CHE102', 'CHEM123', 'NE121', 'CHEM212', 'NE225', 'CHEM262', 'CHEM264', 'NE222',
        'CHEM220', 'CHEM221', 'CHEM265', 'CHEM310', 'CHEM313', 'CHEM323', 'CHEM340', 'CHEM350', 'CHEM360',
        'CHE230', 'CHEM254', 'ME250', 'SYDE381', 'CHEM356', 'NE332', 'PHYS234', 'CHEM370', 'NE333',
        'EARTH121', 'EARTH121L', 'EARTH122', 'EARTH122L', 'CIVE153', 'ENVE153', 'GEOE153',
        'BIOL462', 'EARTH221', 'EARTH231', 'EARTH232', 'EARTH235', 'EARTH260', 'EARTH270', 'EARTH281', 'EARTH333', 'EARTH358', 'EARTH421', 'EARTH438', 'EARTH440', 'EARTH444', 'EARTH456', 'EARTH458', 'EARTH459', 'EARTH460', 'EARTH471',
    ]
    
    # Quantum Engineering Option courses
    quantum_engineering_courses = [
        'ECE405C', 'AMATH373', 'CHEM356', 'ECE305', 'NE332', 'PHYS233', 'PHYS234',
        'ECE405A', 'PHYS468', 'ECE405B', 'ECE405D',
        'AE223', 'CIVE222', 'ECE205', 'ENVE223', 'GEOE223', 'MATH211', 'MATH213', 'MATH217', 'MATH218',
        'ME203', 'MSE271', 'MTE202', 'NE216', 'SYDE211',
        'AE123', 'BME294', 'CIVE123', 'ECE106', 'ECE140', 'ECE375', 'ENVE123', 'GENE123', 'GEOE123',
        'ME123', 'MTE120', 'NE241', 'PHYS342', 'SYDE292',
    ]
    
    # Statistics Option courses
    statistics_courses = [
        'STAT435', 'CHE220', 'CIVE224', 'ENVE224', 'GEOE224', 'ME202', 'MSE251', 'MTE201', 'NE215', 'STAT231', 'SYDE212',
        'CHE225', 'CHE425', 'MSE253', 'STAT332', 'STAT331', 'SYDE334',
        'CHE341', 'CHE522', 'CHE524', 'CIVE343', 'CIVE375', 'CIVE440', 'ENVE573', 'ME340',
        'MSE431', 'MSE432', 'MSE452', 'PLAN478', 'STAT230', 'STAT333', 'STAT430', 'STAT431',
        'STAT433', 'STAT443', 'SYDE531', 'SYDE533', 'SYDE572',
    ]
    
    # Biomechanics Option courses
    biomechanics_courses = [
        'BME588', 'CIVE460', 'ME574', 'BIOL201', 'BIOL273', 'BME284', 'SYDE584',
        'KIN100', 'KIN100L', 'KIN320', 'KIN420', 'SYDE162', 'SYDE543', 'SYDE548',
        'KIN121', 'KIN121L', 'CHE341', 'CIVE306', 'CIVE422', 'ECE380', 'ECE486', 'ME322', 'ME360', 'ME423', 'ME547',
        'ME555', 'ME559', 'ME566', 'MTE360', 'NE336', 'PHYS395', 'SYDE352', 'SYDE543', 'SYDE544',
        'SYDE553', 'SYDE572', 'SYDE575', 'BME551', 'KIN312', 'KIN340', 'KIN356', 'KIN416', 'KIN420', 'KIN422', 'KIN425', 'KIN472',
        'KIN221', 'KIN221L', 'KIN255', 'KIN255L', 'CHE482', 'CHE483', 'CIVE400', 'CIVE401',
        'ECE498A', 'ECE498B', 'ENVE400', 'ENVE401', 'GENE403', 'GENE404',
        'ME481', 'ME482', 'MTE481', 'MTE482', 'NE408', 'NE409', 'SYDE461', 'SYDE462',
    ]
    
    # Add all courses to the set
    all_courses.update(software_engineering_courses)
    all_courses.update(artificial_intelligence_courses)
    all_courses.update(computer_engineering_courses)
    all_courses.update(computing_courses)
    all_courses.update(entrepreneurship_courses)
    all_courses.update(environmental_engineering_courses)
    all_courses.update(life_sciences_courses)
    all_courses.update(management_science_courses)
    all_courses.update(mechatronics_courses)
    all_courses.update(physical_sciences_courses)
    all_courses.update(quantum_engineering_courses)
    all_courses.update(statistics_courses)
    all_courses.update(biomechanics_courses)
    
    return all_courses

def add_missing_courses_from_json():
    """Add missing courses from JSON file to the database"""
    
    # Load all courses from JSON
    print("📖 Loading courses from AllDepartments.json...")
    all_courses_from_json = load_courses_from_json()
    print(f"📚 Found {len(all_courses_from_json)} courses in JSON file")
    
    # Get missing course IDs
    missing_course_ids = get_missing_course_ids()
    print(f"🔍 Need {len(missing_course_ids)} courses for comprehensive mapping")
    
    # Get existing courses from database
    response = supabase.from_('courses').select('id').execute()
    existing_courses = {c['id'] for c in response.data} if response.data else set()
    print(f"📚 Found {len(existing_courses)} existing courses in database")
    
    # Find courses that are missing and available in JSON
    missing_courses = missing_course_ids - existing_courses
    print(f"➕ Missing {len(missing_courses)} courses")
    
    if not missing_courses:
        print("✅ All required courses already exist in the database!")
        return
    
    # Create a mapping of course ID to course data from JSON
    json_courses_by_id = {course['id']: course for course in all_courses_from_json}
    
    # Find courses that are missing and available in JSON
    available_missing_courses = missing_courses.intersection(set(json_courses_by_id.keys()))
    unavailable_courses = missing_courses - set(json_courses_by_id.keys())
    
    print(f"✅ Found {len(available_missing_courses)} missing courses in JSON file")
    if unavailable_courses:
        print(f"❌ {len(unavailable_courses)} courses not found in JSON file:")
        for course in sorted(unavailable_courses):
            print(f"  {course}")
    
    if not available_missing_courses:
        print("❌ No missing courses found in JSON file!")
        return
    
    print(f"\n🔄 Adding {len(available_missing_courses)} missing courses from JSON...")
    
    added_count = 0
    failed_count = 0
    
    for course_id in sorted(available_missing_courses):
        try:
            course_data = json_courses_by_id[course_id]
            
            # Insert course into database
            response = supabase.from_('courses').insert(course_data).execute()
            
            if response.data:
                print(f"✅ Added {course_id}: {course_data['title']}")
                added_count += 1
            else:
                print(f"❌ Failed to add {course_id}: {response.error}")
                failed_count += 1
                
        except Exception as e:
            print(f"❌ Error adding {course_id}: {e}")
            failed_count += 1
        
        # Small delay to avoid overwhelming the database
        time.sleep(0.1)
    
    print(f"\n🎉 Successfully added {added_count} courses to the database!")
    if failed_count > 0:
        print(f"❌ Failed to add {failed_count} courses")

def main():
    print("🚀 Starting missing courses addition from JSON...")
    
    try:
        add_missing_courses_from_json()
        print("✅ Missing courses addition completed successfully!")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
