import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env')

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

# Check CS246 details
print("Checking CS246...")
response = supabase.table('courses').select('*').eq('id', 'CS246').execute()
if response.data:
    course = response.data[0]
    print('CS246 Details:')
    print(f'  Title: {course.get("title", "N/A")}')
    print(f'  Description: {course.get("description", "N/A")[:200]}...')
    print(f'  Prerequisites: {course.get("prereqs", "N/A")}')
    print(f'  Restrictions: {course.get("restrictions", "N/A")}')
    print(f'  Notes: {course.get("notes", "N/A")}')
else:
    print('CS246 not found in database')

# Check ECE250 details
print("\nChecking ECE250...")
response = supabase.table('courses').select('*').eq('id', 'ECE250').execute()
if response.data:
    course = response.data[0]
    print('ECE250 Details:')
    print(f'  Title: {course.get("title", "N/A")}')
    print(f'  Description: {course.get("description", "N/A")[:200]}...')
    print(f'  Prerequisites: {course.get("prereqs", "N/A")}')
    print(f'  Restrictions: {course.get("restrictions", "N/A")}')
    print(f'  Notes: {course.get("notes", "N/A")}')
else:
    print('ECE250 not found in database')
