#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

# Check what specializations exist for Architectural Engineering
result = supabase.table('specializations').select('*').eq('program', 'Architectural Engineering').execute()
print(f'Found {len(result.data)} specializations for Architectural Engineering:')
for spec in result.data:
    print(f'- {spec["name"]}')

# Also check what programs exist
print('\nAll programs in specializations:')
all_specs = supabase.table('specializations').select('program').execute()
programs = set(spec['program'] for spec in all_specs.data)
for program in sorted(programs):
    print(f'- {program}')
