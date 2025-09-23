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
    'industry work', 'startup', 'corporate career', 'government work', 'non-profit', 'international work'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Set up your profile
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Help us provide better elective recommendations tailored to your interests and career goals
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-gray-50 dark:bg-gray-700 transition-colors"
                  required
                />
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Engineering Program
                </label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 transition-colors"
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Current Term
                </label>
                <select
                  value={formData.current_term}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_term: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 transition-colors"
                  required
                >
                  <option value="">Select your current term</option>
                  {terms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Areas of Interest
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select all that apply to help us recommend relevant electives
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {commonInterests.map(interest => (
                    <label key={interest} className="flex items-center hover:bg-white dark:hover:bg-gray-600 p-3 rounded-lg cursor-pointer transition-colors group">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleArrayChange('interests', interest)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {interest.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Career Goals
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select your career aspirations and educational goals
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {commonGoals.map(goal => (
                    <label key={goal} className="flex items-center hover:bg-white dark:hover:bg-gray-600 p-3 rounded-lg cursor-pointer transition-colors group">
                      <input
                        type="checkbox"
                        checked={formData.goal_tags.includes(goal)}
                        onChange={() => handleArrayChange('goal_tags', goal)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {goal.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Additional Comments
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Tell us anything else that might help with your elective recommendations
              </p>
              <textarea
                placeholder="Share your academic background, specific interests, or any other information..."
                value={formData.additional_comments}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  additional_comments: e.target.value
                }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-gray-50 dark:bg-gray-700 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GPA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-gray-50 dark:bg-gray-700 transition-colors"
                />
              </div>

              {/* Workload Preference */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Workload
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.constraints.max_workload}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      constraints: { ...prev.constraints, max_workload: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>Light (1)</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{formData.constraints.max_workload}</span>
                    <span>Heavy (5)</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Setting up your profile...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
