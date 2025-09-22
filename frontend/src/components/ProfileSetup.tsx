'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/lib/types'

interface ProfileSetupProps {
  userId: string
  onComplete: (profile: UserProfile) => void
}

export default function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    username: '',
    program: '',
    current_term: '',
    interests: [] as string[],
    goal_tags: [] as string[],
    additional_comments: '',
    gpa: '',
    constraints: {
      max_workload: 4,
      morning_labs: false,
      schedule_preferences: [] as string[]
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const programs = [
    { value: 'ARCH', label: 'Architecture' },
    { value: 'AE', label: 'Architectural Engineering' },
    { value: 'BME', label: 'Biomedical Engineering' },
    { value: 'CHE', label: 'Chemical Engineering' },
    { value: 'CIVE', label: 'Civil Engineering' },
    { value: 'ECE', label: 'Computer Engineering' },
    { value: 'EE', label: 'Electrical Engineering' },
    { value: 'ENVE', label: 'Environmental Engineering' },
    { value: 'GEOE', label: 'Geological Engineering' },
    { value: 'MGT', label: 'Management Engineering' },
    { value: 'ME', label: 'Mechanical Engineering' },
    { value: 'MTE', label: 'Mechatronics Engineering' },
    { value: 'NANO', label: 'Nanotechnology Engineering' },
    { value: 'SE', label: 'Software Engineering' },
    { value: 'SYDE', label: 'Systems Design Engineering' }
  ]
  const terms = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B']
  const commonInterests = [
    // Software & Computing
    'software engineering', 'programming', 'web development', 'mobile apps', 'data science', 'machine learning', 'AI', 'cybersecurity', 'cloud computing',
    // Hardware & Electronics
    'embedded systems', 'microcontrollers', 'digital circuits', 'analog circuits', 'signal processing', 'communications', 'networking',
    // Robotics & Control
    'robotics', 'autonomous systems', 'control systems', 'mechatronics', 'automation', 'sensors', 'actuators',
    // Mechanical & Design
    'mechanical design', 'CAD modeling', 'manufacturing', 'materials science', 'thermodynamics', 'fluid mechanics', 'structural analysis',
    // Biomedical & Life Sciences
    'biomedical engineering', 'medical devices', 'biomechanics', 'biotechnology', 'pharmaceuticals', 'healthcare technology', 'bioinformatics',
    // Environmental & Sustainability
    'environmental engineering', 'sustainability', 'renewable energy', 'climate change', 'water treatment', 'waste management', 'green technology',
    // Civil & Infrastructure
    'civil engineering', 'structural engineering', 'transportation', 'urban planning', 'construction', 'geotechnical engineering', 'infrastructure',
    // Chemical & Process
    'chemical engineering', 'process design', 'petroleum engineering', 'polymer science', 'nanotechnology', 'materials processing',
    // Business & Management
    'entrepreneurship', 'project management', 'business development', 'consulting', 'finance', 'marketing', 'leadership',
    // Research & Academia
    'research', 'academia', 'graduate school', 'PhD programs', 'scientific research', 'innovation', 'patents',
    // Industry & Career
    'industry work', 'consulting', 'startup', 'corporate career', 'government work', 'non-profit', 'international work'
  ]
  
  const commonGoals = [
    'career_software', 'career_hardware', 'career_robotics', 'career_biomedical', 'career_environmental', 'career_civil', 'career_chemical',
    'career_mechanical', 'career_electrical', 'career_management', 'career_consulting', 'career_research', 'career_entrepreneurship',
    'grad_school', 'masters_degree', 'phd_program', 'industry_work', 'startup_founder', 'research_scientist', 'academic_career',
    'specialization', 'professional_development', 'leadership_role', 'international_work', 'government_work', 'non_profit_work'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First, create a dummy user in the users table to satisfy foreign key constraint
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: `user-${userId}@example.com`, // Dummy email
          password_hash: 'dummy',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (userError) {
        console.warn('⚠️ User creation warning (might already exist):', userError)
      }

      const profileData = {
        user_id: userId,
        username: formData.username,
        program: formData.program,
        current_term: formData.current_term,
        interests: formData.interests,
        goal_tags: formData.goal_tags,
        additional_comments: formData.additional_comments,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        constraints: formData.constraints
      }

      console.log('🔧 Creating/updating profile with data:', profileData)

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      let data, error

      if (existingProfile) {
        // Update existing profile
        console.log('📝 Updating existing profile')
        const result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', userId)
          .select()
          .single()
        data = result.data
        error = result.error
      } else {
        // Create new profile
        console.log('➕ Creating new profile')
        const result = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('❌ Profile creation/update error:', error)
        console.error('❌ Full error details:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('✅ Profile created/updated successfully:', data)
      onComplete(data)
    } catch (error: any) {
      console.error('❌ Profile setup error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleArrayChange = (field: 'interests' | 'goal_tags', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSchedulePreferenceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        schedule_preferences: prev.constraints.schedule_preferences.includes(value)
          ? prev.constraints.schedule_preferences.filter((item: string) => item !== value)
          : [...prev.constraints.schedule_preferences, value]
      }
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Set up your profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Help us provide better elective recommendations
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Engineering Program
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue text-gray-900 dark:text-white"
                required
              >
                <option value="">Select your program</option>
                {programs.map(program => (
                  <option key={program.value} value={program.value}>{program.label}</option>
                ))}
              </select>
            </div>

            {/* Current Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Term
              </label>
              <select
                value={formData.current_term}
                onChange={(e) => setFormData(prev => ({ ...prev, current_term: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue text-gray-900 dark:text-white"
                required
              >
                <option value="">Select your current term</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Areas of Interest (select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                {commonInterests.map(interest => (
                  <label key={interest} className="flex items-center hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleArrayChange('interests', interest)}
                      className="rounded border-gray-300 text-waterloo-blue focus:ring-waterloo-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {interest.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Scroll to see all options. Select multiple interests that align with your career goals.
              </p>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Career Goals (select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {commonGoals.map(goal => (
                  <label key={goal} className="flex items-center hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.goal_tags.includes(goal)}
                      onChange={() => handleArrayChange('goal_tags', goal)}
                      className="rounded border-gray-300 text-waterloo-blue focus:ring-waterloo-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {goal.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select your career aspirations and educational goals.
              </p>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Any other comments or things we should know?
              </label>
              <textarea
                placeholder="Tell us about your academic background, specific interests, or any other information that might help with elective recommendations..."
                value={formData.additional_comments}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  additional_comments: e.target.value
                }))}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* GPA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                GPA (optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="e.g., 3.5"
                value={formData.gpa}
                onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Workload Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred Workload (1-5, where 5 is very heavy)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.constraints.max_workload}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  constraints: { ...prev.constraints, max_workload: parseInt(e.target.value) }
                }))}
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Light (1)</span>
                <span>Heavy (5)</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-waterloo-blue hover:bg-waterloo-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-waterloo-blue disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
