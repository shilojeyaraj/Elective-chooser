#!/usr/bin/env python3
"""
Test the complete authentication and chat system
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

def test_complete_system():
    """Test the complete authentication and chat system"""
    
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        return False
    
    print(f"🔗 Connecting to Supabase: {supabase_url}")
    
    try:
        # Create Supabase client with service role key
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Test 1: Register a new user
        print("\n🧪 Test 1: User Registration")
        try:
            result = supabase.rpc('register_user', {
                'user_email': 'test@example.com',
                'user_password': 'testpassword123',
                'user_username': 'testuser'
            }).execute()
            
            if result.data:
                user_id = result.data
                print(f"✅ User registered successfully with ID: {user_id}")
            else:
                print("❌ Registration failed - no user ID returned")
                return False
                
        except Exception as e:
            print(f"❌ Registration failed: {e}")
            return False
        
        # Test 2: Authenticate the user
        print("\n🧪 Test 2: User Authentication")
        try:
            result = supabase.rpc('authenticate_user', {
                'user_email': 'test@example.com',
                'user_password': 'testpassword123'
            }).execute()
            
            if result.data and len(result.data) > 0:
                user_data = result.data[0]
                print(f"✅ User authenticated successfully")
                print(f"   - Email: {user_data.get('email')}")
                print(f"   - Username: {user_data.get('username')}")
                print(f"   - User ID: {user_data.get('user_id')}")
            else:
                print("❌ Authentication failed - no user data returned")
                return False
                
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            return False
        
        # Test 3: Get user profile
        print("\n🧪 Test 3: Get User Profile")
        try:
            result = supabase.rpc('get_user_profile', {
                'user_uuid': user_id
            }).execute()
            
            if result.data and len(result.data) > 0:
                profile_data = result.data[0]
                print(f"✅ Profile retrieved successfully")
                print(f"   - Program: {profile_data.get('program', 'Not set')}")
                print(f"   - Current Term: {profile_data.get('current_term', 'Not set')}")
                print(f"   - Interests: {profile_data.get('interests', [])}")
            else:
                print("❌ Profile retrieval failed - no profile data returned")
                return False
                
        except Exception as e:
            print(f"❌ Profile retrieval failed: {e}")
            return False
        
        # Test 4: Create a chat session
        print("\n🧪 Test 4: Create Chat Session")
        try:
            result = supabase.table('chat_sessions').insert({
                'user_id': user_id,
                'title': 'Test Chat Session',
                'goal_snapshot': {}
            }).execute()
            
            if result.data and len(result.data) > 0:
                session_id = result.data[0]['id']
                print(f"✅ Chat session created successfully with ID: {session_id}")
            else:
                print("❌ Chat session creation failed")
                return False
                
        except Exception as e:
            print(f"❌ Chat session creation failed: {e}")
            return False
        
        # Test 5: Add messages to chat
        print("\n🧪 Test 5: Add Chat Messages")
        try:
            messages = [
                {
                    'session_id': session_id,
                    'role': 'user',
                    'content': 'Hello, I need help with electives!',
                    'tokens': 8
                },
                {
                    'session_id': session_id,
                    'role': 'assistant',
                    'content': 'Hi! I\'d be happy to help you with elective recommendations. What program are you in?',
                    'tokens': 20
                }
            ]
            
            result = supabase.table('messages').insert(messages).execute()
            
            if result.data and len(result.data) > 0:
                print(f"✅ Messages added successfully ({len(result.data)} messages)")
            else:
                print("❌ Message creation failed")
                return False
                
        except Exception as e:
            print(f"❌ Message creation failed: {e}")
            return False
        
        # Clean up test data
        print("\n🧹 Cleaning up test data...")
        try:
            supabase.table('messages').delete().eq('session_id', session_id).execute()
            supabase.table('chat_sessions').delete().eq('id', session_id).execute()
            supabase.table('users').delete().eq('email', 'test@example.com').execute()
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")
        
        print("\n🎉 ALL TESTS PASSED! The authentication and chat system is working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing system: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Complete Authentication & Chat System")
    print("=" * 60)
    
    success = test_complete_system()
    
    if success:
        print("\n✅ System is ready for use!")
        print("\n🚀 Next steps:")
        print("   1. Start your frontend: npm run dev")
        print("   2. Open http://localhost:3000")
        print("   3. Try registering a new user")
        print("   4. Complete your profile setup")
        print("   5. Start chatting with the elective advisor!")
    else:
        print("\n❌ System needs fixes before use!")
        sys.exit(1)
