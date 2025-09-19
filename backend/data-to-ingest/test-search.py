from supabase import create_client

# Connect to Supabase
client = create_client(
    'https://ldjhtpdidpruzeyuxdfo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkamh0cGRpZHBydXpleXV4ZGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDk5ODksImV4cCI6MjA3MzAyNTk4OX0.G9z3wtweZXO0GcT2Ov0Zt9cng6lUeqA0w9KK5YYTcN4'
)

print("🔍 Testing search queries...")

# Test 1: Search for "ai development"
try:
    result = client.table('courses').select('*').or_('title.ilike.%ai development%,description.ilike.%ai development%').limit(5).execute()
    print(f"🔍 'ai development' search: {len(result.data)} results")
    for course in result.data:
        print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
except Exception as e:
    print(f"❌ Error searching 'ai development': {e}")

# Test 2: Search for "ai"
try:
    result = client.table('courses').select('*').or_('title.ilike.%ai%,description.ilike.%ai%').limit(5).execute()
    print(f"🔍 'ai' search: {len(result.data)} results")
    for course in result.data:
        print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
except Exception as e:
    print(f"❌ Error searching 'ai': {e}")

# Test 3: Search for "artificial intelligence"
try:
    result = client.table('courses').select('*').or_('title.ilike.%artificial intelligence%,description.ilike.%artificial intelligence%').limit(5).execute()
    print(f"🔍 'artificial intelligence' search: {len(result.data)} results")
    for course in result.data:
        print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
except Exception as e:
    print(f"❌ Error searching 'artificial intelligence': {e}")

# Test 4: Search for "machine learning"
try:
    result = client.table('courses').select('*').or_('title.ilike.%machine learning%,description.ilike.%machine learning%').limit(5).execute()
    print(f"🔍 'machine learning' search: {len(result.data)} results")
    for course in result.data:
        print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
except Exception as e:
    print(f"❌ Error searching 'machine learning': {e}")

# Test 5: Search for "robotics"
try:
    result = client.table('courses').select('*').or_('title.ilike.%robotics%,description.ilike.%robotics%').limit(5).execute()
    print(f"🔍 'robotics' search: {len(result.data)} results")
    for course in result.data:
        print(f"  - {course.get('id', 'N/A')}: {course.get('title', 'N/A')}")
except Exception as e:
    print(f"❌ Error searching 'robotics': {e}")
