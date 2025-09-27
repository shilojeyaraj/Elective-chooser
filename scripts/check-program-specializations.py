import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env')

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

# Check specializations for Systems Design Engineering
print("Specializations for Systems Design Engineering:")
response = supabase.table('specializations').select('*').eq('program', 'Systems Design Engineering').execute()
if response.data:
    print(f"Found {len(response.data)} specializations:")
    for spec in response.data:
        print(f"  - {spec.get('name', 'N/A')}")
else:
    print("No specializations found for Systems Design Engineering")

# Check specializations for Software Engineering
print("\nSpecializations for Software Engineering:")
response = supabase.table('specializations').select('*').eq('program', 'Software Engineering').execute()
if response.data:
    print(f"Found {len(response.data)} specializations:")
    for spec in response.data:
        print(f"  - {spec.get('name', 'N/A')}")
else:
    print("No specializations found for Software Engineering")

# Check specializations for Computer Engineering
print("\nSpecializations for Computer Engineering:")
response = supabase.table('specializations').select('*').eq('program', 'Computer Engineering').execute()
if response.data:
    print(f"Found {len(response.data)} specializations:")
    for spec in response.data:
        print(f"  - {spec.get('name', 'N/A')}")
else:
    print("No specializations found for Computer Engineering")

# Check specializations for Biomedical Engineering
print("\nSpecializations for Biomedical Engineering:")
response = supabase.table('specializations').select('*').eq('program', 'Biomedical Engineering').execute()
if response.data:
    print(f"Found {len(response.data)} specializations:")
    for spec in response.data:
        print(f"  - {spec.get('name', 'N/A')}")
else:
    print("No specializations found for Biomedical Engineering")
