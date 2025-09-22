#!/usr/bin/env python3
"""
Script to add scraped course data to the database
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

def load_scraped_courses():
    """Load scraped courses from AllDepartments_scraped.json"""
    json_file_path = os.path.join(os.path.dirname(__file__), 'AllDepartments_scraped.json')
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    all_courses = []
    for department, courses in data.items():
        all_courses.extend(courses)
    
    return all_courses

def update_courses_with_scraped_data():
    """Update existing courses with scraped data"""
    
    # Load scraped courses
    print("📖 Loading scraped course data...")
    scraped_courses = load_scraped_courses()
    print(f"📚 Found {len(scraped_courses)} scraped courses")
    
    # Get existing courses from database
    response = supabase.from_('courses').select('id, title, description, prereqs, terms_offered, source_url').execute()
    existing_courses = {c['id']: c for c in response.data} if response.data else {}
    print(f"📚 Found {len(existing_courses)} existing courses in database")
    
    # Create a mapping of course ID to scraped course data
    scraped_courses_by_id = {course['id']: course for course in scraped_courses}
    
    # Find courses that exist in both database and scraped data
    common_courses = set(existing_courses.keys()) & set(scraped_courses_by_id.keys())
    
    print(f"🔄 Found {len(common_courses)} courses that can be updated with scraped data")
    
    updated_count = 0
    failed_count = 0
    
    for course_id in sorted(common_courses):
        try:
            existing_course = existing_courses[course_id]
            scraped_course = scraped_courses_by_id[course_id]
            
            # Check if the scraped data has better information
            needs_update = False
            update_data = {}
            
            # Check if scraped data has better title
            if (scraped_course.get('title') and 
                scraped_course['title'] != existing_course.get('title') and
                len(scraped_course['title']) > len(existing_course.get('title', ''))):
                update_data['title'] = scraped_course['title']
                needs_update = True
            
            # Check if scraped data has better description
            if (scraped_course.get('description') and 
                scraped_course['description'] != existing_course.get('description') and
                len(scraped_course['description']) > len(existing_course.get('description', ''))):
                update_data['description'] = scraped_course['description']
                needs_update = True
            
            # Check if scraped data has better prerequisites
            if (scraped_course.get('prereqs') and 
                scraped_course['prereqs'] != existing_course.get('prereqs') and
                len(scraped_course['prereqs']) > len(existing_course.get('prereqs', ''))):
                update_data['prereqs'] = scraped_course['prereqs']
                needs_update = True
            
            # Check if scraped data has terms offered
            if scraped_course.get('terms_offered') and not existing_course.get('terms_offered'):
                update_data['terms_offered'] = scraped_course['terms_offered']
                needs_update = True
            
            # Check if scraped data has source URL
            if scraped_course.get('source_url') and not existing_course.get('source_url'):
                update_data['source_url'] = scraped_course['source_url']
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
    
    print(f"\n🎉 Successfully updated {updated_count} courses with scraped data!")
    if failed_count > 0:
        print(f"❌ Failed to update {failed_count} courses")

def main():
    print("🚀 Starting scraped course data update...")
    
    try:
        update_courses_with_scraped_data()
        print("✅ Scraped course data update completed successfully!")
        
    except Exception as e:
        print(f"❌ Update failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
