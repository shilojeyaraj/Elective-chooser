import { createClient } from '@supabase/supabase-js'

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-key'

// Server-side environment variables (for API routes)
const supabaseServiceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Detailed configuration logging
console.log('🔧 Client-side Configuration Status:')
console.log('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ NOT SET')
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET')
console.log('  Fallback SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ SET' : '❌ NOT SET')
console.log('  Fallback SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ SET' : '❌ NOT SET')

// Check if environment variables are properly set
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ Supabase environment variables not configured for client-side.')
  console.warn('📝 Required variables for client-side:')
  console.warn('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.warn('📝 Or add the non-prefixed versions to your .env file')
} else {
  console.log('✅ Supabase client configured successfully!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// For server-side operations that need elevated permissions
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false
    }
  }
)
