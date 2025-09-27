import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env') # Adjust path to your .env file

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def check_courses_without_titles():
    print("🔍 Checking courses without proper titles...")
    
    try:
        # Get all courses
        response = supabase.table('courses').select('id, title, dept').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data
        print(f"📚 Total courses in database: {len(courses)}")
        
        # Check for courses without titles or with generic titles
        no_title = []
        generic_title = []
        proper_title = []
        
        for course in courses:
            course_id = course.get('id', '')
            title = course.get('title', '')
            dept = course.get('dept', '')
            
            if not title or title.strip() == '':
                no_title.append((course_id, dept))
            elif any(generic in title for generic in [
                'Course Title', 'No title', 'Generic', 'Placeholder', 
                'TBD', 'To be determined', 'N/A', 'None'
            ]):
                generic_title.append((course_id, title, dept))
            else:
                proper_title.append((course_id, title, dept))
        
        print(f"\n📊 TITLE ANALYSIS:")
        print(f"✅ Courses with proper titles: {len(proper_title)}")
        print(f"⚠️  Courses with generic/placeholder titles: {len(generic_title)}")
        print(f"❌ Courses with no title: {len(no_title)}")
        print(f"📈 Title completion rate: {len(proper_title) / len(courses) * 100:.1f}%")
        
        if no_title:
            print(f"\n❌ COURSES WITH NO TITLE ({len(no_title)}):")
            for course_id, dept in no_title[:20]:  # Show first 20
                print(f"  {course_id} ({dept})")
            if len(no_title) > 20:
                print(f"  ... and {len(no_title) - 20} more")
        
        if generic_title:
            print(f"\n⚠️  COURSES WITH GENERIC TITLES ({len(generic_title)}):")
            for course_id, title, dept in generic_title[:20]:  # Show first 20
                print(f"  {course_id} ({dept}): '{title}'")
            if len(generic_title) > 20:
                print(f"  ... and {len(generic_title) - 20} more")
        
        # Department breakdown
        print(f"\n📊 DEPARTMENT BREAKDOWN:")
        dept_stats = {}
        for course in courses:
            dept = course.get('dept', 'Unknown')
            title = course.get('title', '')
            
            if dept not in dept_stats:
                dept_stats[dept] = {'total': 0, 'proper': 0, 'generic': 0, 'none': 0}
            
            dept_stats[dept]['total'] += 1
            
            if not title or title.strip() == '':
                dept_stats[dept]['none'] += 1
            elif any(generic in title for generic in [
                'Course Title', 'No title', 'Generic', 'Placeholder', 
                'TBD', 'To be determined', 'N/A', 'None'
            ]):
                dept_stats[dept]['generic'] += 1
            else:
                dept_stats[dept]['proper'] += 1
        
        # Sort departments by total courses
        sorted_depts = sorted(dept_stats.items(), key=lambda x: x[1]['total'], reverse=True)
        
        for dept, stats in sorted_depts:
            completion_rate = stats['proper'] / stats['total'] * 100 if stats['total'] > 0 else 0
            print(f"  {dept}: {stats['proper']}/{stats['total']} proper titles ({completion_rate:.1f}%)")
            if stats['generic'] > 0 or stats['none'] > 0:
                print(f"    - Generic: {stats['generic']}, None: {stats['none']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_courses_without_titles()
