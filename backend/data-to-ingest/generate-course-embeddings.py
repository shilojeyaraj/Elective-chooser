#!/usr/bin/env python3
"""
Generate embeddings for all courses in the database
"""

import os
import sys
import json
from supabase import create_client, Client
from openai import OpenAI
import time

# Add the parent directory to the path so we can import from lib
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Initialize Supabase client
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')
supabase: Client = create_client(url, key)

def get_embedding(text: str) -> list[float]:
    """Get embedding for text using OpenAI"""
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return None

def generate_course_embedding(course):
    """Generate embedding for a single course"""
    # Create a comprehensive text representation of the course
    text_parts = []
    
    if course.get('title'):
        text_parts.append(f"Title: {course['title']}")
    
    if course.get('description'):
        text_parts.append(f"Description: {course['description']}")
    
    if course.get('skills') and isinstance(course['skills'], list):
        text_parts.append(f"Skills: {', '.join(course['skills'])}")
    
    if course.get('dept'):
        text_parts.append(f"Department: {course['dept']}")
    
    if course.get('level'):
        text_parts.append(f"Level: {course['level']}")
    
    if course.get('prereqs'):
        text_parts.append(f"Prerequisites: {course['prereqs']}")
    
    if course.get('terms_offered') and isinstance(course['terms_offered'], list):
        text_parts.append(f"Terms offered: {', '.join(course['terms_offered'])}")
    
    # Join all parts
    full_text = " | ".join(text_parts)
    
    # Get embedding
    embedding = get_embedding(full_text)
    return embedding

def main():
    print("🚀 Starting course embedding generation...")
    
    # Get all courses
    print("📚 Fetching courses from database...")
    response = supabase.table('courses').select('*').execute()
    
    if not response.data:
        print("❌ No courses found in database")
        return
    
    courses = response.data
    print(f"📚 Found {len(courses)} courses")
    
    # Process courses in batches
    batch_size = 10
    processed = 0
    errors = 0
    
    for i in range(0, len(courses), batch_size):
        batch = courses[i:i + batch_size]
        print(f"🔄 Processing batch {i//batch_size + 1}/{(len(courses) + batch_size - 1)//batch_size}")
        
        for course in batch:
            try:
                print(f"  📝 Processing {course['id']}: {course['title']}")
                
                # Generate embedding
                embedding = generate_course_embedding(course)
                
                if embedding:
                    # Update course with embedding
                    update_response = supabase.table('courses').update({
                        'embedding': embedding
                    }).eq('id', course['id']).execute()
                    
                    if update_response.data:
                        print(f"    ✅ Updated {course['id']} with embedding")
                        processed += 1
                    else:
                        print(f"    ❌ Failed to update {course['id']}")
                        errors += 1
                else:
                    print(f"    ❌ Failed to generate embedding for {course['id']}")
                    errors += 1
                
                # Rate limiting - wait a bit between requests
                time.sleep(0.1)
                
            except Exception as e:
                print(f"    ❌ Error processing {course['id']}: {e}")
                errors += 1
        
        # Wait between batches
        time.sleep(1)
    
    print(f"\n🎉 Embedding generation complete!")
    print(f"✅ Successfully processed: {processed} courses")
    print(f"❌ Errors: {errors} courses")
    
    # Verify some embeddings were created
    print("\n🔍 Verifying embeddings...")
    verify_response = supabase.table('courses').select('id, title').not_.is_('embedding', 'null').limit(5).execute()
    
    if verify_response.data:
        print(f"✅ Found {len(verify_response.data)} courses with embeddings")
        for course in verify_response.data:
            print(f"  - {course['id']}: {course['title']}")
    else:
        print("❌ No courses with embeddings found")

if __name__ == "__main__":
    main()
