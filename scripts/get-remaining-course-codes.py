import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('../../.env') # Adjust path to your .env file

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def get_remaining_course_codes():
    print("🔍 Getting course codes for courses with generic titles...")
    
    try:
        # Get all courses
        response = supabase.table('courses').select('id, title, dept').execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"❌ Error fetching courses: {response.error}")
            return
        
        courses = response.data
        
        # Find courses with generic titles
        generic_courses = []
        
        for course in courses:
            course_id = course.get('id', '')
            title = course.get('title', '')
            dept = course.get('dept', '')
            
            if any(generic in title for generic in [
                'Course Title', 'No title', 'Generic', 'Placeholder', 
                'TBD', 'To be determined', 'N/A', 'None'
            ]):
                generic_courses.append((course_id, title, dept))
        
        print(f"📚 Found {len(generic_courses)} courses with generic titles")
        
        # Group by department
        dept_groups = {}
        for course_id, title, dept in generic_courses:
            if dept not in dept_groups:
                dept_groups[dept] = []
            dept_groups[dept].append(course_id)
        
        # Write to file
        with open('remaining_course_codes.txt', 'w') as f:
            f.write("REMAINING COURSE CODES WITH GENERIC TITLES\n")
            f.write("=" * 50 + "\n\n")
            
            # Print by department
            for dept in sorted(dept_groups.keys()):
                course_codes = dept_groups[dept]
                f.write(f"{dept} ({len(course_codes)} courses):\n")
                f.write(f"  {', '.join(course_codes)}\n\n")
            
            # Print all course codes in one list
            f.write(f"ALL REMAINING COURSE CODES ({len(generic_courses)}):\n")
            all_codes = [course_id for course_id, _, _ in generic_courses]
            f.write(f"  {', '.join(all_codes)}\n\n")
            
            # Print as a Python list for easy copying
            f.write("PYTHON LIST FORMAT:\n")
            f.write(f"remaining_courses = {all_codes}\n")
        
        print("✅ Results written to 'remaining_course_codes.txt'")
        
        # Also print a summary to console
        print(f"\n📋 SUMMARY BY DEPARTMENT:")
        for dept in sorted(dept_groups.keys()):
            course_codes = dept_groups[dept]
            print(f"  {dept}: {len(course_codes)} courses")
        
        print(f"\n📊 TOTAL: {len(generic_courses)} courses need title updates")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    get_remaining_course_codes()