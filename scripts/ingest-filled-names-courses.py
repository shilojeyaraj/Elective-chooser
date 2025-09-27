import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env') # Adjust path to your .env file

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def ingest_filled_names_courses(json_file_path: str, department_name: str, courses_key: str):
    print(f"📥 Ingesting {department_name} filled names from: {json_file_path}")
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            courses_data = data.get(courses_key, [])
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
        course_id = course_data.get('code')
        if not course_id:
            print("❌ Skipping course with no ID")
            failed_count += 1
            continue
        
        # Handle prerequisites - they might be a dict or string
        prereqs = course_data.get('prerequisites')
        if isinstance(prereqs, dict):
            # If it's a dict, extract the corequisites and notes
            prereq_parts = []
            if prereqs.get('corequisites'):
                prereq_parts.append(f"Coreq: {prereqs['corequisites']}")
            if prereqs.get('antirequisites'):
                prereq_parts.append(f"Antireq: {prereqs['antirequisites']}")
            if prereqs.get('notes'):
                prereq_parts.append(prereqs['notes'])
            prereqs = '; '.join(prereq_parts) if prereq_parts else None
        
        # Map JSON fields to database schema
        db_data = {
            'id': course_id,
            'title': course_data.get('name'),
            'description': course_data.get('description'),
            'dept': course_data.get('department'),
            'prereqs': prereqs,
            # Handle sources - convert list to string if needed
            'source_url': course_data.get('sources', [None])[0] if course_data.get('sources') else None,
        }
        
        # Remove None values to avoid overwriting existing data with nulls if not provided
        db_data = {k: v for k, v in db_data.items() if v is not None}

        try:
            # Check if course already exists
            existing_response = supabase.table('courses').select('id, title').eq('id', course_id).execute()
            
            if hasattr(existing_response, 'data') and existing_response.data:
                existing_course = existing_response.data[0]
                current_title = existing_course.get('title', '')
                new_title = db_data.get('title', '')
                
                # Only update if the new title is different and not empty
                if new_title and new_title != current_title:
                    update_response = supabase.table('courses').update(db_data).eq('id', course_id).execute()
                    
                    if hasattr(update_response, 'error') and update_response.error:
                        print(f"❌ Failed to update {course_id}: {update_response.error}")
                        failed_count += 1
                    else:
                        updated_count += 1
                        print(f"✅ Updated {course_id}: '{current_title}' → '{new_title}'")
                        if db_data.get('prereqs'):
                            print(f"   New prereqs: {db_data['prereqs']}")
                else:
                    print(f"⏭️ Skipped {course_id}: No title changes needed")
            
            else:
                # Course doesn't exist, create it
                insert_response = supabase.table('courses').insert(db_data).execute()
                
                if hasattr(insert_response, 'error') and insert_response.error:
                    print(f"❌ Failed to create {course_id}: {insert_response.error}")
                    failed_count += 1
                else:
                    created_count += 1
                    print(f"✅ Created {course_id}: {db_data.get('title', 'No title')}")
                    if db_data.get('prereqs'):
                        print(f"   Prereqs: {db_data['prereqs']}")
        
        except Exception as e:
            print(f"❌ Error processing {course_id}: {e}")
            failed_count += 1

    print(f"\n📊 {department_name} FILLED NAMES INGESTION RESULTS:")
    print(f"✅ Successfully created: {created_count} courses")
    print(f"✅ Successfully updated: {updated_count} courses")
    print(f"❌ Failed: {failed_count} courses")
    print(f"📈 Success rate: {(created_count + updated_count) / len(courses_data) * 100:.1f}%")

    if failed_count == 0:
        print(f"🎉 {department_name} filled names have been ingested successfully!")
    else:
        print(f"⚠️ Some {department_name} filled names failed to ingest. Check logs for details.")

    return created_count, updated_count, failed_count

if __name__ == "__main__":
    print("🚀 Starting NE and PHYS filled names ingestion...")
    
    # Ingest NE filled names
    ne_created, ne_updated, ne_failed = ingest_filled_names_courses('uw_NE_courses_filled_names.json', 'NE', 'ne')
    
    print("\n" + "="*50 + "\n")
    
    # Ingest PHYS filled names
    phys_created, phys_updated, phys_failed = ingest_filled_names_courses('uw_PHYS_courses_filled_names.json', 'PHYS', 'phys')
    
    print("\n" + "="*50)
    print("🎯 OVERALL FILLED NAMES RESULTS:")
    print(f"✅ Total created: {ne_created + phys_created} courses")
    print(f"✅ Total updated: {ne_updated + phys_updated} courses")
    print(f"❌ Total failed: {ne_failed + phys_failed} courses")
    print("🎉 NE and PHYS filled names ingestion completed!")
