#!/usr/bin/env python3
"""
Validate JSON and show exact error location
"""

import json

def validate_json():
    try:
        with open('full_specialization_list.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("✅ JSON is valid!")
        return True
    except json.JSONDecodeError as e:
        print(f"❌ JSON error: {e}")
        print(f"Error at line {e.lineno}, column {e.colno}")
        
        # Read the file and show the problematic area
        with open('full_specialization_list.json', 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        start_line = max(0, e.lineno - 3)
        end_line = min(len(lines), e.lineno + 3)
        
        print(f"\nProblem area around line {e.lineno}:")
        for i in range(start_line, end_line):
            marker = ">>> " if i == e.lineno - 1 else "    "
            print(f"{marker}{i+1:3d}: {lines[i].rstrip()}")
        
        return False

if __name__ == "__main__":
    validate_json()
