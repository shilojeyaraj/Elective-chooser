'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/lib/types'
import LoginForm from '@/components/LoginForm'
import ProfileSetup from '@/components/ProfileSetup'
import ChatInterface from '@/components/ChatInterface'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function SignupPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSignup, setIsSignup] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        
        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (profileError) {
          console.log('ℹ️ No existing profile found - user needs to set up profile')
          setProfile(null) // Explicitly set to null for new users
        } else if (profileData) {
          console.log('✅ Profile loaded successfully:', profileData.username)
          setProfile(profileData)
        }
      }
      setLoading(false)
    }

    checkSession()

    // Listen for custom authentication events
    const handleUserAuthenticated = (event: CustomEvent) => {
      console.log('🔔 Custom auth event received:', event.detail)
      setUser(event.detail)
      setProfile(null) // New user, no profile yet
      setLoading(false)
    }

    window.addEventListener('userAuthenticated', handleUserAuthenticated as EventListener)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          console.log('✅ User signed in:', session.user.email)
          
          // Load user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          if (profileError) {
            console.log('ℹ️ No existing profile found - user needs to set up profile')
            setProfile(null) // Explicitly set to null for new users
          } else if (profileData) {
            console.log('✅ Profile loaded successfully:', profileData.username)
            setProfile(profileData)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setIsSignup(true) // Reset to signup mode
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('userAuthenticated', handleUserAuthenticated as EventListener)
    }
  }, [])

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // If user is logged in and has profile, show chatbot
  if (user && profile) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <ChatInterface 
            user={user} 
            profile={profile}
            onProfileUpdate={setProfile}
          />
        </div>
      </ThemeProvider>
    )
  }

  // If user is logged in but no profile, show profile setup
  if (user && !profile) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <ProfileSetup 
            userId={user.id} 
            onComplete={(newProfile) => {
              setProfile(newProfile)
              console.log('✅ Profile setup completed:', newProfile)
            }} 
          />
        </div>
      </ThemeProvider>
    )
  }

  // Show signup form
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign up to get started with course recommendations.
            </p>
          </div>
          <LoginForm isSignup={true} />
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
