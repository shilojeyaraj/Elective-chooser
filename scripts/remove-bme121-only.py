#!/usr/bin/env python3
"""
Remove only BME121 from all JSON data files
This script removes only BME121 from the database JSON files
since it's being incorrectly recommended as an elective.
"""

import json
import os
import glob
from pathlib import Path

def remove_bme121_from_json(file_path):
    """Remove BME121 from a JSON file"""
    print(f"Processing: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        original_count = 0
        removed_count = 0
        
        if isinstance(data, dict):
            # Handle dictionary format (e.g., AllDepartments.json)
            for key, value in data.items():
                if isinstance(value, list):
                    # Look for BME121 in any list
                    bme121_courses = [course for course in value if isinstance(course, dict) and course.get('id') == 'BME121']
                    if bme121_courses:
                        data[key] = [course for course in value if not (isinstance(course, dict) and course.get('id') == 'BME121')]
                        removed_count += len(bme121_courses)
                        print(f"  Removed {len(bme121_courses)} BME121 courses from {key} section")
        
        elif isinstance(data, list):
            # Handle array format (e.g., uw_courses_remaining.json)
            original_count = len(data)
            data = [course for course in data if not (isinstance(course, dict) and course.get('id') == 'BME121')]
            removed_count = original_count - len(data)
            if removed_count > 0:
                print(f"  Removed {removed_count} BME121 courses from array")
        
        if removed_count > 0:
            # Create backup
            backup_path = file_path + '.backup'
            if not os.path.exists(backup_path):
                with open(backup_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"  Created backup: {backup_path}")
            
            # Write updated data
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  ✅ Removed {removed_count} BME121 courses")
        else:
            print(f"  No BME121 courses found")
            
    except Exception as e:
        print(f"  ❌ Error processing {file_path}: {e}")

def main():
    print("🔍 Removing BME121 from all JSON data files...")
    
    # Get all JSON files in the database directory
    database_dir = Path("../database")
    json_files = list(database_dir.glob("*.json"))
    
    if not json_files:
        print("❌ No JSON files found in database directory")
        return
    
    total_removed = 0
    for json_file in json_files:
        remove_bme121_from_json(json_file)
    
    print(f"\n✅ BME121 removal complete!")
    print(f"📁 Processed {len(json_files)} JSON files")

if __name__ == "__main__":
    main()
