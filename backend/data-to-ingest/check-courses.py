from supabase import create_client

# Connect to Supabase
client = create_client(
    'https://ldjhtpdidpruzeyuxdfo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkamh0cGRpZHBydXpleXV4ZGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDk5ODksImV4cCI6MjA3MzAyNTk4OX0.G9z3wtweZXO0GcT2Ov0Zt9cng6lUeqA0w9KK5YYTcN4'
)

print("🔍 Checking courses table...")

# Get total count
try:
    result = client.table('courses').select('*', count='exact').execute()
    print(f"📊 Total courses in database: {result.count}")
except Exception as e:
    print(f"❌ Error getting count: {e}")

# Get sample courses
try:
    result = client.table('courses').select('id, title, dept').limit(10).execute()
    print(f"📚 Sample courses:")
    for course in result.data:
        print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')} ({course.get('dept', 'N/A')})")
except Exception as e:
    print(f"❌ Error getting sample courses: {e}")

# Test search for AI courses
try:
    result = client.table('courses').select('id, title').ilike('title', '%ai%').limit(5).execute()
    print(f"🤖 AI-related courses: {len(result.data)}")
    for course in result.data:
        print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
except Exception as e:
    print(f"❌ Error searching AI courses: {e}")
