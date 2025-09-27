#!/usr/bin/env python3
"""
Remove BME courses from all JSON data files
This script removes all BME (Biomedical Engineering) courses from the database JSON files
since they are program-specific core courses that should not be available as electives.
"""

import json
import os
import glob
from pathlib import Path

def remove_bme_courses_from_json(file_path):
    """Remove BME courses from a JSON file"""
    print(f"Processing: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        original_count = 0
        removed_count = 0
        
        if isinstance(data, dict):
            # Handle dictionary format (e.g., AllDepartments.json)
            if 'BME' in data:
                original_count = len(data['BME'])
                del data['BME']
                removed_count = original_count
                print(f"  Removed BME section with {removed_count} courses")
            
            # Also remove BME courses from other sections if they exist
            for key, value in data.items():
                if isinstance(value, list):
                    bme_courses = [course for course in value if isinstance(course, dict) and course.get('dept') == 'BME']
                    if bme_courses:
                        data[key] = [course for course in value if not (isinstance(course, dict) and course.get('dept') == 'BME')]
                        removed_count += len(bme_courses)
                        print(f"  Removed {len(bme_courses)} BME courses from {key} section")
        
        elif isinstance(data, list):
            # Handle array format (e.g., uw_courses_remaining.json)
            original_count = len(data)
            data = [course for course in data if not (isinstance(course, dict) and course.get('subject') == 'BME')]
            removed_count = original_count - len(data)
            print(f"  Removed {removed_count} BME courses from array")
        
        if removed_count > 0:
            # Create backup
            backup_path = file_path + '.backup'
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  Created backup: {backup_path}")
            
            # Write updated data
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  Updated file with {removed_count} BME courses removed")
        else:
            print(f"  No BME courses found")
        
        return removed_count
        
    except Exception as e:
        print(f"  Error processing {file_path}: {e}")
        return 0

def main():
    """Main function to remove BME courses from all JSON files"""
    print("🔍 Removing BME courses from all JSON data files...")
    
    # Find all JSON files in database directory
    database_dir = Path("database")
    json_files = list(database_dir.glob("*.json"))
    
    # Also check backend/data-to-ingest directory
    backend_dir = Path("backend/data-to-ingest")
    if backend_dir.exists():
        json_files.extend(backend_dir.glob("*.json"))
    
    total_removed = 0
    
    for json_file in json_files:
        if json_file.name.endswith('.json'):
            removed = remove_bme_courses_from_json(str(json_file))
            total_removed += removed
    
    print(f"\n✅ Total BME courses removed: {total_removed}")
    print("📁 Backup files created with .backup extension")
    print("🗑️  BME courses have been removed from all JSON data files")

if __name__ == "__main__":
    main()
