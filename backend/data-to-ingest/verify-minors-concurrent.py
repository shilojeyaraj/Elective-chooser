#!/usr/bin/env python3
"""
Verify that the minors/concurrent/accelerated masters data was loaded correctly
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
    
    print("🔍 Verifying minors/concurrent/accelerated masters data...")
    
    # Check minors
    try:
        result = supabase.table('minors').select('*').execute()
        minors = result.data
        
        print(f"✅ Found {len(minors)} minors in database")
        
        print("\n📋 Minors loaded:")
        for i, minor in enumerate(minors):
            print(f"  {i+1}. {minor.get('name', 'Unknown')}")
            print(f"     Faculty: {minor.get('faculty', 'Unknown')}")
            print(f"     Available to Engineering: {minor.get('available_to_engineering', 'Unknown')}")
            print()
        
    except Exception as e:
        print(f"❌ Error verifying minors: {e}")
    
    # Check concurrent degrees
    try:
        result = supabase.table('concurrent_degrees').select('*').execute()
        concurrent = result.data
        
        print(f"✅ Found {len(concurrent)} concurrent degrees in database")
        
        print("\n🎓 Concurrent Degrees loaded:")
        for i, degree in enumerate(concurrent):
            print(f"  {i+1}. {degree.get('name', 'Unknown')}")
            print(f"     Description: {degree.get('description', 'Unknown')[:100]}...")
            print()
        
    except Exception as e:
        print(f"❌ Error verifying concurrent degrees: {e}")
    
    # Check accelerated masters
    try:
        result = supabase.table('accelerated_masters').select('*').execute()
        accelerated = result.data
        
        print(f"✅ Found {len(accelerated)} accelerated masters in database")
        
        print("\n🚀 Accelerated Masters loaded:")
        for i, master in enumerate(accelerated):
            print(f"  {i+1}. {master.get('program_name', 'Unknown')}")
            print(f"     Administered by: {master.get('administered_by', 'Unknown')}")
            print(f"     Average Requirement: {master.get('average_requirement', 'Unknown')}")
            print()
        
    except Exception as e:
        print(f"❌ Error verifying accelerated masters: {e}")
    
    return True

if __name__ == "__main__":
    verify_data()
