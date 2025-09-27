import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env')

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

# Get all specializations
response = supabase.table('specializations').select('*').execute()
if response.data:
    print(f'Total specializations: {len(response.data)}')
    print('\nAll specializations:')
    for spec in response.data:
        print(f'  - {spec.get("name", "N/A")} ({spec.get("program", "N/A")})')
else:
    print('No specializations found')
