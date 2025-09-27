#!/usr/bin/env python3
"""
Script to ingest uw_cs_mse_block_full.json into the database
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

def ingest_cs_mse_block():
    """Ingest CS/MSE block courses from JSON file"""
    print("📥 Ingesting CS/MSE block courses from JSON...")
    
    try:
        # Read the JSON file
        json_file = "uw_cs_mse_block_full.json"
        if not os.path.exists(json_file):
            print(f"❌ Error: {json_file} not found")
            return
        
        with open(json_file, 'r', encoding='utf-8') as f:
            courses_data = json.load(f)
        
        print(f"📚 Found {len(courses_data)} courses in JSON file")
        
        # Process each course
        updated_count = 0
        created_count = 0
        failed_count = 0
        
        for course_data in courses_data:
            course_id = course_data.get('id')
            if not course_id:
                print("❌ Skipping course with no ID")
                failed_count += 1
                continue
            
            try:
                # Clean and map fields to match database schema
                clean_course_data = course_data.copy()
                
                # Remove fields that don't exist in database schema
                fields_to_remove = ['antirequisites', 'corequisites']
                for field in fields_to_remove:
                    if field in clean_course_data:
                        del clean_course_data[field]
                
                # Map field names to match database schema
                if 'prerequisites' in clean_course_data:
                    clean_course_data['prereqs'] = clean_course_data['prerequisites']
                    del clean_course_data['prerequisites']
                
                # Ensure required fields exist
                if 'faculty' not in clean_course_data:
                    clean_course_data['faculty'] = 'Engineering'  # Default faculty
                if 'number' not in clean_course_data:
                    # Extract number from course ID (e.g., CS338 -> 338)
                    try:
                        clean_course_data['number'] = int(course_id[2:])
                    except:
                        clean_course_data['number'] = 0
                if 'assessments' not in clean_course_data:
                    clean_course_data['assessments'] = {}
                
                # Check if course already exists
                existing_response = supabase.table('courses').select('id').eq('id', course_id).execute()
                
                if hasattr(existing_response, 'data') and existing_response.data:
                    # Course exists, update it
                    update_response = supabase.table('courses').update(clean_course_data).eq('id', course_id).execute()
                    
                    if hasattr(update_response, 'error') and update_response.error:
                        print(f"❌ Failed to update {course_id}: {update_response.error}")
                        failed_count += 1
                    else:
                        updated_count += 1
                        print(f"✅ Updated {course_id}: {clean_course_data.get('title', 'No title')}")
                
                else:
                    # Course doesn't exist, create it
                    insert_response = supabase.table('courses').insert(clean_course_data).execute()
                    
                    if hasattr(insert_response, 'error') and insert_response.error:
                        print(f"❌ Failed to create {course_id}: {insert_response.error}")
                        failed_count += 1
                    else:
                        created_count += 1
                        print(f"✅ Created {course_id}: {clean_course_data.get('title', 'No title')}")
            
            except Exception as e:
                print(f"❌ Error processing {course_id}: {e}")
                failed_count += 1
        
        # Report results
        print(f"\n📊 INGESTION RESULTS:")
        print(f"✅ Successfully created: {created_count} courses")
        print(f"✅ Successfully updated: {updated_count} courses")
        print(f"❌ Failed: {failed_count} courses")
        print(f"📈 Success rate: {((created_count + updated_count) / len(courses_data) * 100):.1f}%")
        
        if created_count > 0 or updated_count > 0:
            print(f"\n🎉 CS/MSE block courses have been ingested successfully!")
        
    except Exception as e:
        print(f"❌ Error ingesting CS/MSE block: {e}")

if __name__ == "__main__":
    ingest_cs_mse_block()
