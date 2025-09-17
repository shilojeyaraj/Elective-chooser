'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [stylingStatus, setStylingStatus] = useState('Checking...')

  // Debug styling loading
  useEffect(() => {
    console.log('🎨 Admin Page: Checking styling status...')
    
    // Check if Tailwind CSS is loaded
    const checkTailwind = () => {
      const testElement = document.createElement('div')
      testElement.className = 'bg-red-500 text-white p-2 rounded'
      testElement.style.position = 'absolute'
      testElement.style.top = '-9999px'
      testElement.style.left = '-9999px'
      document.body.appendChild(testElement)
      
      const computedStyle = window.getComputedStyle(testElement)
      const hasRedBackground = computedStyle.backgroundColor.includes('239, 68, 68') || 
                              computedStyle.backgroundColor.includes('rgb(239, 68, 68)')
      
      document.body.removeChild(testElement)
      
      console.log('🎨 Tailwind CSS loaded:', hasRedBackground)
      console.log('🎨 Computed background color:', computedStyle.backgroundColor)
      
      return hasRedBackground
    }
    
    // Check if CSS is loaded
    const checkCSS = () => {
      const stylesheets = Array.from(document.styleSheets)
      const hasTailwind = stylesheets.some(sheet => {
        try {
          return sheet.href?.includes('tailwind') || 
                 Array.from(sheet.cssRules || []).some(rule => 
                   rule.cssText?.includes('bg-red-500') || 
                   rule.cssText?.includes('from-red-50')
                 )
        } catch (e) {
          return false
        }
      })
      
      console.log('🎨 CSS Stylesheets found:', stylesheets.length)
      console.log('🎨 Tailwind CSS detected:', hasTailwind)
      
      return hasTailwind
    }
    
    const timer = setTimeout(() => {
      const tailwindLoaded = checkTailwind()
      const cssLoaded = checkCSS()
      
      if (tailwindLoaded && cssLoaded) {
        setStylingStatus('✅ Styling loaded successfully!')
        console.log('🎨 ✅ All styling systems loaded correctly')
      } else if (cssLoaded) {
        setStylingStatus('⚠️ CSS loaded but Tailwind classes not working')
        console.log('🎨 ⚠️ CSS loaded but Tailwind classes not working')
      } else {
        setStylingStatus('❌ Styling not loaded properly')
        console.log('🎨 ❌ Styling not loaded properly')
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

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

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'upload-json')
    }
  }

  const handleCSEElectivesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'upload-cse-electives')
    }
  }

  const handleTechnicalElectivesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'upload-technical-electives')
    }
  }

  return (
    <div className="min-h-screen admin-page bg-gradient-to-br from-red-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* University of Waterloo Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">W</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">University of Waterloo</h1>
                  <p className="text-red-100">Elective Chooser - Admin Panel</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-red-100 mb-1">Styling Status:</div>
                <div className={`text-sm font-medium ${
                  stylingStatus.includes('✅') ? 'text-green-200' : 
                  stylingStatus.includes('⚠️') ? 'text-yellow-200' : 
                  'text-red-200'
                }`}>
                  {stylingStatus}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-b-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Upload Center</h2>
              <p className="text-gray-600">Upload course and program data to power the AI recommendations</p>
              
              {/* Styling Test Section */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Styling Test:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">Red</div>
                  <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Yellow</div>
                  <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Purple</div>
                  <div className="bg-indigo-500 text-white px-2 py-1 rounded text-xs">Indigo</div>
                  <div className="bg-gradient-to-r from-red-50 to-yellow-50 border border-gray-300 px-2 py-1 rounded text-xs">Gradient</div>
                </div>
              </div>
            </div>

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
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                  Upload Courses
                </h2>
                </div>
                <div className="border-2 border-dashed border-red-300 rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                      stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="courses-file" className="cursor-pointer group">
                        <span className="mt-2 block text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                          Upload Courses CSV
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
                      <p className="mt-2 text-sm text-gray-600">
                        Upload processed course data (284 courses from 11 engineering programs)
                      </p>
                      <button 
                        onClick={() => document.getElementById('courses-file')?.click()}
                        className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options Upload */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Upload Programs
                </h2>
                </div>
                <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <div className="mx-auto w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-6 h-6 text-yellow-600"
                        fill="none"
                      stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="options-file" className="cursor-pointer group">
                        <span className="mt-2 block text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                          Upload Programs CSV
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
                      <p className="mt-2 text-sm text-gray-600">
                        Upload engineering program data (11 specializations and degree programs)
                      </p>
                      <button 
                        onClick={() => document.getElementById('programs-file')?.click()}
                        className="mt-3 inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON Upload */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Upload Complete Dataset
                    </h2>
                    <p className="text-sm text-blue-600 font-medium">Recommended Method</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white">
                  <div className="text-center">
            <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="json-file" className="cursor-pointer group">
                        <span className="mt-2 block text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          Upload JSON Dataset
                        </span>
                        <input
                          id="json-file"
                          type="file"
                          accept=".json"
                          onChange={handleJsonUpload}
                          disabled={loading}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-2 text-sm text-gray-600">
                        Upload the complete Waterloo Engineering dataset (uw_engineering_core_by_program_TIDY.json)
                      </p>
                      <div className="mt-3 inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Upload Complete Dataset
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CSE Electives Upload */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Upload CSE Electives
                    </h2>
                    <p className="text-sm text-purple-600 font-medium">Computer Science Electives</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <div className="mx-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="cse-electives-file" className="cursor-pointer group">
                        <span className="mt-2 block text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          Upload CSE Electives CSV
                        </span>
                        <input
                          id="cse-electives-file"
                          type="file"
                          accept=".csv"
                          onChange={handleCSEElectivesUpload}
                          disabled={loading}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-2 text-sm text-gray-600">
                        Upload CSE elective courses (electives.csv)
                      </p>
                      <button 
                        onClick={() => document.getElementById('cse-electives-file')?.click()}
                        className="mt-3 inline-flex items-center px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Upload CSE Electives
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Electives Upload */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-100 rounded-xl p-6 border border-indigo-200">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Upload Technical Electives
                    </h2>
                    <p className="text-sm text-indigo-600 font-medium">All Engineering Technical Electives</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <div className="mx-auto w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="technical-electives-file" className="cursor-pointer group">
                        <span className="mt-2 block text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          Upload Technical Electives CSV
                        </span>
                        <input
                          id="technical-electives-file"
                          type="file"
                          accept=".csv"
                          onChange={handleTechnicalElectivesUpload}
                          disabled={loading}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-2 text-sm text-gray-600">
                        Upload technical electives with option mappings
                      </p>
                      <div className="mt-3 inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Upload Technical Electives
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Data */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Sample Data Files
                </h2>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    All data files are organized in the <code className="bg-gray-100 px-2 py-1 rounded text-red-600">data-to-ingest/</code> directory:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700"><code>processed_courses.csv</code> - 284 courses</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700"><code>processed_programs.csv</code> - 11 programs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700"><code>uw_engineering_core_by_program_TIDY.json</code> - Complete dataset</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-sm text-gray-700"><code>sample-data/</code> - Additional samples</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  University of Waterloo Elective Chooser • Powered by AI
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Engineering • Computer Science • Data Science
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
