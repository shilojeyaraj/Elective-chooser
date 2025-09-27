import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env')

url: str = os.environ.get('SUPABASE_URL')
key: str = os.environ.get('SUPABASE_KEY')
supabase: Client = create_client(url, key)

print('🔍 Checking BME121 course details...')
response = supabase.table('courses').select('*').eq('id', 'BME121').single().execute()

if hasattr(response, 'error') and response.error:
    print(f'❌ Error: {response.error}')
else:
    course = response.data
    if course:
        print('📚 BME121 Course Details:')
        print(f'  ID: {course.get("id")}')
        print(f'  Title: {course.get("title")}')
        print(f'  Department: {course.get("dept")}')
        print(f'  Level: {course.get("level")}')
        print(f'  Faculty: {course.get("faculty")}')
        print(f'  Units: {course.get("units")}')
        print(f'  Terms Offered: {course.get("terms_offered")}')
        print(f'  Skills: {course.get("skills")}')
        print(f'  Fulfills Options: {course.get("fulfills_options")}')
        print(f'  Fulfills Specializations: {course.get("fulfills_specializations")}')
    else:
        print('❌ BME121 not found in database')
