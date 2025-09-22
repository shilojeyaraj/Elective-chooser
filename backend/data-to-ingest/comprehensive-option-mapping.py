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
    
    # Artificial Intelligence Option - Complete mapping
    artificial_intelligence_courses = {
        'list1_social_implications': [
            'HIST 212', 'MSE 442', 'STV 205', 'STV 208', 'STV 210', 'STV 302',
        ],
        'list2_core_ai': [
            'CS 480', 'CS 485', 'CS 486', 'ECE 457A', 'ECE 457B', 'ECE 457C', 
            'MSE 435', 'MSE 446', 'SYDE 522',
        ],
        'list3_advanced_ai': [
            'AMATH 449', 'BIOL 487', 'CHE 521', 'CHE 522', 'CHE 524', 'CO 367', 'CO 456', 'CO 463', 'CO 466',
            'CS 452', 'CS 479', 'CS 484', 'ECE 423', 'ECE 455', 'ECE 481', 'ECE 484', 'ECE 486', 'ECE 488', 'ECE 495',
            'MSE 546', 'MTE 544', 'MTE 546', 'STAT 341', 'STAT 440', 'STAT 441', 'STAT 444',
            'SYDE 552', 'SYDE 556', 'SYDE 572', 'SYDE 577',
        ]
    }
    
    # Biomechanics Option - Complete mapping
    biomechanics_courses = {
        'required_biomechanics': [
            'BME 588', 'CIVE 460', 'ME 574',  # Core biomechanics
        ],
        'anatomy_physiology': [
            'BIOL 201', 'BIOL 273', 'BME 284', 'SYDE 584',  # Choose 1
            'KIN 100', 'KIN 100L',  # Required
        ],
        'movement_analysis': [
            'KIN 320', 'KIN 420', 'SYDE 162', 'SYDE 543', 'SYDE 548',  # Choose 1
            'KIN 121', 'KIN 121L',  # Required
        ],
        'engineering_fundamentals': [
            'CHE 341', 'CIVE 306', 'CIVE 422', 'ECE 380', 'ECE 486', 'ME 322', 'ME 360', 'ME 423', 'ME 547',
            'ME 555', 'ME 559', 'ME 566', 'MTE 360', 'NE 336', 'PHYS 395', 'SYDE 352', 'SYDE 543', 'SYDE 544',
            'SYDE 553', 'SYDE 572', 'SYDE 575',
        ],
        'advanced_biomechanics': [
            'BME 551', 'KIN 312', 'KIN 340', 'KIN 356', 'KIN 416', 'KIN 420', 'KIN 422', 'KIN 425', 'KIN 472',
            'KIN 221', 'KIN 221L',  # Required
            'KIN 255', 'KIN 255L',  # Required
        ],
        'design_projects': [
            'CHE 482', 'CHE 483',  # Chemical Engineering
            'CIVE 400', 'CIVE 401',  # Civil Engineering
            'ECE 498A', 'ECE 498B',  # Electrical Engineering
            'ENVE 400', 'ENVE 401',  # Environmental Engineering
            'GENE 403', 'GENE 404',  # General Engineering
            'ME 481', 'ME 482',  # Mechanical Engineering
            'MTE 481', 'MTE 482',  # Mechatronics Engineering
            'NE 408', 'NE 409',  # Nanosystems Engineering
            'SYDE 461', 'SYDE 462',  # Systems Design Engineering
        ]
    }
    
    # Flatten all courses for each option
    all_se_courses = []
    for category, courses in software_engineering_courses.items():
        all_se_courses.extend(courses)
    
    all_ai_courses = []
    for category, courses in artificial_intelligence_courses.items():
        all_ai_courses.extend(courses)
    
    all_biomechanics_courses = []
    for category, courses in biomechanics_courses.items():
        all_biomechanics_courses.extend(courses)
    
    return {
        'software-engineering': all_se_courses,
        'artificial-intelligence': all_ai_courses,
        'biomechanics': all_biomechanics_courses,
        # Computer Engineering Option - Complete mapping
        'computer-engineering': [
            # Required Courses (choose 2)
            'ECE 320', 'ECE 327', 'ECE 423', 'ECE 455',
            # List 1 - Programming Fundamentals
            'AE 121', 'BME 121', 'CHE 120', 'CIVE 121', 'CS 115', 'CS 116', 'CS 135', 'CS 137', 'CS 145',
            'ECE 150', 'ENVE 121', 'GEOE 121', 'ME 101', 'MSE 121', 'MTE 121', 'NE 111', 'SYDE 121',
            # List 2 - Data Structures and Algorithms
            'BME 122', 'CS 136', 'CS 138', 'CS 146', 'CS 231', 'ECE 250', 'MSE 240', 'MTE 140', 'SYDE 223',
            # List 3 - Advanced Computing
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
        'computing': [
            # List 1 - Programming Fundamentals
            'AE 121', 'BME 121', 'CHE 120', 'CIVE 121', 'CS 115', 'CS 116', 'CS 135', 'CS 137', 'CS 145',
            'ECE 150', 'ENVE 121', 'GEOE 121', 'ME 101', 'MSE 121', 'MTE 121', 'NE 111', 'SYDE 121',
            # List 2 - Data Structures and Algorithms
            'BME 122', 'CS 136', 'CS 138', 'CS 146', 'CS 231', 'ECE 250', 'MSE 240', 'MTE 140', 'SYDE 223',
            # List 3 - Advanced Computing
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
        ],
        'entrepreneurship': [
            # Required BET Courses
            'BET 100', 'BET 320', 'BET 340',
            # Additional BET courses (up to 2 more)
            # Note: Specific BET course numbers would need to be added as they become available
        ],
        'environmental-engineering': [
            # List 1 - Law and Ethics
            'ENVE 391', 'ERS 215', 'ERS 270', 'ERS 315', 'ERS 370', 'ERS 372', 'ERS 404', 'GEOE 391', 'PSCI 432',
            # List 2 - Environmental Science
            'BIOL 150', 'BIOL 240', 'BIOL 354', 'BIOL 383', 'EARTH 221', 'ENVE 275', 'ENVS 200', 'ERS 383',
            'GEOG 432', 'HLTH 420', 'PLAN 432',
            # List 3 - Environmental Engineering
            'CHE 571', 'CHE 572', 'CHE 574', 'CIVE 375', 'ENVE 375', 'ENVE 376', 'ENVE 577', 'ME 452', 'ME 459',
            # List 4 - Advanced Topics
            'CIVE 230', 'EARTH 456', 'EARTH 458', 'ENVE 335', 'ENVE 573', 'ME 571', 'MSE 452', 'SYDE 532', 'SYDE 533',
        ],
        'life-sciences': [
            # Theme 1: Molecular and Cell Biology
            'BIOL 130', 'BIOL 239', 'BIOL 240',  # Required
            'CHEM 262', 'CHEM 266', 'NE 222',  # Choose 1
            'AMATH 382', 'BIOL 266', 'BIOL 308', 'BIOL 331', 'BIOL 342', 'BIOL 349', 'BIOL 382', 'BIOL 434', 'CHE 565',  # Choose 3
            
            # Theme 2: Environmental/Ecological Science
            'BIOL 239', 'BIOL 240',  # Required
            'BME 285', 'CHE 161',  # Choose 1
            'BME 186', 'CHE 102', 'CHEM 123', 'NE 121',  # Choose 1
            'BIOL 150', 'BIOL 241', 'BIOL 349', 'BIOL 350', 'BIOL 351', 'BIOL 354', 'BIOL 462', 'CHE 565', 'EARTH 444',  # Choose 3
            
            # Theme 3: Biophysical Science
            'ECE 105', 'PHYS 380',  # Required
            'BIOL 280', 'PHYS 280',  # Choose 1
            'BME 186', 'CHE 102', 'CHEM 123', 'NE 121',  # Choose 1
            'BIOL 349', 'CHE 565', 'CHEM 233', 'CHEM 237', 'CHEM 262', 'CHEM 266', 'CHEM 357', 'NE 222', 'PHYS 395', 'PHYS 396',  # Choose 3
            
            # Theme 4: Biochemical Science
            'CHEM 267',  # Required
            'BME 186', 'CHE 102', 'CHEM 123', 'NE 121',  # Choose 1
            'BME 285', 'CHE 161',  # Choose 1
            'CHEM 262', 'CHEM 266', 'NE 222',  # Choose 1
            'CHEM 220', 'CHEM 233', 'CHEM 237', 'CHEM 333', 'CHEM 357', 'CHEM 430', 'CHEM 432',  # Choose 3
        ],
        'management-science': [
            # Required Organizational Behavior (choose 1)
            'MSE 211', 'MSE 311', 'PSYCH 238',
            # Required Optimization (choose 1)
            'BME 411', 'CHE 521', 'CIVE 332', 'CO 250', 'ENVE 335', 'MSE 331', 'SYDE 411',
            # Core Management Science Courses (choose 4)
            'CIVE 343', 'ECON 371', 'HRM 200', 'MSE 311', 'MSE 332', 'MSE 343', 'MSE 422', 'MSE 431', 'MSE 432',
            'MSE 433', 'MSE 435', 'MSE 442', 'MSE 452', 'MSE 454', 'MSE 531', 'MSE 541', 'MSE 543', 'MSE 546',
            'MSE 551', 'MSE 555', 'MSE 597', 'MSE 598', 'SYDE 531', 'SYDE 533',
            # Economics (choose max 1)
            'AE 392', 'BME 364', 'CIVE 392', 'ENVE 392', 'GEOE 392', 'MSE 261', 'SYDE 262',
            # Leadership (choose max 1)
            'BET 450', 'MSE 411',
            # Machine Learning (choose max 1)
            'CS 480', 'ECE 457B', 'MSE 446', 'SYDE 522',
            # Economics Theory (choose max 1)
            'ECON 201', 'MSE 263',
            # Organizational Behavior (choose max 1)
            'MSE 211', 'PSYCH 238',
        ],
        'mechatronics': [
            # Required Courses (choose 1 from each category)
            'BME 294', 'ECE 240', 'MTE 220', 'SYDE 292',  # Circuits and Instrumentation
            'ECE 224', 'MTE 325',  # Embedded Systems
            'ECE 260', 'ME 269', 'MTE 320',  # Electromechanical Energy
            'ME 321', 'MTE 321',  # Dynamics
            'ECE 481', 'ECE 484', 'ECE 488', 'MTE 460',  # Control Systems
            'ECE 486', 'ME 547', 'MTE 544',  # Robotics
            'ME 322', 'ME 524', 'MTE 322', 'SYDE 553',  # Mechanical Design
            'ECE 356', 'ECE 454', 'ECE 455', 'ECE 457A', 'ECE 457B', 'ECE 459', 'ECE 463', 'ME 561', 'SYDE 522', 'SYDE 572', 'SYDE 575',  # Computing/Software
            # Design Projects (choose 1 complete set)
            'BME 461', 'BME 462',  # Biomedical Engineering
            'ECE 498A', 'ECE 498B',  # Electrical Engineering
            'GENE 403', 'GENE 404',  # General Engineering
            'ME 481', 'ME 482',  # Mechanical Engineering
            'SYDE 461', 'SYDE 462',  # Systems Design Engineering
        ],
        'physical-sciences': [
            # Theme 1: Physics
            'ECE 105', 'NE 131', 'PHYS 115', 'PHYS 121',  # Choose 1 - Mechanics
            'ECE 106', 'NE 241', 'PHYS 122', 'SYDE 283',  # Choose 1 - Electricity and Magnetism
            'ECE 140', 'PHYS 242', 'PHYS 263', 'PHYS 334', 'PHYS 358',  # Choose 1 - Advanced Physics
            'NE 332', 'PHYS 234',  # Choose 1 - Quantum Mechanics
            'AMATH 473', 'CO 481', 'CS 467', 'NE 334', 'PHYS 275', 'PHYS 334', 'PHYS 335', 'PHYS 342', 'PHYS 359', 'PHYS 364', 'PHYS 365', 'PHYS 375', 'PHYS 434', 'PHYS 435', 'PHYS 442', 'PHYS 454', 'PHYS 467', 'PHYS 475',  # Choose 3 - Advanced Physics
            
            # Theme 2: Chemistry
            'CHEM 209',  # Required - Spectroscopy
            'CHE 102', 'CHEM 123', 'NE 121',  # Choose 1 - General Chemistry
            'CHEM 212', 'NE 225',  # Choose 1 - Structure and Bonding
            'CHEM 262', 'CHEM 264', 'NE 222',  # Choose 1 - Organic Chemistry
            'CHEM 220', 'CHEM 221', 'CHEM 265', 'CHEM 310', 'CHEM 313', 'CHEM 323', 'CHEM 340', 'CHEM 350', 'CHEM 360',  # Choose 3 - Advanced Chemistry
            'CHE 230', 'CHEM 254', 'ME 250', 'SYDE 381',  # Choose max 1 - Thermodynamics
            'CHEM 356', 'NE 332', 'PHYS 234',  # Choose max 1 - Quantum Mechanics
            'CHEM 370', 'NE 333',  # Choose max 1 - Polymer Science
            
            # Theme 3: Earth and Environmental Sciences
            'CHE 102', 'CHEM 123', 'NE 121',  # Choose 1 - Chemistry
            'ECE 105', 'NE 131', 'PHYS 115', 'PHYS 121',  # Choose 1 - Physics
            'ECE 106', 'PHYS 122',  # Choose 1 - Electricity and Magnetism
            'EARTH 121', 'EARTH 121L',  # Required - Earth Sciences
            'EARTH 122', 'EARTH 122L',  # Required - Environmental Sciences
            'CIVE 153', 'ENVE 153', 'GEOE 153',  # Choose 1 - Earth Engineering
            'BIOL 462', 'EARTH 221', 'EARTH 231', 'EARTH 232', 'EARTH 235', 'EARTH 260', 'EARTH 270', 'EARTH 281', 'EARTH 333', 'EARTH 358', 'EARTH 421', 'EARTH 438', 'EARTH 440', 'EARTH 444', 'EARTH 456', 'EARTH 458', 'EARTH 459', 'EARTH 460', 'EARTH 471',  # Choose 3 - Advanced Earth Sciences
        ],
        'quantum-engineering': [
            # Required Courses
            'ECE 405C',  # Programming of Quantum Computing Algorithms
            'AMATH 373', 'CHEM 356', 'ECE 305', 'NE 332', 'PHYS 233', 'PHYS 234',  # Choose 1 - Quantum Mechanics
            'ECE 405A', 'PHYS 468',  # Choose 1 - Quantum Information Processing Devices
            'ECE 405B', 'ECE 405D',  # Choose 1 - Experimental Quantum Information
            
            # List 1 - Differential Equations (choose 1)
            'AE 223', 'CIVE 222', 'ECE 205', 'ENVE 223', 'GEOE 223', 'MATH 211', 'MATH 213', 'MATH 217', 'MATH 218',
            'ME 203', 'MSE 271', 'MTE 202', 'NE 216', 'SYDE 211',
            
            # List 2 - Electrical Circuits (choose 1)
            'AE 123', 'BME 294', 'CIVE 123', 'ECE 106', 'ECE 140', 'ECE 375', 'ENVE 123', 'GENE 123', 'GEOE 123',
            'ME 123', 'MTE 120', 'NE 241', 'PHYS 342', 'SYDE 292',
        ],
        'statistics': [
            # Required Courses
            'STAT 435',  # Statistical Methods for Process Improvements
            'CHE 220', 'CIVE 224', 'ENVE 224', 'GEOE 224', 'ME 202', 'MSE 251', 'MTE 201', 'NE 215', 'STAT 231', 'SYDE 212',  # Choose 1 - Probability and Statistics
            'CHE 225', 'CHE 425', 'MSE 253', 'STAT 332',  # Choose 1 - Process Improvement/Experimental Design
            'STAT 331', 'SYDE 334',  # Choose 1 - Applied Linear Models
            
            # Additional Courses (choose 3)
            'CHE 341', 'CHE 522', 'CHE 524', 'CIVE 343', 'CIVE 375', 'CIVE 440', 'ENVE 573', 'ME 340',
            'MSE 431', 'MSE 432', 'MSE 452', 'PLAN 478', 'STAT 230', 'STAT 333', 'STAT 430', 'STAT 431',
            'STAT 433', 'STAT 443', 'SYDE 531', 'SYDE 533', 'SYDE 572',
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
