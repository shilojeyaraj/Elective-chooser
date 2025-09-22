'use client'

import { useState } from 'react'
import { authenticateUser, registerUser } from '@/lib/custom-auth'

interface LoginFormProps {
  onLogin?: (user: any) => void
  isSignup?: boolean
}

export default function LoginForm({ onLogin, isSignup = false }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(!isSignup)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🚀 Starting authentication process...')
      console.log('🔍 Mode:', isLogin ? 'LOGIN' : 'REGISTRATION')
      console.log('🔍 Email:', email)
      console.log('🔍 Username:', username || 'Not provided')
      console.log('🔍 Password length:', password.length)

      const response = isLogin 
        ? await authenticateUser(email, password)
        : await registerUser(email, password, username || undefined)

      console.log('🔍 Auth response:', response)

      if (!response.success) {
        console.error('❌ Authentication failed:', response.error)
        throw new Error(response.error || (isLogin ? 'Authentication failed' : 'Registration failed'))
      }
      
      if (response.user) {
        console.log('✅ User authenticated successfully:', response.user.username)
        console.log('💾 Storing user in localStorage...')
        
        // Store user in localStorage for session persistence
        localStorage.setItem('currentUser', JSON.stringify(response.user))
        
        console.log('✅ User stored, calling onLogin callback...')
        if (onLogin) {
          onLogin(response.user)
        } else {
          // If no onLogin callback, trigger a custom event to notify parent components
          window.dispatchEvent(new CustomEvent('userAuthenticated', { detail: response.user }))
        }
      } else if (!isLogin) {
        console.log('✅ Account created successfully')
        alert('Account created successfully! You can now sign in.')
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error)
      console.error('❌ Error stack:', error.stack)
      setError(error.message)
    } finally {
      console.log('🏁 Authentication process completed')
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            {isLogin ? (
              <a
                href="/signup"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Sign up
              </a>
            ) : (
              <a
                href="/login"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Sign in
              </a>
            )}
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                placeholder="Choose a username"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Loading...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
