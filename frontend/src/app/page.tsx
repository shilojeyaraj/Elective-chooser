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
    // Test Supabase connection instead of checking env vars directly
    const testSupabaseConnection = async () => {
      try {
        // Try to make a simple query to test the connection
        const { data, error } = await supabase
          .from('courses')
          .select('count')
          .limit(1)
        
        if (error) {
          console.warn('⚠️ Supabase connection failed:', error.message)
          setIsSupabaseConfigured(false)
        } else {
          console.log('✅ Supabase connection successful')
          setIsSupabaseConfigured(true)
        }
      } catch (error) {
        console.warn('⚠️ Supabase not configured or connection failed:', error)
        setIsSupabaseConfigured(false)
      }
    }

    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Load user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
          
          if (profileError) {
            console.error('Profile loading error:', profileError)
          } else if (profileData && profileData.length > 0) {
            setProfile(profileData[0])
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Supabase error:', error)
        setIsSupabaseConfigured(false)
        setLoading(false)
      }
    }

    // Test connection first, then get session
    testSupabaseConnection().then(() => {
      getSession()
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
            
            if (profileError) {
              console.error('Profile loading error:', profileError)
            } else if (profileData && profileData.length > 0) {
              setProfile(profileData[0])
            } else {
              setProfile(null)
            }
          } catch (error) {
            console.error('Profile loading error:', error)
            setProfile(null)
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

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Supabase Not Configured
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please set up your Supabase environment variables to use this application.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!profile) {
    return <ProfileSetup userId={user.id} onComplete={setProfile} />
  }

  return <ChatInterface profile={profile} />
}