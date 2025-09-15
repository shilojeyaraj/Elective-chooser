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

    // Create a new chat session in database
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: 'New Chat',
        goal_snapshot: {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      // If database operation fails, create a local session ID
      return NextResponse.json({ 
        sessionId: 'local-session-' + Date.now(),
        error: 'Database unavailable, using local session'
      })
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
