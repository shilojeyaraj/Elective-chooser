#!/usr/bin/env python3
"""
Check for Gmail emails in the database
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

def check_gmail_emails():
    """Check for Gmail emails in the database"""
    supabase = get_supabase_client()
    
    print("🔍 Checking for Gmail emails in database...")
    
    try:
        # Get all profiles with Gmail emails
        result = supabase.table('profiles').select('user_id, email, username, created_at').ilike('email', '%@gmail.com').execute()
        
        if result.data:
            print(f"📊 Found {len(result.data)} Gmail accounts in database:")
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
            print("📊 No Gmail accounts found in database")
            
    except Exception as e:
        print(f"❌ Error checking Gmail emails: {e}")

if __name__ == "__main__":
    check_gmail_emails()
