import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env')

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

# Check what's in the specializations table
print("Checking specializations table...")
response = supabase.table('specializations').select('*').limit(10).execute()
if response.data:
    print(f"Found {len(response.data)} specializations:")
    for spec in response.data:
        print(f"  - {spec.get('name', 'N/A')} ({spec.get('program', 'N/A')})")
else:
    print("No specializations found in database")

# Check total count
response = supabase.table('specializations').select('*', count='exact').execute()
print(f"\nTotal specializations in database: {response.count}")

# Check if there are any specializations for Systems Design Engineering
print("\nChecking specializations for Systems Design Engineering...")
response = supabase.table('specializations').select('*').eq('program', 'Systems Design Engineering').execute()
if response.data:
    print(f"Found {len(response.data)} specializations for SYDE:")
    for spec in response.data:
        print(f"  - {spec.get('name', 'N/A')}")
else:
    print("No specializations found for Systems Design Engineering")
