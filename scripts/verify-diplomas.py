#!/usr/bin/env python3
"""
Verify that the diplomas data was loaded correctly
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

def verify_diplomas():
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase environment variables")
        return False
    
    supabase = create_client(supabase_url, supabase_key)
    
    print("🔍 Verifying diplomas data...")
    
    # Check diplomas
    try:
        result = supabase.table('diplomas').select('*').execute()
        diplomas = result.data
        
        print(f"✅ Found {len(diplomas)} diplomas in database")
        
        # Show all diplomas
        print("\n📋 Diplomas loaded:")
        for i, diploma in enumerate(diplomas):
            print(f"  {i+1}. {diploma.get('name', 'Unknown')}")
            print(f"     Administered by: {diploma.get('administered_by', 'Unknown')}")
            print(f"     Eligibility: {diploma.get('eligibility', 'Unknown')}")
            print(f"     Min Average: {diploma.get('min_average_required', 'Not specified')}")
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying diplomas: {e}")
        return False

if __name__ == "__main__":
    verify_diplomas()
