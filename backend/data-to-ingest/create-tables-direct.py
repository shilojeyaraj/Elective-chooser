#!/usr/bin/env python3
"""
Create the minors/concurrent/accelerated masters tables directly
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

def create_tables():
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase environment variables")
        return False
    
    supabase = create_client(supabase_url, supabase_key)
    
    print("🔧 Creating tables directly...")
    
    # Create minors table
    try:
        print("Creating minors table...")
        supabase.rpc('exec_sql', {'sql': '''
        CREATE TABLE IF NOT EXISTS minors (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          faculty TEXT,
          description TEXT,
          requirements TEXT,
          diploma_note TEXT,
          advice TEXT,
          is_engineering_offered BOOLEAN DEFAULT false,
          available_to_engineering BOOLEAN DEFAULT true,
          units_required NUMERIC,
          courses_required INTEGER,
          description_long TEXT,
          source_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        '''}).execute()
        print("✅ Minors table created")
    except Exception as e:
        print(f"❌ Error creating minors table: {e}")
    
    # Create concurrent_degrees table
    try:
        print("Creating concurrent_degrees table...")
        supabase.rpc('exec_sql', {'sql': '''
        CREATE TABLE IF NOT EXISTS concurrent_degrees (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          description TEXT,
          requirements TEXT,
          advice TEXT,
          available_to_engineering BOOLEAN DEFAULT true,
          extra_courses_required TEXT,
          approval_required TEXT,
          source_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        '''}).execute()
        print("✅ Concurrent degrees table created")
    except Exception as e:
        print(f"❌ Error creating concurrent_degrees table: {e}")
    
    # Create accelerated_masters table
    try:
        print("Creating accelerated_masters table...")
        supabase.rpc('exec_sql', {'sql': '''
        CREATE TABLE IF NOT EXISTS accelerated_masters (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          program_name TEXT NOT NULL,
          description TEXT,
          administered_by TEXT,
          offered_by TEXT,
          average_requirement TEXT,
          record_requirement TEXT,
          graduate_courses_info TEXT,
          research_opportunities TEXT,
          funding_options JSONB,
          tuition_reimbursement JSONB,
          application_process JSONB,
          available_to_engineering BOOLEAN DEFAULT true,
          source_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        '''}).execute()
        print("✅ Accelerated masters table created")
    except Exception as e:
        print(f"❌ Error creating accelerated_masters table: {e}")
    
    print("🎉 Tables created successfully!")

if __name__ == "__main__":
    create_tables()
