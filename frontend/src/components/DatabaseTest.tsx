'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDatabaseTest = async () => {
    setLoading(true)
    setTestResults(null)

    try {
      console.log('🔍 Starting database connection test...')
      
      // Test 1: Basic connection
      const { data: testData, error: testError } = await supabase
        .from('courses')
        .select('id, title')
        .limit(5)
      
      console.log('🔍 Basic connection test:', { testData, testError })
      
      // Test 2: Count total courses
      const { count, error: countError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
      
      console.log('🔍 Count test:', { count, countError })
      
      // Test 3: Search for "technical"
      const { data: technicalData, error: technicalError } = await supabase
        .from('courses')
        .select('id, title')
        .ilike('title', '%technical%')
        .limit(3)
      
      console.log('🔍 Technical search test:', { technicalData, technicalError })
      
      // Test 4: Search for "elective"
      const { data: electiveData, error: electiveError } = await supabase
        .from('courses')
        .select('id, title')
        .ilike('title', '%elective%')
        .limit(3)
      
      console.log('🔍 Elective search test:', { electiveData, electiveError })
      
      setTestResults({
        basicConnection: {
          success: !testError,
          error: testError?.message,
          sampleCourses: testData?.slice(0, 3) || []
        },
        totalCount: {
          success: !countError,
          error: countError?.message,
          count: count || 0
        },
        technicalSearch: {
          success: !technicalError,
          error: technicalError?.message,
          results: technicalData || []
        },
        electiveSearch: {
          success: !electiveError,
          error: electiveError?.message,
          results: electiveData || []
        }
      })
      
    } catch (error) {
      console.error('❌ Database test failed:', error)
      setTestResults({
        error: `Test failed: ${error}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Database Connection Test
        </h3>
        <button
          onClick={runDatabaseTest}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      {testResults && (
        <div className="space-y-4">
          {/* Basic Connection */}
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Basic Connection
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${testResults.basicConnection?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {testResults.basicConnection?.success ? '✅ Connected' : '❌ Failed'}
              </span>
            </div>
            {testResults.basicConnection?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {testResults.basicConnection.error}
              </p>
            )}
            {testResults.basicConnection?.sampleCourses.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Sample courses:</p>
                <ul className="list-disc list-inside ml-4">
                  {testResults.basicConnection.sampleCourses.map((course: any, index: number) => (
                    <li key={index}>{course.id}: {course.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Total Count */}
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Total Courses
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${testResults.totalCount?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {testResults.totalCount?.success ? `✅ ${testResults.totalCount.count} courses` : '❌ Failed'}
              </span>
            </div>
            {testResults.totalCount?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {testResults.totalCount.error}
              </p>
            )}
          </div>

          {/* Technical Search */}
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Search for "technical"
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${testResults.technicalSearch?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {testResults.technicalSearch?.success ? `✅ Found ${testResults.technicalSearch.results.length} courses` : '❌ Failed'}
              </span>
            </div>
            {testResults.technicalSearch?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {testResults.technicalSearch.error}
              </p>
            )}
            {testResults.technicalSearch?.results.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Results:</p>
                <ul className="list-disc list-inside ml-4">
                  {testResults.technicalSearch.results.map((course: any, index: number) => (
                    <li key={index}>{course.id}: {course.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Elective Search */}
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Search for "elective"
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${testResults.electiveSearch?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {testResults.electiveSearch?.success ? `✅ Found ${testResults.electiveSearch.results.length} courses` : '❌ Failed'}
              </span>
            </div>
            {testResults.electiveSearch?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {testResults.electiveSearch.error}
              </p>
            )}
            {testResults.electiveSearch?.results.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Results:</p>
                <ul className="list-disc list-inside ml-4">
                  {testResults.electiveSearch.results.map((course: any, index: number) => (
                    <li key={index}>{course.id}: {course.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Error Display */}
          {testResults.error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Test Error
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                {testResults.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}