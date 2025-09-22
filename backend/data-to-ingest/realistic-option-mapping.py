#!/usr/bin/env python3
"""
Realistic option mapping script using only courses that exist in the database
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

def create_realistic_option_mappings():
    """Create mappings using only courses that exist in the database"""
    
    return {
        'software-engineering': [
            # Courses that exist in the database
            'CS137', 'CS138', 'CS240', 'CS241', 'CS247', 'CS341', 'CS348', 'CS349', 'CS492',
            'ECE105', 'ECE106', 'ECE124', 'ECE140', 'ECE150', 'ECE222', 'ECE250', 'ECE252',
            'ECE320', 'ECE327', 'ECE350', 'ECE351', 'ECE356', 'ECE358', 'ECE406', 'ECE409',
            'ECE423', 'ECE454', 'ECE459', 'ECE498A', 'ECE498B',
            'MSE211', 'MSE261', 'MSE263', 'MSE311', 'MSE411', 'MSE422', 'MSE442', 'MSE454',
            'MTE120', 'MTE140', 'MTE204', 'MTE241', 'MTE262', 'MTE325', 'MTE544', 'MTE546',
            'SE212', 'SE350', 'SE463', 'SE464', 'SE465',
            'SYDE192', 'SYDE211', 'SYDE223', 'SYDE283', 'SYDE292', 'SYDE352', 'SYDE411',
            'SYDE461', 'SYDE462',
            'HIST212', 'SOC324', 'STV205', 'STV208', 'STV210', 'STV302',
            'AE121', 'BME364', 'CIVE222', 'CIVE230', 'CIVE332', 'CIVE343', 'CIVE375',
            'ENVE223', 'ENVE275', 'ENVE335', 'ENVE375', 'ENVE376', 'ENVE391', 'ENVE392',
            'ENVE400', 'ENVE401', 'ENVE577',
            'ERS215', 'ERS315', 'ERS370', 'ERS372', 'ERS404',
            'GEOE223', 'GEOE391', 'GEOE392', 'GEOG432',
            'HLTH420', 'PLAN432',
            'ME203', 'ME250', 'ME340', 'ME360', 'ME481', 'ME482',
            'NE111', 'NE121', 'NE131', 'NE215', 'NE216', 'NE222', 'NE225', 'NE241',
            'NE332', 'NE333', 'NE334', 'NE336', 'NE408', 'NE409',
            'PHYS115', 'PHYS122',
            'PSYCH207', 'PSYCH261', 'PSYCH292', 'PSYCH306', 'PSYCH307', 'PSYCH335',
            'PSYCH391', 'PSYCH486', 'PSYCH493',
            'STAT206',
        ],
        'artificial-intelligence': [
            # Courses that exist and are relevant to AI
            'CS137', 'CS138', 'CS240', 'CS241', 'CS247', 'CS341', 'CS348', 'CS349', 'CS492',
            'ECE105', 'ECE106', 'ECE124', 'ECE140', 'ECE150', 'ECE222', 'ECE250', 'ECE252',
            'ECE320', 'ECE327', 'ECE350', 'ECE351', 'ECE356', 'ECE358', 'ECE406', 'ECE409',
            'ECE423', 'ECE454', 'ECE459',
            'MSE211', 'MSE261', 'MSE263', 'MSE311', 'MSE411', 'MSE422', 'MSE442', 'MSE454',
            'MTE120', 'MTE140', 'MTE204', 'MTE241', 'MTE262', 'MTE325', 'MTE544', 'MTE546',
            'SYDE192', 'SYDE211', 'SYDE223', 'SYDE283', 'SYDE292', 'SYDE352', 'SYDE411',
            'HIST212', 'SOC324', 'STV205', 'STV208', 'STV210', 'STV302',
            'NE111', 'NE121', 'NE131', 'NE215', 'NE216', 'NE222', 'NE225', 'NE241',
            'NE332', 'NE333', 'NE334', 'NE336',
            'PHYS115', 'PHYS122',
            'STAT206',
        ],
        'computer-engineering': [
            # Courses that exist and are relevant to computer engineering
            'CS137', 'CS138', 'CS240', 'CS241', 'CS247', 'CS341', 'CS348', 'CS349', 'CS492',
            'ECE105', 'ECE106', 'ECE124', 'ECE140', 'ECE150', 'ECE222', 'ECE250', 'ECE252',
            'ECE320', 'ECE327', 'ECE350', 'ECE351', 'ECE356', 'ECE358', 'ECE406', 'ECE409',
            'ECE423', 'ECE454', 'ECE459', 'ECE498A', 'ECE498B',
            'MSE211', 'MSE261', 'MSE263', 'MSE311', 'MSE411', 'MSE422', 'MSE442', 'MSE454',
            'MTE120', 'MTE140', 'MTE204', 'MTE241', 'MTE262', 'MTE325', 'MTE544', 'MTE546',
            'SE212', 'SE350', 'SE463', 'SE464', 'SE465',
            'SYDE192', 'SYDE211', 'SYDE223', 'SYDE283', 'SYDE292', 'SYDE352', 'SYDE411',
            'HIST212', 'SOC324', 'STV205', 'STV208', 'STV210', 'STV302',
            'AE121', 'BME364', 'CIVE222', 'CIVE230', 'CIVE332', 'CIVE343', 'CIVE375',
            'ENVE223', 'ENVE275', 'ENVE335', 'ENVE375', 'ENVE376', 'ENVE391', 'ENVE392',
            'ENVE400', 'ENVE401', 'ENVE577',
            'ERS215', 'ERS315', 'ERS370', 'ERS372', 'ERS404',
            'GEOE223', 'GEOE391', 'GEOE392', 'GEOG432',
            'HLTH420', 'PLAN432',
            'ME203', 'ME250', 'ME340', 'ME360', 'ME481', 'ME482',
            'NE111', 'NE121', 'NE131', 'NE215', 'NE216', 'NE222', 'NE225', 'NE241',
            'NE332', 'NE333', 'NE334', 'NE336', 'NE408', 'NE409',
            'PHYS115', 'PHYS122',
            'PSYCH207', 'PSYCH261', 'PSYCH292', 'PSYCH306', 'PSYCH307', 'PSYCH335',
            'PSYCH391', 'PSYCH486', 'PSYCH493',
            'STAT206',
        ],
        'computing': [
            # Courses that exist and are relevant to computing
            'CS137', 'CS138', 'CS240', 'CS241', 'CS247', 'CS341', 'CS348', 'CS349', 'CS492',
            'ECE105', 'ECE106', 'ECE124', 'ECE140', 'ECE150', 'ECE222', 'ECE250', 'ECE252',
            'ECE320', 'ECE327', 'ECE350', 'ECE351', 'ECE356', 'ECE358', 'ECE406', 'ECE409',
            'ECE423', 'ECE454', 'ECE459',
            'MSE211', 'MSE261', 'MSE263', 'MSE311', 'MSE411', 'MSE422', 'MSE442', 'MSE454',
            'MTE120', 'MTE140', 'MTE204', 'MTE241', 'MTE262', 'MTE325', 'MTE544', 'MTE546',
            'SE212', 'SE350', 'SE463', 'SE464', 'SE465',
            'SYDE192', 'SYDE211', 'SYDE223', 'SYDE283', 'SYDE292', 'SYDE352', 'SYDE411',
            'NE111', 'NE121', 'NE131', 'NE215', 'NE216', 'NE222', 'NE225', 'NE241',
            'NE332', 'NE333', 'NE334', 'NE336',
            'PHYS115', 'PHYS122',
            'STAT206',
        ],
        'entrepreneurship': [
            # Courses that exist and are relevant to entrepreneurship
            'BET360', 'BET420',
            'MSE211', 'MSE261', 'MSE263', 'MSE311', 'MSE411', 'MSE422', 'MSE442', 'MSE454',
            'ECON211', 'ECON221', 'ECON311',
            'COMMST100', 'COMMST102', 'COMMST149', 'COMMST220', 'COMMST223', 'COMMST225',
            'COMMST227', 'COMMST308', 'COMMST323', 'COMMST324', 'COMMST325', 'COMMST326',
            'COMMST433', 'COMMST440',
            'MGMT171', 'MSCI261',
        ],
        'environmental-engineering': [
            # Courses that exist and are relevant to environmental engineering
            'ENVE223', 'ENVE275', 'ENVE280', 'ENVE335', 'ENVE375', 'ENVE376', 'ENVE377',
            'ENVE391', 'ENVE392', 'ENVE400', 'ENVE401', 'ENVE577',
            'ERS215', 'ERS222', 'ERS225', 'ERS253', 'ERS288', 'ERS294', 'ERS315', 'ERS316',
            'ERS317', 'ERS318', 'ERS320', 'ERS328', 'ERS361', 'ERS365', 'ERS370', 'ERS372',
            'ERS404', 'ERS406', 'ERS454', 'ERS460', 'ERS462',
            'CIVE230', 'CIVE332', 'CIVE343', 'CIVE375',
            'GEOE223', 'GEOE391', 'GEOE392', 'GEOG432',
            'HLTH420', 'PLAN432',
            'ENVS105', 'ENVS131', 'ENVS195', 'ENVS201', 'ENVS205', 'ENVS210', 'ENVS220',
            'ENVS310', 'ENVS401',
            'ME250', 'ME340',
            'NE121', 'NE222', 'NE225', 'NE241', 'NE332', 'NE333', 'NE334', 'NE336',
            'PHYS115', 'PHYS122',
            'STAT206',
        ],
        'life-sciences': [
            # Courses that exist and are relevant to life sciences
            'CHE102', 'NE121', 'NE222', 'NE225', 'NE241', 'NE332', 'NE333', 'NE334',
            'PHYS115', 'PHYS122',
            'BME364', 'BME381', 'BME530',
            'ENVS105', 'ENVS131', 'ENVS195', 'ENVS201', 'ENVS205', 'ENVS210', 'ENVS220',
            'ENVS310', 'ENVS401',
            'GEOG101', 'GEOG202', 'GEOG203', 'GEOG207', 'GEOG215', 'GEOG219', 'GEOG222',
            'GEOG225', 'GEOG233', 'GEOG302', 'GEOG306', 'GEOG307', 'GEOG314', 'GEOG323',
            'GEOG325', 'GEOG336', 'GEOG349', 'GEOG361', 'GEOG368', 'GEOG411', 'GEOG417',
            'GEOG423', 'GEOG432', 'GEOG460', 'GEOG462',
            'HLTH101', 'HLTH102', 'HLTH201', 'HLTH218', 'HLTH220', 'HLTH245', 'HLTH253',
            'HLTH260', 'HLTH301',
            'STAT206',
        ],
        'management-science': [
            # Courses that exist and are relevant to management science
            'MSE211', 'MSE261', 'MSE263', 'MSE311', 'MSE411', 'MSE422', 'MSE442', 'MSE454',
            'CIVE332', 'CIVE343', 'CIVE375',
            'ENVE335',
            'AE392', 'BME364', 'CIVE392', 'ENVE392', 'GEOE392', 'SYDE262',
            'ECON211', 'ECON221', 'ECON311',
            'PSYCH207', 'PSYCH261', 'PSYCH292', 'PSYCH306', 'PSYCH307', 'PSYCH335',
            'PSYCH391', 'PSYCH486', 'PSYCH493',
            'MGMT171', 'MSCI261',
            'ME250', 'ME340',
            'NE215', 'NE216', 'NE222', 'NE225', 'NE241', 'NE332', 'NE333', 'NE334', 'NE336',
            'PHYS115', 'PHYS122',
            'STAT206',
        ],
        'mechatronics': [
            # Courses that exist and are relevant to mechatronics
            'ECE105', 'ECE106', 'ECE124', 'ECE140', 'ECE150', 'ECE222', 'ECE250', 'ECE252',
            'ECE320', 'ECE327', 'ECE350', 'ECE351', 'ECE356', 'ECE358', 'ECE380', 'ECE406',
            'ECE409', 'ECE423', 'ECE454', 'ECE459', 'ECE498A', 'ECE498B',
            'MTE120', 'MTE140', 'MTE201', 'MTE202', 'MTE204', 'MTE220', 'MTE241', 'MTE262',
            'MTE320', 'MTE321', 'MTE322', 'MTE325', 'MTE360', 'MTE380', 'MTE460', 'MTE481',
            'MTE482', 'MTE544', 'MTE546',
            'ME123', 'ME203', 'ME250', 'ME321', 'ME322', 'ME340', 'ME360', 'ME481', 'ME482',
            'SE212', 'SE350', 'SE463', 'SE464', 'SE465',
            'SYDE192', 'SYDE211', 'SYDE223', 'SYDE283', 'SYDE292', 'SYDE352', 'SYDE411',
            'SYDE461', 'SYDE462',
            'NE111', 'NE121', 'NE131', 'NE215', 'NE216', 'NE222', 'NE225', 'NE241',
            'NE332', 'NE333', 'NE334', 'NE336', 'NE408', 'NE409',
            'PHYS115', 'PHYS122',
            'STAT206',
        ],
        'physical-sciences': [
            # Courses that exist and are relevant to physical sciences
            'ECE105', 'ECE106', 'ECE140', 'ECE375',
            'NE131', 'NE222', 'NE225', 'NE241', 'NE332', 'NE333', 'NE334',
            'PHYS115', 'PHYS122',
            'CHE102', 'NE121',
            'MATH115', 'MATH116', 'MATH117', 'MATH118', 'MATH119', 'MATH135', 'MATH213',
            'MATH218', 'MATH239',
            'STAT206',
        ],
        'quantum-engineering': [
            # Courses that exist and are relevant to quantum engineering
            'ECE105', 'ECE106', 'ECE140', 'ECE375',
            'NE131', 'NE222', 'NE225', 'NE241', 'NE332', 'NE333', 'NE334',
            'PHYS115', 'PHYS122',
            'AE223', 'CIVE222', 'ECE205', 'ENVE223', 'GEOE223', 'MATH213', 'MATH218',
            'ME203', 'MSE271', 'MTE202', 'NE216', 'SYDE211',
            'AE123', 'BME364', 'CIVE332', 'ENVE335', 'ENVE392', 'GEOE392', 'MSE261',
            'SYDE262', 'ME123', 'MTE120', 'NE241', 'PHYS122', 'SYDE292',
            'MATH115', 'MATH116', 'MATH117', 'MATH118', 'MATH119', 'MATH135', 'MATH213',
            'MATH218', 'MATH239',
            'STAT206',
        ],
        'statistics': [
            # Courses that exist and are relevant to statistics
            'STAT206',
            'CIVE343', 'CIVE375', 'ENVE335', 'ME340',
            'MSE211', 'MSE261', 'MSE263', 'MSE311', 'MSE411', 'MSE422', 'MSE442', 'MSE454',
            'CIVE332', 'ENVE392', 'GEOE392', 'SYDE262',
            'ECON211', 'ECON221', 'ECON311',
            'PSYCH207', 'PSYCH261', 'PSYCH292', 'PSYCH306', 'PSYCH307', 'PSYCH335',
            'PSYCH391', 'PSYCH486', 'PSYCH493',
            'MGMT171', 'MSCI261',
            'ME250', 'ME340',
            'NE215', 'NE216', 'NE222', 'NE225', 'NE241', 'NE332', 'NE333', 'NE334', 'NE336',
            'PHYS115', 'PHYS122',
        ]
    }

def update_course_option_mappings():
    """Update all courses with their option fulfillment data"""
    print("🔄 Updating realistic course-option mappings...")
    
    option_mappings = create_realistic_option_mappings()
    
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

def main():
    print("🚀 Starting realistic option mapping setup...")
    
    try:
        # Update course mappings
        update_course_option_mappings()
        
        print("✅ Realistic option mapping setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
