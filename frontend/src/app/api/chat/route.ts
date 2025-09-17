import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getChatCompletion, getEmbedding } from '@/lib/openai'
import { searchElectiveDocs, searchCourses, calculateCourseScore } from '@/lib/search'
import { enhancedSearch } from '@/lib/web-search'
import { getRecentMessages } from '@/lib/langchain-memory'
import { UserProfile } from '@/lib/types'
import { demoCourses, demoOptions } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json()

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user profile
    console.log('🔍 Looking for profile with user_id:', userId)
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)

    console.log('🔍 Profile query result:', { profiles, profileError })

    if (profileError) {
      console.error('❌ Profile query error:', profileError)
      return NextResponse.json(
        { error: `Profile query failed: ${profileError.message}` },
        { status: 500 }
      )
    }

    if (!profiles || profiles.length === 0) {
      console.error('❌ No profile found for user_id:', userId)
      return NextResponse.json(
        { error: 'User profile not found. Please complete your profile setup first.' },
        { status: 404 }
      )
    }

    const profile = profiles[0]
    console.log('✅ Profile found:', profile)

    // Get recent conversation history
    const recentMessages = await getRecentMessages(sessionId, 6)

    // Search for relevant information
    const searchResults = await enhancedSearch(message, {
      term: profile.current_term,
      skills: profile.goal_tags
    })

    // Get relevant document chunks for RAG
    const docChunks = await searchElectiveDocs(message, 0.6, 5)

    // Build context for the LLM
    const context = buildContext(searchResults, docChunks, profile)

    // Create conversation messages
    const messages = [
      {
        role: 'system' as const,
        content: getSystemPrompt(profile)
      },
      ...recentMessages.map(msg => ({
        role: msg._getType() === 'human' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: `${message}\n\nContext:\n${context}`
      }
    ]

    // Get AI response
    const aiResponse = await getChatCompletion(messages)

    // Save messages to database
    await supabase.from('messages').insert([
      {
        session_id: sessionId,
        role: 'user',
        content: message,
        tokens: Math.ceil(message.length / 4)
      },
      {
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse,
        tokens: Math.ceil(aiResponse.length / 4),
        citations: docChunks.map(chunk => ({
          url: chunk.source_url,
          text: chunk.text.substring(0, 200) + '...'
        }))
      }
    ])

    // Generate course recommendations if relevant
    let recommendations = []
    if (shouldGenerateRecommendations(message)) {
      recommendations = await generateRecommendations(profile, message)
    }

    return NextResponse.json({
      response: aiResponse,
      recommendations,
      sources: searchResults.sources,
      used_web_search: searchResults.used_web_search
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function buildContext(
  searchResults: any,
  docChunks: any[],
  profile: UserProfile
): string {
  let context = ''

  // Add course information
  if (searchResults.results.length > 0) {
    context += 'Available Courses:\n'
    searchResults.results.slice(0, 5).forEach((course: any) => {
      context += `- ${course.id}: ${course.title} (${course.dept})\n`
      context += `  Description: ${course.description?.substring(0, 200)}...\n`
      context += `  Skills: ${course.skills?.join(', ')}\n`
      context += `  Terms: ${course.terms_offered?.join(', ')}\n\n`
    })
  }

  // Add document chunks
  if (docChunks.length > 0) {
    context += 'Relevant Information:\n'
    docChunks.forEach((chunk, index) => {
      context += `${index + 1}. ${chunk.text.substring(0, 300)}...\n`
      context += `   Source: ${chunk.source_url}\n\n`
    })
  }

  // Add user profile context
  context += `User Profile:\n`
  context += `- Program: ${profile.program}\n`
  context += `- Term: ${profile.current_term}\n`
  context += `- Goals: ${profile.goal_tags.join(', ')}\n`
  context += `- Completed: ${profile.completed_courses.join(', ')}\n`

  return context
}

function getSystemPrompt(profile: UserProfile): string {
  return `Hey! 👋 I'm your friendly elective advisor here at Waterloo Engineering. I'm here to help you navigate the maze of course options and find the perfect electives for your goals!

**About you:**
- Program: ${profile.program || 'Not specified'}
- Current Term: ${profile.current_term || 'Not specified'}
- Goals: ${profile.goal_tags.join(', ') || 'Not specified'}
- Completed Courses: ${profile.completed_courses.join(', ') || 'None'}

**How I can help:**
- Chat about course options and what might interest you
- Explain prerequisites and requirements in simple terms
- Help you understand how courses fit into different specializations
- Give you the real scoop on workload and term availability
- Share career insights and why certain courses matter

**My style:**
- I'm conversational and friendly - no formal academic jargon unless needed
- I only give recommendations when you ask for them
- I'll ask questions to understand what you're looking for
- I'm honest about what I know and don't know
- I'll point you to official sources when you need the nitty-gritty details

Just chat with me naturally! Ask me anything about electives, courses, or your academic journey. I'm here to help make your course selection process less overwhelming and more exciting! 🚀`
}

function shouldGenerateRecommendations(message: string): boolean {
  const recommendationTriggers = [
    'recommend courses', 'suggest electives', 'what courses should', 'which electives',
    'best electives for', 'good courses for', 'options for', 'course recommendations',
    'elective suggestions', 'help me choose', 'what electives'
  ]
  
  // Don't give recommendations for simple greetings
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
  if (greetings.some(greeting => message.toLowerCase().includes(greeting))) {
    return false
  }
  
  return recommendationTriggers.some(trigger => 
    message.toLowerCase().includes(trigger)
  )
}

async function generateRecommendations(
  profile: UserProfile,
  query: string
): Promise<any[]> {
  // Search for relevant courses
  const courses = await searchCourses(query, {
    term: profile.current_term,
    skills: profile.goal_tags
  })

  // Calculate scores and generate recommendations
  const recommendations = courses
    .map(course => ({
      course,
      ...calculateCourseScore(course, profile, profile.goal_tags)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return recommendations
}
