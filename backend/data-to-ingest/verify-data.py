#!/usr/bin/env python3
"""
Verify that the specializations data was loaded correctly
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

def verify_data():
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase environment variables")
        return False
    
    supabase = create_client(supabase_url, supabase_key)
    
    print("🔍 Verifying specializations data...")
    
    # Check specializations
    try:
        result = supabase.table('specializations').select('*').execute()
        specializations = result.data
        
        print(f"✅ Found {len(specializations)} specializations in database")
        
        # Show first few specializations
        print("\n📋 Sample specializations:")
        for i, spec in enumerate(specializations[:3]):
            print(f"  {i+1}. {spec.get('name', 'Unknown')} ({spec.get('program', 'Unknown')})")
        
        if len(specializations) > 3:
            print(f"  ... and {len(specializations) - 3} more specializations")
        
        # Check courses
        result = supabase.table('courses').select('*').execute()
        courses = result.data
        
        print(f"\n✅ Found {len(courses)} courses in database")
        
        # Show first few courses
        print("\n📚 Sample courses:")
        for i, course in enumerate(courses[:3]):
            print(f"  {i+1}. {course.get('id', 'Unknown')} - {course.get('title', 'Unknown')}")
        
        if len(courses) > 3:
            print(f"  ... and {len(courses) - 3} more courses")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying data: {e}")
        return False

if __name__ == "__main__":
    verify_data()
