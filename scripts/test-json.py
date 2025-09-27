#!/usr/bin/env python3
"""
Test if the JSON file is valid
"""

import json

def test_json():
    try:
        with open('full_specialization_list.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ JSON is valid! Found {len(data.get('programs', []))} programs")
        
        # Count specializations
        total_specs = 0
        for program in data.get('programs', []):
            total_specs += len(program.get('specializations', []))
        print(f"✅ Found {total_specs} specializations total")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON is still invalid: {e}")
        print(f"Error at line {e.lineno}, column {e.colno}")
        return False

if __name__ == "__main__":
    test_json()
