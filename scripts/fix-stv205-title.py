#!/usr/bin/env python3
"""
Script to fix STV 205 title in the database
"""

import os
import sys
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

def fix_stv205_title():
    """Fix STV 205 title to 'Cybernetics and Society'"""
    print("🔧 Fixing STV 205 title...")
    
    try:
        # Update STV 205 title
        response = supabase.table('courses').update({
            'title': 'Cybernetics and Society'
        }).eq('id', 'STV205').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error updating STV 205: {response.error}")
            return
        
        print("✅ Successfully updated STV 205 title to 'Cybernetics and Society'")
        
        # Verify the update
        verify_response = supabase.table('courses').select('id, title').eq('id', 'STV205').execute()
        
        if hasattr(verify_response, 'data') and verify_response.data:
            course = verify_response.data[0]
            print(f"✅ Verified: {course['id']} - {course['title']}")
        else:
            print("❌ Could not verify the update")
        
    except Exception as e:
        print(f"❌ Error fixing STV 205 title: {e}")

if __name__ == "__main__":
    fix_stv205_title()
