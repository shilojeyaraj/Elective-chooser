#!/usr/bin/env python3
"""
Setup vector search for courses
"""

import os
import sys
from supabase import create_client
from openai import OpenAI
import time

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize clients
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(url, key)

def execute_sql(sql_content):
    """Execute SQL content"""
    try:
        # Split by semicolon and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for stmt in statements:
            if stmt:
                print(f"Executing: {stmt[:50]}...")
                result = supabase.rpc('exec_sql', {'sql': stmt})
                print("✅ Success")
    except Exception as e:
        print(f"❌ Error: {e}")

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
    print("🚀 Setting up vector search for courses...")
    
    # Step 1: Execute SQL to add vector search capability
    print("\n📝 Step 1: Adding vector search capability...")
    with open('add-vector-search.sql', 'r') as f:
        sql_content = f.read()
    
    execute_sql(sql_content)
    
    # Step 2: Generate embeddings for a few courses as a test
    print("\n📝 Step 2: Generating embeddings for sample courses...")
    
    # Get first 5 courses
    response = supabase.table('courses').select('*').limit(5).execute()
    
    if not response.data:
        print("❌ No courses found")
        return
    
    courses = response.data
    print(f"📚 Found {len(courses)} courses to process")
    
    for course in courses:
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
                else:
                    print(f"    ❌ Failed to update {course['id']}")
            else:
                print(f"    ❌ Failed to generate embedding for {course['id']}")
            
            # Rate limiting
            time.sleep(0.5)
            
        except Exception as e:
            print(f"    ❌ Error processing {course['id']}: {e}")
    
    print("\n🎉 Vector search setup complete!")
    print("✅ You can now test the search functionality in the frontend")

if __name__ == "__main__":
    main()
