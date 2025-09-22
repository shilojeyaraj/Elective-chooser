import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    console.log('🔍 Session creation request:', { userId })

    if (!userId) {
      console.log('❌ No userId provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🆕 Creating session for user:', userId)
    
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
      console.error('❌ Error creating session:', error)
      // If database operation fails, generate a proper UUID
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
      console.log('⚠️ Using fallback UUID:', uuid)
      return NextResponse.json({ 
        sessionId: uuid,
        error: 'Database unavailable, using local session'
      })
    }

    console.log('✅ Session created successfully:', session.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('❌ Session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
