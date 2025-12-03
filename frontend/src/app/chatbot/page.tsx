'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function ChatbotPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser)
        setUser(userData)
        
        // Check if profile exists in database
        checkProfile(userData.id || userData.user_id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  const checkProfile = async (userId: string, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`/api/profile?userId=${userId}`)
        if (response.ok) {
          const profileData = await response.json()
          if (profileData && profileData.user_id) {
            setProfile(profileData)
            return // Success, exit function
          }
        }
        
        // If not found and not the last attempt, wait before retrying
        if (attempt < retries - 1) {
          console.log(`Profile not found, retrying in ${(attempt + 1) * 500}ms... (attempt ${attempt + 1}/${retries})`)
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 500))
          continue
        }
      } catch (error) {
        console.error(`Error checking profile (attempt ${attempt + 1}/${retries}):`, error)
        // If not the last attempt, wait before retrying
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 500))
          continue
        }
      }
    }
    
    // All retries failed, redirect to profile setup
    console.log('Profile not found after all retries, redirecting to profile setup')
    router.push('/setprofile')
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile)
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

  if (!user || !profile) {
    return null // Will redirect to appropriate page
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ChatInterface 
          user={user} 
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </ThemeProvider>
  )
}
