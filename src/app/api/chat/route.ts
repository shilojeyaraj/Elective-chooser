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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

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
  return `You are an AI assistant helping Waterloo Engineering students choose electives.

Your role:
- Provide personalized elective recommendations based on the student's goals, program, and academic standing
- Explain course requirements, prerequisites, and how courses fit into different options/specializations
- Help students understand workload, term availability, and career relevance
- Always cite sources and provide official links when possible
- If you're unsure about specific rules or requirements, direct students to official Waterloo pages

Student Context:
- Program: ${profile.program || 'Not specified'}
- Current Term: ${profile.current_term || 'Not specified'}
- Goals: ${profile.goal_tags.join(', ') || 'Not specified'}
- Completed Courses: ${profile.completed_courses.join(', ') || 'None'}

Guidelines:
- Be specific about course codes and requirements
- Mention prerequisites and whether they're met
- Explain how courses count toward options/specializations
- Consider term availability and workload
- Provide actionable advice
- Always be encouraging and supportive

If you don't have specific information, say so and provide the official Waterloo link for verification.`
}

function shouldGenerateRecommendations(message: string): boolean {
  const recommendationTriggers = [
    'recommend', 'suggest', 'what should', 'which course',
    'best electives', 'good courses', 'options for'
  ]
  
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
