#!/usr/bin/env python3
"""
Fix the vector search function in Supabase
"""

import os
from supabase import create_client, Client

def main():
    # Load environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not supabase_key:
        print('❌ Missing Supabase credentials')
        return

    supabase: Client = create_client(supabase_url, supabase_key)

    # Drop and recreate the function with correct types
    function_sql = '''
    DROP FUNCTION IF EXISTS search_elective_docs(VECTOR, FLOAT, INT);
    
    CREATE OR REPLACE FUNCTION search_elective_docs(
      query_embedding VECTOR(1536),
      match_threshold FLOAT DEFAULT 0.5,
      match_count INT DEFAULT 10
    )
    RETURNS TABLE (
      id UUID,
      course_id TEXT,
      option_id TEXT,
      text TEXT,
      source_url TEXT,
      similarity FLOAT
    )
    LANGUAGE SQL STABLE
    AS $$
      SELECT
        elective_docs.id,
        elective_docs.course_id,
        elective_docs.option_id,
        elective_docs.text,
        elective_docs.source_url,
        1 - (elective_docs.embedding <=> query_embedding) AS similarity
      FROM elective_docs
      WHERE 1 - (elective_docs.embedding <=> query_embedding) > match_threshold
      ORDER BY elective_docs.embedding <=> query_embedding
      LIMIT match_count;
    $$;
    '''

    try:
        print('🔧 Fixing vector search function...')
        result = supabase.rpc('exec_sql', {'sql': function_sql}).execute()
        print('✅ Function updated successfully')
        
        # Test the function
        print('🧪 Testing function...')
        test_result = supabase.rpc('search_elective_docs', {
            'query_embedding': [0.1] * 1536,  # Dummy embedding
            'match_threshold': 0.5,
            'match_count': 5
        }).execute()
        print('✅ Function test passed')
        print(f'Result: {test_result.data}')
        
    except Exception as e:
        print(f'❌ Error: {e}')
        
        # Try alternative approach - check if function exists
        try:
            print('🔍 Checking if function exists...')
            check_result = supabase.rpc('search_elective_docs', {
                'query_embedding': [0.1] * 1536,
                'match_threshold': 0.5,
                'match_count': 1
            }).execute()
            print('✅ Function exists and works')
        except Exception as e2:
            print(f'❌ Function does not exist or has issues: {e2}')

if __name__ == '__main__':
    main()
