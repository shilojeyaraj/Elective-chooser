#!/usr/bin/env python3
"""
Script to fix course title formatting issues by removing duplicate course IDs
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import re

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

def fix_title_formatting():
    """Fix course title formatting issues"""
    print("🔧 Fixing course title formatting issues...")
    
    try:
        # Fetch all courses
        response = supabase.table('courses').select('id, title, dept').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data if hasattr(response, 'data') else []
        
        if not courses:
            print("❌ No courses found in database")
            return
        
        print(f"📚 Found {len(courses)} courses in database")
        
        # Find courses with formatting issues
        courses_to_fix = []
        
        for course in courses:
            course_id = course.get('id', '')
            title = course.get('title', '')
            
            if title and course_id:
                # Check if title starts with course ID
                if title.startswith(f"{course_id} - ") or title.startswith(f"{course_id} "):
                    # Remove the course ID from the title
                    if title.startswith(f"{course_id} - "):
                        new_title = title.replace(f"{course_id} - ", "", 1)
                    elif title.startswith(f"{course_id} "):
                        new_title = title.replace(f"{course_id} ", "", 1)
                    else:
                        continue
                    
                    courses_to_fix.append({
                        'id': course_id,
                        'old_title': title,
                        'new_title': new_title,
                        'dept': course.get('dept', '')
                    })
        
        print(f"🔍 Found {len(courses_to_fix)} courses with title formatting issues")
        
        if not courses_to_fix:
            print("✅ No title formatting issues found!")
            return
        
        # Show what will be fixed
        print(f"\n📋 COURSES TO BE FIXED:")
        print("=" * 80)
        
        for i, course in enumerate(courses_to_fix[:20]):  # Show first 20
            print(f"{i+1:3d}. {course['id']} ({course['dept']})")
            print(f"     Old: '{course['old_title']}'")
            print(f"     New: '{course['new_title']}'")
            print()
        
        if len(courses_to_fix) > 20:
            print(f"     ... and {len(courses_to_fix) - 20} more courses")
        
        # Ask for confirmation
        print(f"\n⚠️  This will update {len(courses_to_fix)} courses in the database.")
        response = input("Do you want to proceed? (y/N): ").strip().lower()
        
        if response != 'y':
            print("❌ Operation cancelled by user")
            return
        
        # Fix the courses
        print(f"\n🔧 Updating course titles...")
        updated_count = 0
        failed_count = 0
        
        for course in courses_to_fix:
            try:
                # Update the course title
                update_response = supabase.table('courses').update({
                    'title': course['new_title']
                }).eq('id', course['id']).execute()
                
                if hasattr(update_response, 'error') and update_response.error:
                    print(f"❌ Failed to update {course['id']}: {update_response.error}")
                    failed_count += 1
                else:
                    updated_count += 1
                    if updated_count % 50 == 0:  # Progress indicator
                        print(f"   Updated {updated_count}/{len(courses_to_fix)} courses...")
            
            except Exception as e:
                print(f"❌ Error updating {course['id']}: {e}")
                failed_count += 1
        
        # Report results
        print(f"\n📊 UPDATE RESULTS:")
        print(f"✅ Successfully updated: {updated_count} courses")
        print(f"❌ Failed to update: {failed_count} courses")
        print(f"📈 Success rate: {(updated_count / len(courses_to_fix) * 100):.1f}%")
        
        if updated_count > 0:
            print(f"\n🎉 Title formatting issues have been fixed!")
            print(f"   - Removed duplicate course IDs from {updated_count} course titles")
            print(f"   - Titles now show proper course names instead of 'COURSE123 - Title'")
        
    except Exception as e:
        print(f"❌ Error fixing title formatting: {e}")

if __name__ == "__main__":
    fix_title_formatting()