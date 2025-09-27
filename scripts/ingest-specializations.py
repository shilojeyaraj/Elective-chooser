import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env')

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def ingest_specializations(json_file_path: str):
    print(f"📥 Ingesting specializations from: {json_file_path}")
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            programs = data.get('programs', [])
    except FileNotFoundError:
        print(f"❌ Error: JSON file not found at {json_file_path}")
        return
    except json.JSONDecodeError:
        print(f"❌ Error: Could not decode JSON from {json_file_path}")
        return

    print(f"📚 Found {len(programs)} programs with specializations")

    created_count = 0
    updated_count = 0
    failed_count = 0

    for program_data in programs:
        program_name = program_data.get('program', 'Unknown Program')
        specializations = program_data.get('specializations', [])
        
        print(f"\n🏗️ Processing {program_name} ({len(specializations)} specializations)")
        
        for spec_data in specializations:
            spec_name = spec_data.get('name', 'Unnamed Specialization')
            if not spec_name:
                print("❌ Skipping specialization with no name")
                failed_count += 1
                continue
            
            # Extract numeric value from minimum average requirement
            min_avg_text = spec_data.get('minimum_average_required', '')
            min_avg_numeric = None
            if min_avg_text and '60%' in min_avg_text:
                min_avg_numeric = 60
            elif min_avg_text and '50%' in min_avg_text:
                min_avg_numeric = 50
            
            # Map JSON fields to database schema
            db_data = {
                'name': spec_name,
                'program': program_name,
                'description': spec_data.get('graduation_requirements_summary', ''),
                'min_average_in_specialization': min_avg_numeric,
                'graduation_requirements': spec_data.get('graduation_requirements_summary', ''),
                'course_requirements': spec_data.get('course_requirements', {}),
                'source_url': spec_data.get('sources', [''])[0] if spec_data.get('sources') else ''
            }
            
            # Remove None values
            db_data = {k: v for k, v in db_data.items() if v is not None}

            try:
                # Check if specialization already exists
                existing_response = supabase.table('specializations').select('id').eq('name', spec_name).eq('program', program_name).execute()
                
                if hasattr(existing_response, 'data') and existing_response.data:
                    # Specialization exists, update it
                    update_response = supabase.table('specializations').update(db_data).eq('name', spec_name).eq('program', program_name).execute()
                    
                    if hasattr(update_response, 'error') and update_response.error:
                        print(f"❌ Failed to update {spec_name}: {update_response.error}")
                        failed_count += 1
                    else:
                        updated_count += 1
                        print(f"✅ Updated {spec_name}")
                
                else:
                    # Specialization doesn't exist, create it
                    insert_response = supabase.table('specializations').insert(db_data).execute()
                    
                    if hasattr(insert_response, 'error') and insert_response.error:
                        print(f"❌ Failed to create {spec_name}: {insert_response.error}")
                        failed_count += 1
                    else:
                        created_count += 1
                        print(f"✅ Created {spec_name}")
            
            except Exception as e:
                print(f"❌ Error processing {spec_name}: {e}")
                failed_count += 1

    print("\n📊 INGESTION RESULTS:")
    print(f"✅ Successfully created: {created_count} specializations")
    print(f"✅ Successfully updated: {updated_count} specializations")
    print(f"❌ Failed: {failed_count} specializations")
    print(f"📈 Success rate: {(created_count + updated_count) / (created_count + updated_count + failed_count) * 100:.1f}%")

    if failed_count == 0:
        print("🎉 All specializations have been ingested successfully!")
    else:
        print("⚠️ Some specializations failed to ingest. Check logs for details.")

if __name__ == "__main__":
    json_file = 'waterloo_engineering_specializations (1).json'
    ingest_specializations(json_file)
