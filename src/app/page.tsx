'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { demoProfile } from '@/lib/demo-data'
import ChatInterface from '@/components/ChatInterface'
import LoginForm from '@/components/LoginForm'
import ProfileSetup from '@/components/ProfileSetup'
import { UserProfile } from '@/lib/types'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔧 Client-side Configuration Check:')
    console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ SET' : '❌ NOT SET')
    console.log('  SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ SET' : '❌ NOT SET')
    console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ NOT SET')
    
    if (!supabaseUrl || !supabaseAnonKey ||
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseAnonKey === 'placeholder-key') {
      console.warn('⚠️ Supabase not configured - please add required keys')
      setIsSupabaseConfigured(false)
      setLoading(false)
      return
    }

    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Load user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          setProfile(profileData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Supabase error:', error)
        setIsSupabaseConfigured(false)
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single()
            
            setProfile(profileData)
          } catch (error) {
            console.error('Profile loading error:', error)
          }
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-waterloo-blue"></div>
      </div>
    )
  }

  // Show demo mode if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-chat-darker">
        <header className="bg-chat-dark border-b border-chat-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-chat-dark font-bold text-sm">UI</span>
                </div>
                <h1 className="text-xl font-bold text-white">
                  Waterloo Elective Chooser
                </h1>
                <span className="ml-4 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                  DEMO MODE
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">
                  Supabase Configuration Required
                </h3>
                <div className="mt-2 text-sm text-red-300">
                  <p>To run the application, you need to complete the setup:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Set up your Supabase database using <code className="bg-red-500/20 px-1 rounded text-red-200">supabase-schema.sql</code></li>
                    <li>Upload your course data via the admin interface</li>
                    <li>Restart the development server</li>
                  </ol>
                  <p className="mt-2">See <code className="bg-red-500/20 px-1 rounded text-red-200">SETUP_GUIDE.md</code> for detailed instructions.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!profile) {
    return <ProfileSetup userId={user.id} onComplete={setProfile} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-waterloo-blue">
                Waterloo Elective Chooser
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile.program} {profile.current_term}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChatInterface profile={profile} />
      </main>
    </div>
  )
}
