'use client'

import Link from 'next/link'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function Home() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Elective Chooser
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Get personalized course recommendations for your engineering program.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-md transition-colors flex items-center justify-center"
            >
              <span className="mr-2">🔑</span>
              Sign In
            </Link>
            
            <Link
              href="/signup"
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-md border border-gray-300 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">📝</span>
              Create Account
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              University of Waterloo Engineering
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}