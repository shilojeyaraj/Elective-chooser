'use client'

import { useState, useEffect } from 'react'
import { UserProfile } from '@/lib/types'
import LoginForm from '@/components/LoginForm'
import ProfileSetup from '@/components/ProfileSetup'
import ChatInterface from '@/components/ChatInterface'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setProfile(userData) // The custom auth returns the full profile as the user object
        console.log('✅ User loaded from localStorage:', userData.username)
      } catch (error) {
        console.error('❌ Error parsing stored user:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
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
  if (user && profile && Object.keys(profile).length > 0) {
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

  // If user is logged in and profile is being created (temporary empty object)
  if (user && profile && Object.keys(profile).length === 0) {
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

  // If user is logged in but no profile, show profile not found message
  if (user && !profile) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                Profile Not Found
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We couldn't find your profile in the database. This might be because:
              </p>
              <ul className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-left space-y-1">
                <li>• You're a new user and need to create a profile</li>
                <li>• There was an issue with your account setup</li>
                <li>• Your profile was created in a different system</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  // Set profile to a temporary value to trigger ProfileSetup
                  setProfile({} as any)
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-md transition-colors"
              >
                Create New Profile
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('currentUser')
                  window.location.href = '/login'
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                User ID: {user.id}
              </p>
            </div>
            
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Show login form
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Welcome back! Sign in to continue to the chatbot.
            </p>
          </div>
          <LoginForm onLogin={(userData) => {
            setUser(userData)
            setProfile(userData) // Custom auth returns full profile as user object
          }} />
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a 
                href="/signup" 
                className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
