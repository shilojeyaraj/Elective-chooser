import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { createChatMemory, getRecentMessages } from '@/lib/langchain-memory'
import { searchCourses, calculateCourseScore } from '@/lib/search'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/lib/types'

// Helper function to remove markdown formatting
function cleanMarkdown(text: string): string {
  return text
    // Remove bold (**text** or __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove headers (# Header)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove links but keep text [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove inline code `code` -> code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json()

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, sessionId, userId' },
        { status: 400 }
      )
    }

    console.log('💬 Chat API called:', { message, sessionId, userId })

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Save user message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        tokens: Math.ceil(message.length / 4)
      })

    if (msgError) {
      console.error('❌ Error saving user message:', msgError)
    }

    // Get recent conversation history
    const memory = createChatMemory(sessionId, userId)
    const recentMessages = await getRecentMessages(sessionId, 10)

    // Search for relevant courses
    const courses = await searchCourses(message, {
      currentTerm: profile.current_term,
      skills: profile.interests || []
    }, 20)

    // Calculate recommendations
    const recommendations = courses.slice(0, 10).map(course => {
      const scoreData = calculateCourseScore(
        course,
        profile as UserProfile,
        profile.goal_tags || []
      )
      return {
        course,
        ...scoreData
      }
    }).sort((a, b) => b.score - a.score).slice(0, 5)

    // Build system prompt
    const systemPrompt = `You are an AI elective advisor for University of Waterloo Engineering students.
You help students choose electives based on their program, interests, and career goals.

IMPORTANT: Do NOT use markdown formatting (no **bold**, *italic*, # headers, etc.). Use plain text only.

Student Profile:
- Program: ${profile.program || 'Not specified'}
- Current Term: ${profile.current_term || 'Not specified'}
- Interests: ${(profile.interests || []).join(', ') || 'None'}
- Career Goals: ${(profile.goal_tags || []).join(', ') || 'None'}

${recommendations.length > 0 ? `\nTop Course Recommendations:\n${recommendations.map((r, i) => `${i + 1}. ${r.course.id}: ${r.course.title} (Score: ${r.score})`).join('\n')}` : ''}

Provide helpful, personalized advice about elective courses. Be conversational and friendly. Use plain text formatting only - no markdown.`

    // Initialize LangChain chat model
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    })

    // Get AI response using proper LangChain message format
    const langchainMessageArray = [
      new SystemMessage(systemPrompt),
      ...recentMessages,
      new HumanMessage(message)
    ]

    const response = await model.invoke(langchainMessageArray)
    let aiResponse = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content)

    // Remove markdown formatting from response
    aiResponse = cleanMarkdown(aiResponse)

    // Save AI response (save original with markdown for consistency, but return cleaned version)
    await memory.addAIMessage(aiResponse)

    // Extract sources from recommendations
    const sources = recommendations
      .map(r => r.course.source_url)
      .filter((url): url is string => !!url)
      .slice(0, 5)

    return NextResponse.json({
      response: aiResponse,
      recommendations: recommendations,
      sources: sources,
      used_web_search: false
    })

  } catch (error: unknown) {
    console.error('❌ Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

