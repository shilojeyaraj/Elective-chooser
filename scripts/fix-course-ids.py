#!/usr/bin/env python3
"""
Script to fix course IDs by removing spaces
"""

def fix_course_ids_in_file():
    """Fix all course IDs in the comprehensive mapping file"""
    
    # Read the file
    with open('comprehensive-option-mapping.py', 'r') as f:
        content = f.read()
    
    # Replace all course IDs with spaces to remove spaces
    # Pattern: 'CS 123' -> 'CS123'
    import re
    
    # Find all course IDs with spaces and replace them
    def replace_course_id(match):
        course_id = match.group(1)
        return f"'{course_id.replace(' ', '')}'"
    
    # Pattern to match course IDs in quotes with spaces
    pattern = r"'([A-Z]{2,4}\s+\d+[A-Z]*)'"
    content = re.sub(pattern, replace_course_id, content)
    
    # Write the fixed content back
    with open('comprehensive-option-mapping.py', 'w') as f:
        f.write(content)
    
    print("✅ Fixed all course IDs by removing spaces")

if __name__ == "__main__":
    fix_course_ids_in_file()
