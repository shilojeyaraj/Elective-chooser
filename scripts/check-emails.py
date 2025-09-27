#!/usr/bin/env python3
"""
Check what emails exist in the database to help debug authentication issues
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def get_supabase_client():
    """Initialize Supabase client"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables")
        sys.exit(1)
    
    return create_client(url, key)

def check_emails():
    """Check emails in the database"""
    supabase = get_supabase_client()
    
    print("🔍 Checking emails in database...")
    
    try:
        # Get all profiles with emails
        result = supabase.table('profiles').select('user_id, email, username, created_at').order('created_at', desc=True).execute()
        
        if result.data:
            print(f"📊 Found {len(result.data)} profiles in database:")
            print()
            
            for i, profile in enumerate(result.data, 1):
                email = profile.get('email', 'No email')
                username = profile.get('username', 'No username')
                created_at = profile.get('created_at', 'No date')
                user_id = profile.get('user_id', 'No ID')
                
                print(f"{i:2d}. Email: {email}")
                print(f"    Username: {username}")
                print(f"    User ID: {user_id}")
                print(f"    Created: {created_at}")
                print()
        else:
            print("📊 No profiles found in database")
            
    except Exception as e:
        print(f"❌ Error checking emails: {e}")

if __name__ == "__main__":
    check_emails()
