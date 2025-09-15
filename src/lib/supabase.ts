import { createClient } from '@supabase/supabase-js'

// Check environment variables with detailed logging
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Detailed configuration logging
console.log('🔧 Configuration Status:')
console.log('  SUPABASE_URL:', supabaseUrl === 'https://placeholder.supabase.co' ? '❌ NOT SET' : '✅ SET')
console.log('  SUPABASE_KEY:', supabaseAnonKey === 'placeholder-key' ? '❌ NOT SET' : '✅ SET')
console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey === 'placeholder-service-key' ? '❌ NOT SET' : '✅ SET')

// Check if environment variables are properly set
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ Supabase environment variables not configured. Please check your .env file.')
  console.warn('📝 Required variables:')
  console.warn('   SUPABASE_URL=your_supabase_url')
  console.warn('   SUPABASE_KEY=your_supabase_anon_key')
} else {
  console.log('✅ Supabase configured successfully!')
  if (supabaseServiceKey === 'placeholder-service-key') {
    console.log('ℹ️  Service role key not set - some admin features may be limited')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that need elevated permissions
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
)
