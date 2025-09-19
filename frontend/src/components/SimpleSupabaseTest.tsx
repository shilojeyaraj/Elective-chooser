'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function SimpleSupabaseTest() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testDirectConnection = async () => {
    setLoading(true)
    setResult('Testing direct Supabase connection...')
    
    try {
      console.log('🔍 Creating direct Supabase client...')
      
      // Create a fresh Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('🔍 URL:', supabaseUrl)
      console.log('🔍 Key exists:', !!supabaseKey)
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing environment variables')
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      console.log('🔍 Testing simple query...')
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      console.log('🔍 Direct query result:', { data, error })
      
      if (error) {
        setResult(`❌ Direct connection failed: ${error.message}`)
      } else {
        setResult('✅ Direct connection successful!')
      }
    } catch (err: any) {
      console.error('❌ Direct connection error:', err)
      setResult(`❌ Direct connection error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-4">
      <h3 className="text-lg font-bold mb-2 text-gray-800">Direct Supabase Test</h3>
      <button 
        onClick={testDirectConnection}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 hover:bg-green-700 transition-colors"
      >
        {loading ? 'Testing...' : 'Test Direct Connection'}
      </button>
      <div className="mt-2 text-sm">{result}</div>
    </div>
  )
}
