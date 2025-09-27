'use client'

import { useState } from 'react'
import { CourseRecommendation } from '@/lib/types'
import { getBestWaterlooUrl } from '@/lib/waterloo-links'
import CourseDetailsModal from './CourseDetailsModal'

interface CourseRecommendationsProps {
  recommendations: CourseRecommendation[]
  sources: string[]
  usedWebSearch: boolean
}

export default function CourseRecommendations({ 
  recommendations, 
  sources, 
  usedWebSearch 
}: CourseRecommendationsProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseRecommendation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  console.log('📚 CourseRecommendations rendered with:', {
    recommendationsCount: recommendations.length,
    sourcesCount: sources.length,
    usedWebSearch,
    recommendations: recommendations
  })

  const handleViewDetails = (courseRecommendation: CourseRecommendation) => {
    setSelectedCourse(courseRecommendation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCourse(null)
  }
  
  // Create fallback recommendations if none are provided
  const fallbackRecommendations = [
    {
      course: {
        id: 'CS246',
        title: 'Object-Oriented Software Development',
        dept: 'CS',
        level: 200,
        units: 0.5,
        prereqs: 'CS 136 or CS 146',
        terms_offered: ['F', 'W', 'S'],
        workload: { reading: 2, assignments: 4, projects: 3, labs: 1 },
        skills: ['programming', 'software development', 'object-oriented design']
      },
      score: 75,
      explanation: ['Popular elective course'],
      counts_toward: [],
      prereqs_met: false,
      next_offered: ['F', 'W', 'S'],
      workload_score: 7,
      ai_mentioned: false
    },
    {
      course: {
        id: 'ECE 250',
        title: 'Algorithms and Data Structures',
        dept: 'ECE',
        level: 200,
        units: 0.5,
        prereqs: 'ECE 150 or CS 136',
        terms_offered: ['F', 'W', 'S'],
        workload: { reading: 3, assignments: 4, projects: 2, labs: 1 },
        skills: ['algorithms', 'data structures', 'programming']
      },
      score: 70,
      explanation: ['Core algorithms course'],
      counts_toward: [],
      prereqs_met: false,
      next_offered: ['F', 'W', 'S'],
      workload_score: 8,
      ai_mentioned: false
    },
    {
      course: {
        id: 'MSCI 211',
        title: 'Organizational Behaviour',
        dept: 'MSCI',
        level: 200,
        units: 0.5,
        prereqs: '',
        terms_offered: ['F', 'W', 'S'],
        workload: { reading: 2, assignments: 3, projects: 1, labs: 0 },
        skills: ['management', 'organizational behavior', 'leadership']
      },
      score: 65,
      explanation: ['Management elective'],
      counts_toward: [],
      prereqs_met: true,
      next_offered: ['F', 'W', 'S'],
      workload_score: 4,
      ai_mentioned: false
    }
  ]

  // Use fallback recommendations if none are provided
  const displayRecommendations = recommendations.length > 0 ? recommendations : fallbackRecommendations

  if (displayRecommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
        <div className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">📚</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="w-4 h-4 bg-purple-600 rounded-sm mb-2"></div>
              <p className="text-gray-900 dark:text-white">Ask me about electives to see personalized recommendations!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Course Recommendations ({displayRecommendations.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track the progress of your course selection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline"
            >
              Browse all electives →
            </a>
            {usedWebSearch && (
              <span className="text-xs bg-yellow-500/20 text-yellow-600 px-3 py-1 rounded-full border border-yellow-500/30">
                Web Search Used
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {displayRecommendations.map((rec, index) => (
            <div key={rec.course.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {rec.course.id}
                    </h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {rec.course.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {rec.course.dept} • Level {rec.course.level} • {rec.course.units} units
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {rec.score}/100
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Match Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills and Requirements */}
              <div className="mt-4 flex flex-wrap gap-2">
                {rec.course.skills?.slice(0, 3).map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {rec.course.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs">
                    +{rec.course.skills.length - 3} more
                  </span>
                )}
              </div>

              {/* Prerequisites Status */}
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.prereqs_met 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {rec.prereqs_met ? '✓ Prerequisites Met' : '✗ Prerequisites Not Met'}
                  </span>
                </div>
                
                {/* Show missing prerequisites if any */}
              {!rec.prereqs_met && rec.course.prereqs && rec.course.prereqs.trim() !== '' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Missing Prerequisites:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {rec.course.prereqs}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        You'll need to complete these courses before taking {rec.course.id}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!rec.prereqs_met && (!rec.course.prereqs || rec.course.prereqs.trim() === '') && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">?</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Prerequisites Not Available
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Prerequisite information is not available in the database for this course.
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Please check the course calendar or contact the department for prerequisite requirements.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Additional Status Indicators */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                  Workload: {rec.workload_score || 5}/10
                </span>
                {rec.next_offered.length > 0 && (
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">
                    Next: {rec.next_offered.join(', ')}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button 
                  onClick={() => handleViewDetails(rec)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </button>
              </div>

              {/* Source Link */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    // Use the Waterloo links utility to get the best URL
                    const { url, type } = getBestWaterlooUrl({
                      id: rec.course.id,
                      title: rec.course.title,
                      dept: rec.course.dept,
                      number: rec.course.number
                    })
                    
                    window.open(url, '_blank')
                  }}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline"
                >
                  View on UW Flow →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sources</h4>
            <div className="space-y-1">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 block truncate underline"
                >
                  {source}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      <CourseDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        courseRecommendation={selectedCourse}
      />
    </div>
  )
}
