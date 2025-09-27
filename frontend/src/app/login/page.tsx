'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [hasExistingUser, setHasExistingUser] = useState(false)
  const [existingUser, setExistingUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setExistingUser(userData)
        setHasExistingUser(true)
      } catch (error) {
        console.error('❌ Error parsing stored user:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: any) => {
    console.log('✅ Login successful, redirecting to chatbot')
    router.push('/chatbot')
  }

  const handleContinueWithExisting = () => {
    console.log('✅ Continuing with existing account')
    router.push('/chatbot')
  }

  const handleSignOutAndLogin = () => {
    console.log('✅ Signing out to login with different account')
    localStorage.removeItem('currentUser')
    setHasExistingUser(false)
    setExistingUser(null)
  }

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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {hasExistingUser ? (
            <>
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Welcome back!
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  You're already signed in as <strong>{existingUser?.username || existingUser?.email}</strong>
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleContinueWithExisting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Continue to Chatbot
                </button>
                
                <button
                  onClick={handleSignOutAndLogin}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign out and login with different account
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <a 
                    href="/signup" 
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up here
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Welcome back! Please sign in to continue.
                </p>
              </div>
              
              <LoginForm 
                onLogin={handleLogin}
              />
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <a 
                    href="/signup" 
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up here
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}