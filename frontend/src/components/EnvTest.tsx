'use client'

import { useState } from 'react'

export default function EnvTest() {
  const [result, setResult] = useState('')

  const testEnv = () => {
    console.log('🔍 Testing environment variables...')
    
    const envVars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'SUPABASE_URL': process.env.SUPABASE_URL,
      'SUPABASE_KEY': process.env.SUPABASE_KEY,
    }
    
    console.log('🔍 Environment variables:', envVars)
    
    let status = 'Environment Variables:\n\n'
    Object.entries(envVars).forEach(([key, value]) => {
      status += `${key}: ${value ? '✅ SET' : '❌ NOT SET'}\n`
    })
    
    setResult(status)
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-4">
      <h3 className="text-lg font-bold mb-2 text-gray-800">Environment Variables Test</h3>
      <button 
        onClick={testEnv}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Test Environment Variables
      </button>
      <div className="mt-2 text-sm font-mono whitespace-pre-line">{result}</div>
    </div>
  )
}
