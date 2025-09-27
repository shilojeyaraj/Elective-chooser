#!/usr/bin/env python3
"""
Script to add courses from AllDepartments_filled_progress.json to the database
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

def load_courses_from_progress_json():
    """Load all courses from the AllDepartments_filled_progress.json file"""
    json_file_path = os.path.join(os.path.dirname(__file__), 'AllDepartments_filled_progress.json')
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    all_courses = []
    for department, courses in data.items():
        all_courses.extend(courses)
    
    return all_courses

def add_courses_from_progress_json():
    """Add courses from progress JSON file to the database"""
    
    # Load all courses from progress JSON
    print("📖 Loading courses from AllDepartments_filled_progress.json...")
    all_courses_from_json = load_courses_from_progress_json()
    print(f"📚 Found {len(all_courses_from_json)} courses in progress JSON file")
    
    # Get existing courses from database
    response = supabase.from_('courses').select('id').execute()
    existing_courses = {c['id'] for c in response.data} if response.data else set()
    print(f"📚 Found {len(existing_courses)} existing courses in database")
    
    # Create a mapping of course ID to course data from progress JSON
    progress_courses_by_id = {course['id']: course for course in all_courses_from_json}
    
    # Find courses that are in progress JSON but not in database
    missing_courses = set(progress_courses_by_id.keys()) - existing_courses
    
    print(f"➕ Found {len(missing_courses)} new courses in progress JSON file")
    
    if not missing_courses:
        print("✅ All courses from progress JSON already exist in the database!")
        return
    
    print(f"\n🔄 Adding {len(missing_courses)} new courses from progress JSON...")
    
    added_count = 0
    failed_count = 0
    
    for course_id in sorted(missing_courses):
        try:
            course_data = progress_courses_by_id[course_id]
            
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

def update_existing_courses_with_progress_data():
    """Update existing courses with more detailed data from progress JSON"""
    
    # Load all courses from progress JSON
    print("\n📖 Loading courses from AllDepartments_filled_progress.json for updates...")
    all_courses_from_json = load_courses_from_progress_json()
    
    # Get existing courses from database
    response = supabase.from_('courses').select('id, title, description, prereqs').execute()
    existing_courses = {c['id']: c for c in response.data} if response.data else {}
    
    # Create a mapping of course ID to course data from progress JSON
    progress_courses_by_id = {course['id']: course for course in all_courses_from_json}
    
    # Find courses that exist in both database and progress JSON
    common_courses = set(existing_courses.keys()) & set(progress_courses_by_id.keys())
    
    print(f"🔄 Found {len(common_courses)} courses that can be updated with progress data")
    
    updated_count = 0
    failed_count = 0
    
    for course_id in sorted(common_courses):
        try:
            existing_course = existing_courses[course_id]
            progress_course = progress_courses_by_id[course_id]
            
            # Check if the progress data has more detailed information
            needs_update = False
            update_data = {}
            
            # Check if progress data has better description
            if (progress_course.get('description') and 
                progress_course['description'] != existing_course.get('description') and
                len(progress_course['description']) > len(existing_course.get('description', ''))):
                update_data['description'] = progress_course['description']
                needs_update = True
            
            # Check if progress data has better prerequisites
            if (progress_course.get('prereqs') and 
                progress_course['prereqs'] != existing_course.get('prereqs') and
                len(progress_course['prereqs']) > len(existing_course.get('prereqs', ''))):
                update_data['prereqs'] = progress_course['prereqs']
                needs_update = True
            
            # Check if progress data has skills
            if progress_course.get('skills') and not existing_course.get('skills'):
                update_data['skills'] = progress_course['skills']
                needs_update = True
            
            if needs_update:
                # Update course in database
                response = supabase.from_('courses').update(update_data).eq('id', course_id).execute()
                
                if response.data:
                    print(f"✅ Updated {course_id}: {list(update_data.keys())}")
                    updated_count += 1
                else:
                    print(f"❌ Failed to update {course_id}: {response.error}")
                    failed_count += 1
                
        except Exception as e:
            print(f"❌ Error updating {course_id}: {e}")
            failed_count += 1
        
        # Small delay to avoid overwhelming the database
        time.sleep(0.05)
    
    print(f"\n🎉 Successfully updated {updated_count} courses with progress data!")
    if failed_count > 0:
        print(f"❌ Failed to update {failed_count} courses")

def main():
    print("🚀 Starting courses addition from progress JSON...")
    
    try:
        # First, add any new courses
        add_courses_from_progress_json()
        
        # Then, update existing courses with more detailed data
        update_existing_courses_with_progress_data()
        
        print("✅ Progress JSON courses addition completed successfully!")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
