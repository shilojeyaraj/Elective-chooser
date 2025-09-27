#!/usr/bin/env python3
"""
Data processing script for Waterloo Elective Chooser
Handles PDF/HTML extraction, embedding generation, and database operations
"""

import os
import sys
import asyncio
from pathlib import Path
from typing import List, Dict, Any
import json

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv
import openai
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables
load_dotenv()

class DataProcessor:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.db_url = os.getenv('DATABASE_URL')
        
    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI"""
        response = self.openai_client.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        return response.data[0].embedding
    
    def chunk_text(self, text: str, chunk_size: int = 1200, overlap: int = 150) -> List[str]:
        """Split text into overlapping chunks"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk = text[start:end]
            
            # Try to break at sentence boundaries
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > start + chunk_size * 0.5:
                    chunk = chunk[:break_point + 1]
            
            chunks.append(chunk.strip())
            start = start + len(chunk) - overlap
        
        return [chunk for chunk in chunks if len(chunk) > 50]
    
    def process_document(self, text: str, source_url: str, course_id: str = None, option_id: str = None):
        """Process a document and store chunks with embeddings"""
        chunks = self.chunk_text(text)
        
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                for i, chunk in enumerate(chunks):
                    embedding = self.get_embedding(chunk)
                    
                    cur.execute("""
                        INSERT INTO elective_docs (course_id, option_id, text, source_url, chunk_id, embedding)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT DO NOTHING
                    """, (course_id, option_id, chunk, source_url, i, embedding))
                
                conn.commit()
                print(f"Processed {len(chunks)} chunks from {source_url}")
    
    def upload_courses_from_csv(self, csv_file: str):
        """Upload courses from CSV file"""
        import pandas as pd
        
        df = pd.read_csv(csv_file)
        
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                for _, row in df.iterrows():
                    cur.execute("""
                        INSERT INTO courses (id, title, dept, units, level, description, 
                                           terms_offered, prereqs, skills, workload, 
                                           assessments, source_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            title = EXCLUDED.title,
                            dept = EXCLUDED.dept,
                            units = EXCLUDED.units,
                            level = EXCLUDED.level,
                            description = EXCLUDED.description,
                            terms_offered = EXCLUDED.terms_offered,
                            prereqs = EXCLUDED.prereqs,
                            skills = EXCLUDED.skills,
                            workload = EXCLUDED.workload,
                            assessments = EXCLUDED.assessments,
                            source_url = EXCLUDED.source_url,
                            updated_at = NOW()
                    """, (
                        row['id'], row['title'], row['dept'], row['units'], 
                        row['level'], row['description'], 
                        json.dumps(row['terms_offered']) if isinstance(row['terms_offered'], list) else row['terms_offered'],
                        row['prereqs'], 
                        json.dumps(row['skills']) if isinstance(row['skills'], list) else row['skills'],
                        json.dumps(row['workload']) if isinstance(row['workload'], dict) else row['workload'],
                        json.dumps(row['assessments']) if isinstance(row['assessments'], dict) else row['assessments'],
                        row['source_url']
                    ))
                
                conn.commit()
                print(f"Uploaded {len(df)} courses")
    
    def upload_options_from_csv(self, csv_file: str):
        """Upload options from CSV file"""
        import pandas as pd
        
        df = pd.read_csv(csv_file)
        
        with psycopg2.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                for _, row in df.iterrows():
                    cur.execute("""
                        INSERT INTO options (id, name, program, faculty, required_courses, 
                                           selective_rules, description, source_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            program = EXCLUDED.program,
                            faculty = EXCLUDED.faculty,
                            required_courses = EXCLUDED.required_courses,
                            selective_rules = EXCLUDED.selective_rules,
                            description = EXCLUDED.description,
                            source_url = EXCLUDED.source_url,
                            updated_at = NOW()
                    """, (
                        row['id'], row['name'], row['program'], row['faculty'],
                        json.dumps(row['required_courses']) if isinstance(row['required_courses'], list) else row['required_courses'],
                        json.dumps(row['selective_rules']) if isinstance(row['selective_rules'], dict) else row['selective_rules'],
                        row['description'], row['source_url']
                    ))
                
                conn.commit()
                print(f"Uploaded {len(df)} options")

def main():
    """Main function to run data processing"""
    if len(sys.argv) < 2:
        print("Usage: python data_processor.py <command> [args...]")
        print("Commands:")
        print("  upload-courses <csv_file>")
        print("  upload-options <csv_file>")
        print("  process-doc <text_file> <source_url> [course_id] [option_id]")
        return
    
    processor = DataProcessor()
    command = sys.argv[1]
    
    if command == "upload-courses":
        if len(sys.argv) < 3:
            print("Error: CSV file path required")
            return
        processor.upload_courses_from_csv(sys.argv[2])
    
    elif command == "upload-options":
        if len(sys.argv) < 3:
            print("Error: CSV file path required")
            return
        processor.upload_options_from_csv(sys.argv[2])
    
    elif command == "process-doc":
        if len(sys.argv) < 4:
            print("Error: text file and source URL required")
            return
        
        with open(sys.argv[2], 'r', encoding='utf-8') as f:
            text = f.read()
        
        source_url = sys.argv[3]
        course_id = sys.argv[4] if len(sys.argv) > 4 else None
        option_id = sys.argv[5] if len(sys.argv) > 5 else None
        
        processor.process_document(text, source_url, course_id, option_id)
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
