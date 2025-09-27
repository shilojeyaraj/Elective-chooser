import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env') # Adjust path to your .env file

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def ingest_waterloo_batch(json_file_path: str):
    print(f"📥 Ingesting Waterloo batch courses from: {json_file_path}")
    
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
        course_id = course_data.get('code')
        if not course_id:
            print("❌ Skipping course with no ID")
            failed_count += 1
            continue
        
        # Remove spaces from course ID to match database format
        course_id = course_id.replace(' ', '')
        
        # Map JSON fields to database schema
        db_data = {
            'id': course_id,
            'title': course_data.get('name'),
            'description': course_data.get('description'),
            'dept': course_data.get('department'),
            'prereqs': course_data.get('prerequisites'),
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
                
                # Update the course
                update_response = supabase.table('courses').update(db_data).eq('id', course_id).execute()
                
                if hasattr(update_response, 'error') and update_response.error:
                    print(f"❌ Failed to update {course_id}: {update_response.error}")
                    failed_count += 1
                else:
                    updated_count += 1
                    if current_title != new_title:
                        print(f"✅ Updated {course_id}: '{current_title}' → '{new_title}'")
                    else:
                        print(f"✅ Updated {course_id}: {new_title}")
                    if db_data.get('prereqs'):
                        print(f"   Prereqs: {db_data['prereqs']}")
            
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

    print(f"\n📊 WATERLOO BATCH INGESTION RESULTS:")
    print(f"✅ Successfully created: {created_count} courses")
    print(f"✅ Successfully updated: {updated_count} courses")
    print(f"❌ Failed: {failed_count} courses")
    print(f"📈 Success rate: {(created_count + updated_count) / len(courses_data) * 100:.1f}%")

    if failed_count == 0:
        print("🎉 Waterloo batch courses have been ingested successfully!")
    else:
        print("⚠️ Some Waterloo batch courses failed to ingest. Check logs for details.")

    return created_count, updated_count, failed_count

if __name__ == "__main__":
    json_file = 'uwaterloo_courses_batch_20250925_183017.json'
    ingest_waterloo_batch(json_file)
