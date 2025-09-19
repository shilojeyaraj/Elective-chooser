import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getChatCompletion, getEmbedding } from '@/lib/openai'
import { searchElectiveDocs, searchCourses, searchSpecializations, searchCertificates, searchDiplomas, calculateCourseScore } from '@/lib/search'

// Extract program from user message
function extractProgramFromMessage(message: string): string | null {
  const programKeywords = {
    'Software Engineering': ['software', 'se', 'software engineering'],
    'Computer Engineering': ['computer', 'ce', 'computer engineering', 'comp eng'],
    'Electrical Engineering': ['electrical', 'ee', 'electrical engineering'],
    'Mechanical Engineering': ['mechanical', 'me', 'mechanical engineering'],
    'Civil Engineering': ['civil', 'civ', 'civil engineering'],
    'Chemical Engineering': ['chemical', 'che', 'chemical engineering'],
    'Systems Design Engineering': ['systems', 'syde', 'systems design'],
    'Biomedical Engineering': ['biomedical', 'bme', 'biomedical engineering'],
    'Environmental Engineering': ['environmental', 'env', 'environmental engineering'],
    'Geological Engineering': ['geological', 'geo', 'geological engineering'],
    'Architectural Engineering': ['architectural', 'ae', 'architectural engineering'],
    'Nanotechnology Engineering': ['nanotechnology', 'ne', 'nano']
  }
  
  const messageLower = message.toLowerCase()
  for (const [program, keywords] of Object.entries(programKeywords)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      return program
    }
  }
  return null
}
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

    // Get user profile with better error handling
    console.log('🔍 Looking for profile with user_id:', userId)
    
    let profile
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)

      console.log('🔍 Profile query result:', { profiles, profileError })

      if (profileError) {
        console.error('❌ Profile query error:', profileError)
        // Create a fallback profile to prevent complete failure
        profile = {
          user_id: userId,
          username: 'User',
          program: 'Not specified',
          current_term: '2A',
          completed_courses: [],
          planned_courses: [],
          interests: ['general'],
          goal_tags: ['general'],
          additional_comments: '',
          gpa: 0,
          constraints: {
            max_workload: 4,
            morning_labs: false,
            schedule_preferences: []
          }
        }
        console.log('⚠️ Using fallback profile due to database error')
      } else if (!profiles || profiles.length === 0) {
        console.error('❌ No profile found for user_id:', userId)
        // Create a fallback profile for new users
        profile = {
          user_id: userId,
          username: 'User',
          program: 'Not specified',
          current_term: '2A',
          completed_courses: [],
          planned_courses: [],
          interests: ['general'],
          goal_tags: ['general'],
          additional_comments: '',
          gpa: 0,
          constraints: {
            max_workload: 4,
            morning_labs: false,
            schedule_preferences: []
          }
        }
        console.log('⚠️ Using fallback profile - no profile found')
      } else {
        profile = profiles[0]
        console.log('✅ Profile found:', profile)
      }
    } catch (error) {
      console.error('❌ Critical error loading profile:', error)
      // Create a minimal fallback profile
      profile = {
        user_id: userId,
        username: 'User',
        program: 'Not specified',
        current_term: '2A',
        completed_courses: [],
        planned_courses: [],
        interests: ['general'],
        goal_tags: ['general'],
        additional_comments: '',
        gpa: 0,
        constraints: {
          max_workload: 4,
          morning_labs: false,
          schedule_preferences: []
        }
      }
      console.log('⚠️ Using emergency fallback profile')
    }

    // Get recent conversation history
    const recentMessages = await getRecentMessages(sessionId, 6)

    // Search for relevant information using vector search with error handling
    let searchResults = []
    try {
      searchResults = await searchCourses(message, {
        term: profile.current_term,
        skills: profile.goal_tags
      })
    } catch (error) {
      console.error('❌ Error searching courses:', error)
      // Use demo data as fallback
      searchResults = [
        {
          id: "ECE486",
          title: "Robot Dynamics and Control",
          dept: "ECE",
          number: 486,
          units: 0.5,
          level: 400,
          description: "Advanced course covering robot kinematics, dynamics, and control systems.",
          terms_offered: ["F", "W"],
          prereqs: "ECE 380, MATH 211",
          skills: ["robotics", "control", "dynamics"],
          workload: { reading: 3, assignments: 4, projects: 2, labs: 2 },
          assessments: { midterm: 30, final: 40, assignments: 20, project: 10 },
          source_url: "https://uwaterloo.ca/electrical-computer-engineering/undergraduate-studies/course-catalog/ece-486"
        }
      ]
      console.log('⚠️ Using demo data due to search error')
    }

    // Search for specializations, certificates, and diplomas
    // Use program from profile, or try to extract from conversation if empty
    const programToSearch = profile.program || extractProgramFromMessage(message) || 'Software Engineering'
    console.log(`🔍 Using program for search: "${programToSearch}" (from profile: "${profile.program}")`)
    
    // If we extracted a program from the message and the profile doesn't have one, update it
    if (!profile.program && extractProgramFromMessage(message)) {
      console.log(`🔄 Updating user profile with program: ${programToSearch}`)
      try {
        await supabase
          .from('profiles')
          .update({ program: programToSearch })
          .eq('user_id', profile.user_id)
      } catch (error) {
        console.error('Failed to update profile:', error)
      }
    }
    
    // Search for information with error handling
    let specializations = []
    let certificates = []
    let diplomas = []
    let docChunks = []

    try {
      specializations = await searchSpecializations(message, programToSearch, 3)
    } catch (error) {
      console.error('❌ Error searching specializations:', error)
    }

    try {
      certificates = await searchCertificates(message, programToSearch, 3)
    } catch (error) {
      console.error('❌ Error searching certificates:', error)
    }

    try {
      diplomas = await searchDiplomas(message, programToSearch, 3)
    } catch (error) {
      console.error('❌ Error searching diplomas:', error)
    }

    try {
      // Get relevant document chunks for RAG
      docChunks = await searchElectiveDocs(message, 0.6, 5)
    } catch (error) {
      console.error('❌ Error searching document chunks:', error)
    }

    // Build context for the LLM
    const context = buildContext(searchResults, docChunks, profile, specializations, certificates, diplomas)

    // Check if we should ask about completed electives
    const shouldAskAboutElectives = shouldAskAboutCompletedElectives(message, profile)
    
    // Create conversation messages
    const messages = [
      {
        role: 'system' as const,
        content: getSystemPrompt(profile)
      },
      ...recentMessages.map(msg => ({
        role: msg._getType() === 'human' ? 'user' as const : 'assistant' as const,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      })),
      {
        role: 'user' as const,
        content: `${message}\n\nContext:\n${context}${shouldAskAboutElectives ? '\n\nNOTE: The user may need to specify their completed electives for better recommendations.' : ''}`
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
    const shouldRecommend = shouldGenerateRecommendations(message)
    console.log('🔍 Should generate recommendations?', shouldRecommend, 'for message:', message)
    
    if (shouldRecommend) {
      console.log('📚 Generating recommendations...')
      // Use the full conversation context for better search
      const contextQuery = buildSearchQueryFromContext(message, recentMessages)
      console.log('🔍 Using context query for search:', contextQuery)
      recommendations = await generateRecommendations(profile, contextQuery)
      console.log('📚 Generated recommendations:', recommendations.length, 'courses')
    }

    console.log('📤 API Response:', {
      responseLength: aiResponse.length,
      recommendationsCount: recommendations.length,
      recommendations: recommendations.map(r => ({ id: r.course?.id, title: r.course?.title, score: r.score }))
    })

    return NextResponse.json({
      response: aiResponse,
      recommendations,
      sources: [], // No web search sources since we're using database search
      used_web_search: false
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
  profile: UserProfile,
  specializations: any[] = [],
  certificates: any[] = [],
  diplomas: any[] = []
): string {
  let context = ''

  // Add course information
  if (searchResults && searchResults.length > 0) {
    context += 'Available Courses:\n'
    searchResults.slice(0, 5).forEach((course: any) => {
      context += `- ${course.id}: ${course.title} (${course.dept})\n`
      context += `  Description: ${course.description?.substring(0, 200)}...\n`
      context += `  Skills: ${course.skills?.join(', ')}\n`
      context += `  Terms: ${course.terms_offered?.join(', ')}\n\n`
    })
  }

  // Add specializations information
  if (specializations.length > 0) {
    context += 'SPECIALIZATIONS AVAILABLE (use ONLY these, do not generate your own list):\n'
    specializations.forEach((spec: any, index: number) => {
      context += `${index + 1}. ${spec.name} (${spec.program})\n`
      context += `   Requirements: ${spec.graduation_requirements?.substring(0, 200)}...\n`
      
      // Show required courses
      if (spec.course_requirements?.required?.length > 0) {
        context += `   Required Courses: ${spec.course_requirements.required.join(', ')}\n`
      }
      
      // Show elective courses from choose_from
      if (spec.course_requirements?.choose_from?.examples?.length > 0) {
        context += `   Elective Courses (choose from):\n`
        spec.course_requirements.choose_from.examples.forEach((course: string) => {
          context += `     - ${course}\n`
        })
      }
      
      // Show other choose_from categories
      if (spec.course_requirements?.choose_from) {
        Object.entries(spec.course_requirements.choose_from).forEach(([category, courses]: [string, any]) => {
          if (category !== 'examples' && Array.isArray(courses) && courses.length > 0) {
            context += `   ${category.replace(/_/g, ' ').toUpperCase()}:\n`
            courses.forEach((course: string) => {
              context += `     - ${course}\n`
            })
          }
        })
      }
      
      context += '\n'
    })
    context += 'IMPORTANT: Only mention these specializations above. Do not create or generate additional lists. Ask if they want to see more options.\n\n'
  }

  // Add certificates information
  if (certificates.length > 0) {
    context += 'CERTIFICATES AVAILABLE (use ONLY these, do not generate your own list):\n'
    certificates.forEach((cert: any, index: number) => {
      context += `${index + 1}. ${cert.name}\n`
      context += `   Administered by: ${cert.administered_by}\n`
      context += `   Requirements: ${cert.requirements?.substring(0, 200)}...\n`
      context += '\n'
    })
    context += 'IMPORTANT: Only mention these certificates above. Do not create or generate additional lists. Ask if they want to see more options.\n\n'
  }

  // Add diplomas information
  if (diplomas.length > 0) {
    context += 'DIPLOMAS AVAILABLE (use ONLY these, do not generate your own list):\n'
    diplomas.forEach((diploma: any, index: number) => {
      context += `${index + 1}. ${diploma.name}\n`
      context += `   Administered by: ${diploma.administered_by}\n`
      context += `   Requirements: ${diploma.requirements?.substring(0, 200)}...\n`
      context += '\n'
    })
    context += 'IMPORTANT: Only mention these diplomas above. Do not create or generate additional lists. Ask if they want to see more options.\n\n'
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
  context += `- Program: ${profile.program || 'Not specified'}\n`
  context += `- Term: ${profile.current_term || 'Not specified'}\n`
  context += `- Goals: ${profile.goal_tags.join(', ') || 'Not specified'}\n`
  context += `- Completed: ${profile.completed_courses.join(', ') || 'None'}\n`

  return context
}

function getSystemPrompt(profile: UserProfile): string {
  // Convert program abbreviation to full name
  const programAbbreviations: { [key: string]: string } = {
    'ARCH': 'Architecture',
    'AE': 'Architectural Engineering',
    'BME': 'Biomedical Engineering',
    'CHE': 'Chemical Engineering',
    'CIVE': 'Civil Engineering',
    'ECE': 'Computer Engineering',
    'EE': 'Electrical Engineering',
    'ENVE': 'Environmental Engineering',
    'GEOE': 'Geological Engineering',
    'MGT': 'Management Engineering',
    'ME': 'Mechanical Engineering',
    'MTE': 'Mechatronics Engineering',
    'NANO': 'Nanotechnology Engineering',
    'SE': 'Software Engineering',
    'SYDE': 'Systems Design Engineering'
  }
  
  const fullProgramName = programAbbreviations[profile.program || ''] || profile.program || 'Not specified'
  
  // Generate likely completed courses based on term
  const likelyCompletedCourses = generateLikelyCompletedCourses(profile.current_term || '', profile.program || '')
  
  return `Hey! 👋 I'm your friendly elective advisor here at Waterloo Engineering. I'm here to help you navigate the maze of course options and find the perfect electives for your goals!

IMPORTANT: I use only plain text formatting - no asterisks, no bold, no italic text. Just regular text.

**About you:**
- Program: ${fullProgramName}
- Current Term: ${profile.current_term || 'Not specified'}
- Goals: ${profile.goal_tags.join(', ') || 'Not specified'}
- Completed Courses: ${profile.completed_courses.join(', ') || 'None'}
- Likely Completed (based on term): ${likelyCompletedCourses.join(', ')}

**COURSE CONTEXT AWARENESS:**
- I understand that as a ${profile.current_term || 'student'}, you've likely completed certain core courses
- If you haven't specified your completed electives, I may ask you to clarify what electives you've already taken
- I consider prerequisites when recommending courses - I won't suggest courses you can't take yet
- I'm aware of typical course progression in ${fullProgramName} program

**IMPORTANT:** If the user's program is "Not specified", I should ask them to specify their engineering program (e.g., Software Engineering, Computer Engineering, etc.) so I can provide accurate recommendations for specializations, certificates, and diplomas.

**How I can help:**
- Chat about course options and what might interest you
- Explain prerequisites and requirements in simple terms
- Help you understand how courses fit into different specializations
- Show you available specializations, certificates, and diplomas for your program
- Give you the real scoop on workload and term availability
- Share career insights and why certain courses matter
- Ask about your completed electives when relevant for better recommendations

**IMPORTANT RULES:**
- I ONLY use information provided in the context below - I never make up or generate lists
- I show ONLY the top 3 best options from the database with their specific course requirements
- I provide the exact course codes and names from the database (e.g., "CS 486 Introduction to Artificial Intelligence")
- I ask if you want to see more options after showing the top 3
- I never mention programs that aren't in the context (like Aerospace Engineering)
- I'm conversational and friendly - no formal academic jargon unless needed
- I only give recommendations when you ask for them
- I'll ask questions to understand what you're looking for
- I'm honest about what I know and don't know
- I NEVER use markdown formatting like **bold** or *italic* - just use plain text
- IMPORTANT: Use only plain text, no asterisks, no bold, no italic formatting
- I consider your academic level and likely completed courses when making recommendations
- If I'm unsure about your completed courses, I'll ask you to clarify

Just chat with me naturally! Ask me anything about electives, courses, specializations, or your academic journey. I'm here to help make your course selection process less overwhelming and more exciting! 🚀`
}

// Generate likely completed courses based on term and program
function generateLikelyCompletedCourses(term: string, program: string): string[] {
  const likelyCourses: string[] = []
  
  if (!term) return likelyCourses
  
  // Common first year courses (1A, 1B)
  if (term.includes('1A') || term.includes('1B')) {
    likelyCourses.push('MATH 115', 'MATH 117', 'MATH 119', 'PHYS 115', 'CHE 102', 'GENE 121')
  }
  
  // Second year courses (2A, 2B)
  if (term.includes('2A') || term.includes('2B')) {
    likelyCourses.push('MATH 211', 'MATH 213', 'MATH 215', 'PHYS 125', 'PHYS 175')
    
    // Program-specific courses
    if (program === 'MTE' || program === 'ME') {
      likelyCourses.push('MTE 100', 'MTE 100L', 'MTE 120', 'MTE 140')
    }
    if (program === 'ECE' || program === 'EE') {
      likelyCourses.push('ECE 150', 'ECE 155', 'ECE 250')
    }
    if (program === 'SE' || program === 'CS') {
      likelyCourses.push('CS 135', 'CS 136', 'CS 137')
    }
  }
  
  // Third year courses (3A, 3B)
  if (term.includes('3A') || term.includes('3B')) {
    likelyCourses.push('MATH 237', 'MATH 239')
    
    if (program === 'MTE' || program === 'ME') {
      likelyCourses.push('MTE 220', 'MTE 240', 'MTE 320', 'MTE 340')
    }
    if (program === 'ECE' || program === 'EE') {
      likelyCourses.push('ECE 222', 'ECE 250', 'ECE 380')
    }
    if (program === 'SE' || program === 'CS') {
      likelyCourses.push('CS 241', 'CS 245', 'CS 246')
    }
  }
  
  // Fourth year courses (4A, 4B)
  if (term.includes('4A') || term.includes('4B')) {
    if (program === 'MTE' || program === 'ME') {
      likelyCourses.push('MTE 380', 'MTE 420', 'MTE 440')
    }
    if (program === 'ECE' || program === 'EE') {
      likelyCourses.push('ECE 380', 'ECE 480')
    }
    if (program === 'SE' || program === 'CS') {
      likelyCourses.push('CS 350', 'CS 370')
    }
  }
  
  return likelyCourses
}

// Determine if we should ask about completed electives
function shouldAskAboutCompletedElectives(message: string, profile: UserProfile): boolean {
  const messageLower = message.toLowerCase()
  
  // Check if user is asking for elective recommendations
  const isElectiveQuery = messageLower.includes('elective') || 
                         messageLower.includes('cse') || 
                         messageLower.includes('recommend') ||
                         messageLower.includes('suggest')
  
  // Check if user has no completed courses listed
  const hasNoCompletedCourses = !profile.completed_courses || profile.completed_courses.length === 0
  
  // Check if user is in 2A or later (when they would have taken electives)
  const isUpperYear = !!(profile.current_term && (
    profile.current_term.includes('2A') || 
    profile.current_term.includes('2B') || 
    profile.current_term.includes('3A') || 
    profile.current_term.includes('3B') || 
    profile.current_term.includes('4A') || 
    profile.current_term.includes('4B')
  ))
  
  return isElectiveQuery && hasNoCompletedCourses && isUpperYear
}

function shouldGenerateRecommendations(message: string): boolean {
  const messageLower = message.toLowerCase()
  
  const recommendationTriggers = [
    'recommend', 'recomend', 'reccomend', 'reccomendations', 'recommendations', 'suggest', 'courses', 'electives', 'what courses', 'which courses',
    'best electives', 'good courses', 'options', 'course recommendations', 'course recomendations', 'course reccomendations',
    'elective suggestions', 'help me choose', 'what electives', 'show me courses','give me',
    'find courses', 'course options', 'elective options', 'robotics', 'ai', 'machine learning',
    '2a', '2b', '3a', '3b', '4a', '4b', 'plan my term', 'term planning', 'generate',
    'give me', 'list', 'show', 'find', 'search', 'looking for', 'technical', 'elective',
    'next term', 'future terms', 'what about', 'should i take', 'what should', 'which should'
  ]
  
  console.log('🔍 Testing recommendation trigger for:', message)
  console.log('🔍 Message lowercased:', messageLower)
  
  
  // Don't give recommendations for simple greetings
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'thanks', 'thank you']
  if (greetings.some(greeting => messageLower.includes(greeting))) {
    return false
  }
  
  // Check for recommendation triggers
  const hasTrigger = recommendationTriggers.some(trigger => 
    messageLower.includes(trigger)
  )
  
  // Debug: show which triggers match
  const matchingTriggers = recommendationTriggers.filter(trigger => 
    messageLower.includes(trigger)
  )
  
  console.log('🔍 Trigger analysis:', {
    messageLower,
    hasTrigger,
    matchingTriggers,
    totalTriggers: recommendationTriggers.length
  })
  
  // Also check if message is asking for help with courses/electives
  const courseHelpPatterns = [
    /what.*course/i,
    /which.*course/i,
    /help.*course/i,
    /elective.*help/i,
    /course.*help/i,
    /recommendation/i,
    /suggestion/i
  ]
  
  const hasCourseHelp = courseHelpPatterns.some(pattern => pattern.test(message))
  
  console.log('🔍 Recommendation check:', {
    message: messageLower,
    hasTrigger,
    matchingTriggers,
    hasCourseHelp,
    shouldRecommend: hasTrigger || hasCourseHelp
  })
  
  return hasTrigger || hasCourseHelp
}

// Build search query from conversation context
function buildSearchQueryFromContext(currentMessage: string, recentMessages: any[]): string {
  // Extract key terms from the current message
  const currentTerms = extractKeyTerms(currentMessage)
  
  // Extract key terms from recent messages (last 3 messages)
  const recentTerms = recentMessages
    .slice(-3) // Last 3 messages
    .map(msg => {
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      return extractKeyTerms(content)
    })
    .flat()
  
  // Combine all terms and remove duplicates
  const allTerms = [...new Set([...currentTerms, ...recentTerms])]
  
  // Filter out common words and keep meaningful terms
  const meaningfulTerms = allTerms.filter(term => 
    term.length > 2 && 
    !['give', 'me', 'recommendations', 'suggestions', 'please', 'thanks', 'thank', 'you', 'can', 'help', 'with', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(term)
  )
  
  // Build a comprehensive search query
  const searchQuery = meaningfulTerms.join(' ')
  
  console.log('🔍 Context analysis:', {
    currentMessage,
    currentTerms,
    recentTerms,
    allTerms,
    meaningfulTerms,
    finalQuery: searchQuery
  })
  
  return searchQuery || currentMessage // Fallback to current message if no context
}

// Extract key terms from a message
function extractKeyTerms(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .split(/\s+/)
    .filter(word => word.length > 2)
}

async function generateRecommendations(
  profile: UserProfile,
  query: string
): Promise<any[]> {
  console.log('🔍 generateRecommendations called with:', { query, profile: profile.program, term: profile.current_term })
  
  // Search for relevant courses (don't filter by term - use it as guidance only)
  const courses = await searchCourses(query, {
    // Don't filter by term or skills for general searches - let the text search handle relevance
  })
  
  console.log('📚 Found courses:', courses.length, 'courses')
  if (courses.length > 0) {
    console.log('📚 Sample course:', courses[0].id, courses[0].title)
  }

  // Calculate scores and generate recommendations
  const recommendations = courses
    .map(course => {
      const scoreData = calculateCourseScore(course, profile, profile.goal_tags)
      console.log(`📊 Course ${course.id} score:`, scoreData.score)
      return {
        course,
        ...scoreData
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  console.log('🎯 Final recommendations:', recommendations.length, 'recommendations')
  return recommendations
}
