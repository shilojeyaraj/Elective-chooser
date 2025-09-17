#!/usr/bin/env python3
"""
Simple script to run the data ingestion for specializations and diplomas
"""

import os
import sys
import time
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from process_specializations_diplomas import SpecializationsDiplomasProcessor

def main():
    # File paths
    specializations_file = "../data-to-ingest/waterloo_engineering_specializations_COMPLETE.json"
    diplomas_file = "../data-to-ingest/waterloo_engineering_undergrad_diplomas.json"
    
    # Check if files exist
    if not Path(specializations_file).exists():
        print(f"❌ Specializations file not found: {specializations_file}")
        return
    
    if not Path(diplomas_file).exists():
        print(f"❌ Diplomas file not found: {diplomas_file}")
        return
    
    try:
        print("🚀 Starting data ingestion for specializations and diplomas...")
        
        # Wait a moment before starting to ensure everything is ready
        print("⏳ Waiting 2 seconds before starting ingestion...")
        time.sleep(2)
        
        processor = SpecializationsDiplomasProcessor()
        
        # Process both files
        processor.process_both_files(specializations_file, diplomas_file)
        
        print("🎉 Data ingestion completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during ingestion: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
