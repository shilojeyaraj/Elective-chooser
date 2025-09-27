#!/usr/bin/env python3
import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

# Check what course requirements data we have for specializations
result = supabase.table('specializations').select('name, program, course_requirements').eq('program', 'Architectural Engineering').limit(2).execute()
print('Sample specialization data:')
for spec in result.data:
    print(f'\n{spec["name"]}:')
    print(f'  Course Requirements: {json.dumps(spec["course_requirements"], indent=2)}')

# Also check for Software Engineering specializations
print('\n\nSoftware Engineering specializations:')
se_result = supabase.table('specializations').select('name, program, course_requirements').eq('program', 'Software Engineering').limit(2).execute()
for spec in se_result.data:
    print(f'\n{spec["name"]}:')
    print(f'  Course Requirements: {json.dumps(spec["course_requirements"], indent=2)}')
