'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProfileSetup from '@/components/ProfileSetup'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function SetProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  const handleProfileComplete = async (profile: any) => {
    console.log('✅ Profile setup completed, redirecting to chatbot')
    // Add a small delay to ensure database propagation
    await new Promise(resolve => setTimeout(resolve, 500))
    // Use window.location for full page reload to ensure profile is found
    window.location.href = '/chatbot'
  }

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ProfileSetup 
          userId={user.id || user.user_id} 
          onComplete={handleProfileComplete}
        />
      </div>
    </ThemeProvider>
  )
}
