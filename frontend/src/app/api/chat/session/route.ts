import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🆕 Creating new chat session for user:', userId)

    // Create new session
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: 'New Chat'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating session:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    console.log('✅ Session created:', session.id)
    return NextResponse.json({ sessionId: session.id })

  } catch (error: any) {
    console.error('❌ Session creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

