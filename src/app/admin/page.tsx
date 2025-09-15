'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileUpload = async (file: File, endpoint: string) => {
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCoursesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'upload-courses')
    }
  }

  const handleOptionsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'upload-options')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Admin - Data Upload
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-8">
              {/* Courses Upload */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Upload Courses
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="courses-file" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload courses CSV file
                        </span>
                        <input
                          id="courses-file"
                          type="file"
                          accept=".csv"
                          onChange={handleCoursesUpload}
                          disabled={loading}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        CSV format with columns: id, title, dept, units, level, description, terms_offered, prereqs, skills, workload, assessments, source_url
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options Upload */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Upload Options
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="options-file" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload options CSV file
                        </span>
                        <input
                          id="options-file"
                          type="file"
                          accept=".csv"
                          onChange={handleOptionsUpload}
                          disabled={loading}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        CSV format with columns: id, name, program, faculty, required_courses, selective_rules, description, source_url
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Data */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Sample Data
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Use the sample CSV files in the <code>sample-data/</code> directory to get started:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <code>courses.csv</code> - Sample course data</li>
                    <li>• <code>options.csv</code> - Sample option/specialization data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
