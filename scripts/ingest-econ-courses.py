#!/usr/bin/env python3
"""
Script to ingest ECON courses from uw_courses_ECON.json
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

def ingest_econ_courses(json_file_path: str):
    """Ingest ECON courses from JSON file"""
    print(f"📥 Ingesting ECON courses from: {json_file_path}")
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            courses_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: JSON file not found at {json_file_path}")
        return
    except json.JSONDecodeError:
        print(f"❌ Error: Could not decode JSON from {json_file_path}")
        return

    print(f"📚 Found {len(courses_data)} courses in JSON file")

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
            # Map the JSON data to database schema
            clean_course_data = {
                'id': course_code,
                'title': course_data.get('title', ''),
                'description': course_data.get('description', ''),
                'dept': course_data.get('subject', ''),
                'level': int(course_code[4:]) if len(course_code) >= 5 and course_code[4:].isdigit() else 100,
                'units': course_data.get('units', 0.5),
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
                'faculty': 'Arts',
                'number': int(course_code[4:]) if len(course_code) >= 5 and course_code[4:].isdigit() else 0
            }
            
            # Add notes as additional context if available
            if course_data.get('notes'):
                clean_course_data['description'] += f" Note: {course_data['notes']}"
            
            # Check if course already exists
            existing_response = supabase.table('courses').select('id').eq('id', course_code).execute()
            
            if hasattr(existing_response, 'data') and existing_response.data:
                # Course exists, update it
                update_response = supabase.table('courses').update(clean_course_data).eq('id', course_code).execute()
                
                if hasattr(update_response, 'error') and update_response.error:
                    print(f"❌ Failed to update {course_code}: {update_response.error}")
                    failed_count += 1
                else:
                    updated_count += 1
                    print(f"✅ Updated {course_code}: {clean_course_data.get('title', 'No title')}")
            
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
        print("🎉 ECON courses have been ingested successfully!")
    else:
        print("⚠️ Some courses failed to ingest. Check logs for details.")

if __name__ == "__main__":
    json_file = 'uw_courses_ECON.json'
    ingest_econ_courses(json_file)