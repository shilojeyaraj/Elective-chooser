import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Keep-alive endpoint to prevent Supabase from pausing due to inactivity
 * This endpoint performs a lightweight database query to keep the connection active
 * Should be called once per day via cron job (Supabase pauses after 7 days of inactivity)
 */
export async function GET(request: NextRequest) {
  try {
    // Perform a lightweight query to keep Supabase active
    // Using a simple count query that's fast and doesn't consume resources
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      console.error('⚠️ Keep-alive query error:', error)
      // Still return success to avoid cron job failures
      return NextResponse.json({ 
        status: 'warning',
        message: 'Query completed with warning',
        timestamp: new Date().toISOString()
      })
    }

    console.log('✅ Supabase keep-alive ping successful')
    return NextResponse.json({ 
      status: 'success',
      message: 'Supabase connection active',
      timestamp: new Date().toISOString(),
      profileCount: count || 0
    })

  } catch (error: any) {
    console.error('❌ Keep-alive error:', error)
    // Return success anyway to prevent cron failures
    return NextResponse.json({ 
      status: 'error',
      message: error.message || 'Keep-alive completed',
      timestamp: new Date().toISOString()
    }, { status: 200 }) // Return 200 to keep cron happy
  }
}

