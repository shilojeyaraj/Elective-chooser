import os
from supabase import create_client

# Set up Supabase client
os.environ['SUPABASE_URL'] = 'https://qjqjqjqjqjqjqjqj.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDU5NzQwMCwiZXhwIjoyMDUwMTczNDAwfQ.placeholder'

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])

print("🔍 Checking CSE Electives table...")
try:
    result = supabase.table('cse_electives').select('*').limit(5).execute()
    print(f"📊 CSE Electives count: {len(result.data) if result.data else 0}")
    if result.data:
        print("📚 Sample CSE courses:")
        for course in result.data[:3]:
            course_code = course.get('course_code', 'N/A')
            course_title = course.get('course_title', 'N/A')
            print(f"  - {course_code}: {course_title}")
    else:
        print("❌ No CSE electives found")
except Exception as e:
    print(f"❌ Error checking CSE electives: {e}")

print("\n🔍 Checking courses table for CSE-related courses...")
try:
    result = supabase.table('courses').select('*').ilike('title', '%CSE%').limit(5).execute()
    print(f"📊 Courses with 'CSE' in title: {len(result.data) if result.data else 0}")
    if result.data:
        for course in result.data[:3]:
            print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
except Exception as e:
    print(f"❌ Error checking courses: {e}")
