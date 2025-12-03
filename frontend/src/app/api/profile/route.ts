import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🔍 Fetching profile for user:', userId)

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('❌ Error fetching profile:', error)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('✅ Profile found:', profile?.user_id)
    return NextResponse.json(profile)

  } catch (error) {
    console.error('❌ Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

