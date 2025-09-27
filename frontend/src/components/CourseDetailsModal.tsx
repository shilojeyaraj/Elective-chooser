'use client'

import { CourseRecommendation } from '@/lib/types'
import { getBestWaterlooUrl } from '@/lib/waterloo-links'

interface CourseDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  courseRecommendation: CourseRecommendation | null
}

export default function CourseDetailsModal({ 
  isOpen, 
  onClose, 
  courseRecommendation 
}: CourseDetailsModalProps) {
  if (!isOpen || !courseRecommendation) return null

  const { course, score, explanation, prereqs_met, next_offered, workload_score } = courseRecommendation

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleWaterlooLink = () => {
    const { url } = getBestWaterlooUrl({
      id: course.id,
      title: course.title,
      dept: course.dept,
      number: course.number
    })
    window.open(url, '_blank')
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.id}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                {course.title}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {course.dept} • Level {course.level} • {course.units} units
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm font-medium">
                    {score}/100 Match
                  </span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    prereqs_met 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {prereqs_met ? '✓ Prerequisites Met' : '✗ Prerequisites Not Met'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {course.description || 'No description available.'}
            </p>
          </div>

          {/* Prerequisites */}
          {course.prereqs && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Prerequisites
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {course.prereqs}
              </p>
            </div>
          )}

          {/* Skills */}
          {course.skills && course.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Skills & Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Workload */}
          {course.workload && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Workload Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {course.workload.reading || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reading (hrs)</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {course.workload.assignments || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Assignments (hrs)</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {course.workload.projects || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projects (hrs)</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {course.workload.labs || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Labs (hrs)</div>
                </div>
              </div>
            </div>
          )}

          {/* Assessments */}
          {course.assessments && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Assessment Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {course.assessments.midterm && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {course.assessments.midterm}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Midterm</div>
                  </div>
                )}
                {course.assessments.final && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {course.assessments.final}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Final</div>
                  </div>
                )}
                {course.assessments.assignments && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {course.assessments.assignments}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Assignments</div>
                  </div>
                )}
                {course.assessments.labs && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {course.assessments.labs}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Labs</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Terms Offered */}
          {course.terms_offered && course.terms_offered.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Terms Offered
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.terms_offered.map((term, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Offered */}
          {next_offered && next_offered.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Next Offered
              </h3>
              <div className="flex flex-wrap gap-2">
                {next_offered.map((term, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Why This Course */}
          {explanation && explanation.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Why This Course?
              </h3>
              <ul className="space-y-1">
                {explanation.map((reason, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-300 flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Options/Specializations */}
          {course.fulfills_options && course.fulfills_options.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Fulfills Options
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.fulfills_options.map((option, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}

          {course.fulfills_specializations && course.fulfills_specializations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Fulfills Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.fulfills_specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-center">
            <button
              onClick={handleWaterlooLink}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on UW Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
