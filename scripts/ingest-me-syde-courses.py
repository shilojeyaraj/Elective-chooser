import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env') # Adjust path to your .env file

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def ingest_courses(json_file_path: str):
    print(f"📥 Ingesting ME and SYDE courses from: {json_file_path}")
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            courses_data = data.get('courses', [])
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
        
        # Map JSON fields to database schema
        db_data = {
            'id': course_id,
            'title': course_data.get('name'),
            'description': course_data.get('description'),
            'dept': course_data.get('department'),
            'prereqs': course_data.get('prerequisites'),
            'source_url': course_data.get('source'),
            # Add other fields as necessary
        }
        
        # Remove None values to avoid overwriting existing data with nulls if not provided
        db_data = {k: v for k, v in db_data.items() if v is not None}

        try:
            # Check if course already exists
            existing_response = supabase.table('courses').select('id').eq('id', course_id).execute()
            
            if hasattr(existing_response, 'data') and existing_response.data:
                # Course exists, update it
                update_response = supabase.table('courses').update(db_data).eq('id', course_id).execute()
                
                if hasattr(update_response, 'error') and update_response.error:
                    print(f"❌ Failed to update {course_id}: {update_response.error}")
                    failed_count += 1
                else:
                    updated_count += 1
                    print(f"✅ Updated {course_id}: {db_data.get('title', 'No title')}")
                    if db_data.get('prereqs'):
                        print(f"   New prereqs: {db_data['prereqs']}")
            
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

    print("\n📊 INGESTION RESULTS:")
    print(f"✅ Successfully created: {created_count} courses")
    print(f"✅ Successfully updated: {updated_count} courses")
    print(f"❌ Failed: {failed_count} courses")
    print(f"📈 Success rate: {(created_count + updated_count) / len(courses_data) * 100:.1f}%")

    if failed_count == 0:
        print("🎉 ME and SYDE courses have been ingested successfully!")
    else:
        print("⚠️ Some ME and SYDE courses failed to ingest. Check logs for details.")

if __name__ == "__main__":
    json_file = 'uwaterloo_ME_SYDE_courses.json'
    ingest_courses(json_file)