#!/usr/bin/env python3
"""
Script to ingest courses from uw_titles_prereqs_partial.json
"""

import os
import sys
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(env_path)

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ Error: Missing SUPABASE_URL or SUPABASE_KEY in environment variables")
    sys.exit(1)

supabase: Client = create_client(url, key)

def ingest_titles_prereqs(json_file_path: str):
    """Ingest courses from uw_titles_prereqs_partial.json"""
    print(f"📥 Ingesting courses from: {json_file_path}")
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: JSON file not found at {json_file_path}")
        return
    except json.JSONDecodeError:
        print(f"❌ Error: Could not decode JSON from {json_file_path}")
        return

    courses_data = data.get('courses', [])
    print(f"📚 Found {len(courses_data)} courses in JSON file")
    print(f"📝 Source: {data.get('metadata', {}).get('source_hint', 'Unknown')}")

    created_count = 0
    updated_count = 0
    failed_count = 0

    for course_data in courses_data:
        course_code = course_data.get('code')
        if not course_code:
            print("❌ Skipping course with no code")
            failed_count += 1
            continue
        
        try:
            # Determine course level based on course code pattern
            level = 100  # Default
            if len(course_code) >= 4:
                # Try to extract number from the end
                for i in range(len(course_code) - 1, 0, -1):
                    if course_code[i].isdigit():
                        # Found a digit, extract the number
                        num_str = ""
                        for j in range(i, len(course_code)):
                            if course_code[j].isdigit():
                                num_str += course_code[j]
                            else:
                                break
                        if num_str:
                            level = int(num_str)
                            break
            
            # Determine faculty based on department
            faculty = 'Engineering'  # Default
            dept = course_code[:2] if len(course_code) >= 2 else 'Unknown'
            if dept in ['CS']:
                faculty = 'Mathematics'
            elif dept in ['EC']:
                faculty = 'Engineering'
            elif dept in ['MS']:
                faculty = 'Engineering'
            
            # Map the JSON data to database schema
            clean_course_data = {
                'id': course_code,
                'title': course_data.get('title', ''),
                'dept': dept,
                'level': level,
                'units': 0.5,  # Default assumption
                'prereqs': course_data.get('prerequisites', ''),
                'terms_offered': ['F', 'W', 'S'],  # Default assumption
                'skills': [],  # Will be populated later
                'workload': {
                    'reading': 3,
                    'assignments': 3,
                    'projects': 2,
                    'labs': 2
                },
                'assessments': {},
                'fulfills_options': [],
                'fulfills_specializations': [],
                'fulfills_certificates': [],
                'fulfills_diplomas': [],
                'cse_classification': None,
                'source_url': f"https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/home",
                'faculty': faculty,
                'number': level
            }
            
            # Check if course already exists
            existing_response = supabase.table('courses').select('id, title, description, prereqs').eq('id', course_code).execute()
            
            if hasattr(existing_response, 'data') and existing_response.data:
                # Course exists, update it with new title and prerequisites
                existing_course = existing_response.data[0]
                
                # Only update if we have better data
                update_data = {}
                if course_data.get('title') and course_data['title'] != existing_course.get('title'):
                    update_data['title'] = course_data['title']
                
                if course_data.get('prerequisites') and course_data['prerequisites'] != existing_course.get('prereqs'):
                    update_data['prereqs'] = course_data['prerequisites']
                
                if update_data:
                    update_response = supabase.table('courses').update(update_data).eq('id', course_code).execute()
                    
                    if hasattr(update_response, 'error') and update_response.error:
                        print(f"❌ Failed to update {course_code}: {update_response.error}")
                        failed_count += 1
                    else:
                        updated_count += 1
                        print(f"✅ Updated {course_code}: {course_data.get('title', 'No title')}")
                        if 'title' in update_data:
                            print(f"   New title: {update_data['title']}")
                        if 'prereqs' in update_data:
                            print(f"   New prereqs: {update_data['prereqs']}")
                else:
                    print(f"⏭️ Skipped {course_code}: No changes needed")
            
            else:
                # Course doesn't exist, create it
                insert_response = supabase.table('courses').insert(clean_course_data).execute()
                
                if hasattr(insert_response, 'error') and insert_response.error:
                    print(f"❌ Failed to create {course_code}: {insert_response.error}")
                    failed_count += 1
                else:
                    created_count += 1
                    print(f"✅ Created {course_code}: {clean_course_data.get('title', 'No title')}")
        
        except Exception as e:
            print(f"❌ Error processing {course_code}: {e}")
            failed_count += 1

    print("\n📊 INGESTION RESULTS:")
    print(f"✅ Successfully created: {created_count} courses")
    print(f"✅ Successfully updated: {updated_count} courses")
    print(f"❌ Failed: {failed_count} courses")
    print(f"📈 Success rate: {(created_count + updated_count) / len(courses_data) * 100:.1f}%")

    if failed_count == 0:
        print("🎉 Courses have been ingested successfully!")
    else:
        print("⚠️ Some courses failed to ingest. Check logs for details.")

if __name__ == "__main__":
    json_file = 'uw_titles_prereqs_partial.json'
    ingest_titles_prereqs(json_file)
