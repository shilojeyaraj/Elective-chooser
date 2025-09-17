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
  const commonInterests = ['robotics', 'machine learning', 'AI', 'controls', 'embedded systems', 'software engineering', 'data science', 'entrepreneurship', 'research', 'industry']
  const commonGoals = ['career_robotics', 'career_software', 'grad_school', 'industry_work', 'startup', 'research', 'specialization']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
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

      console.log('🔧 Creating profile with data:', profileData)

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile creation error:', error)
        throw error
      }

      console.log('✅ Profile created successfully:', data)
      onComplete(data)
    } catch (error: any) {
      console.error('❌ Profile setup error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleArrayChange = (field: 'interests' | 'goal_tags' | 'schedule_preferences', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set up your profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Help us provide better elective recommendations
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue"
                required
              />
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Engineering Program
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue"
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
              <label className="block text-sm font-medium text-gray-700">
                Current Term
              </label>
              <select
                value={formData.current_term}
                onChange={(e) => setFormData(prev => ({ ...prev, current_term: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Interest (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {commonInterests.map(interest => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleArrayChange('interests', interest)}
                      className="rounded border-gray-300 text-waterloo-blue focus:ring-waterloo-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {interest.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Career Goals (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {commonGoals.map(goal => (
                  <label key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.goal_tags.includes(goal)}
                      onChange={() => handleArrayChange('goal_tags', goal)}
                      className="rounded border-gray-300 text-waterloo-blue focus:ring-waterloo-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {goal.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue"
              />
            </div>

            {/* GPA */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-waterloo-blue focus:border-waterloo-blue"
              />
            </div>

            {/* Workload Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
              <div className="flex justify-between text-xs text-gray-500">
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
