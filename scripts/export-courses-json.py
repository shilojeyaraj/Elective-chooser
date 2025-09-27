#!/usr/bin/env python3
"""
Script to export courses database to JSON format for training
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

def export_courses_to_json():
    """Export all courses to JSON format"""
    print("📤 Exporting courses database to JSON...")
    
    try:
        # Fetch all courses with all fields
        response = supabase.table('courses').select('*').order('id').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ No courses found in database")
            return
        
        print(f"📚 Found {len(courses)} courses in database")
        
        # Create the JSON structure
        courses_data = {
            "metadata": {
                "total_courses": len(courses),
                "export_date": "2024-12-19",
                "description": "Waterloo University courses database for AI training"
            },
            "courses": courses
        }
        
        # Write to JSON file
        output_file = "courses_database.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(courses_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully exported {len(courses)} courses to {output_file}")
        print(f"📁 File size: {os.path.getsize(output_file) / 1024 / 1024:.2f} MB")
        
        # Show sample of the data
        print(f"\n📋 SAMPLE COURSE DATA:")
        print("=" * 50)
        if courses:
            sample_course = courses[0]
            print(json.dumps(sample_course, indent=2, ensure_ascii=False))
        
        # Show field statistics
        print(f"\n📊 DATABASE FIELDS:")
        if courses:
            fields = list(courses[0].keys())
            for field in sorted(fields):
                non_null_count = sum(1 for course in courses if course.get(field) is not None)
                print(f"  {field}: {non_null_count}/{len(courses)} courses ({non_null_count/len(courses)*100:.1f}%)")
        
    except Exception as e:
        print(f"❌ Error exporting courses: {e}")

if __name__ == "__main__":
    export_courses_to_json()
