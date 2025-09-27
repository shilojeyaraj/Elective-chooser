import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getChatCompletion, getEmbedding } from '@/lib/openai'
import { searchElectiveDocs, searchCourses, searchSpecializations, searchCertificates, searchDiplomas, calculateCourseScore, searchCoursesByOption, searchCoursesBySpecialization, getOptionsForProgram, getOptionDetails, analyzeOptionProgress, getCoursesFulfillingMultipleOptions, searchOptionsByInterests, searchCSECourses, isProgramSpecificCoreCourse } from '@/lib/search'
import { enhancedSearch } from '@/lib/web-search'

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

    // Extract specific term from user message if mentioned
    const requestedTerm = extractTermFromMessage(message)
    const searchTerm = requestedTerm || profile.current_term
    
    console.log(`🔍 Search term: "${searchTerm}" (requested: "${requestedTerm}", profile: "${profile.current_term}")`)

    // Check if user is asking for CSE electives specifically
    const isCSEQuery = message.toLowerCase().includes('cse') || 
                      message.toLowerCase().includes('complementary studies') ||
                      message.toLowerCase().includes('cse elective')
    
    // Search for relevant information using enhanced search (database + web search)
    let searchResults = []
    let usedWebSearch = false
    let webSources: string[] = []
    
    try {
      if (isCSEQuery) {
        console.log('🔍 Detected CSE query, using searchCSECourses')
        searchResults = await searchCSECourses(undefined, 20)
      } else {
        // ALWAYS search database first directly
        console.log('🗄️ Searching database first with query:', message)
        searchResults = await searchCourses(message, {
          term: searchTerm,
          currentTerm: profile.current_term,
          skills: profile.goal_tags
        })
        
        console.log(`📊 Database returned ${searchResults.length} results`)
        
        // Only use enhanced search if database results are insufficient
        if (searchResults.length < 3) {
          console.log('🌐 Database results insufficient, trying enhanced search')
          const enhancedResults = await enhancedSearch(message, {
            term: searchTerm,
            currentTerm: profile.current_term,
            skills: profile.goal_tags
          })
          
          // Only use enhanced results if they're better
          if (enhancedResults.results.length > searchResults.length) {
            searchResults = enhancedResults.results
            usedWebSearch = enhancedResults.used_web_search
            webSources = enhancedResults.sources
            console.log('🌐 Using enhanced search results')
          }
        }
      }
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
    let foundSpecializations = []
    let foundCertificates = []
    let foundDiplomas = []
    let docChunks: any[] = []

    try {
      foundSpecializations = await searchSpecializations(message, programToSearch, 3)
    } catch (error) {
      console.error('❌ Error searching specializations:', error)
    }

    try {
      foundCertificates = await searchCertificates(message, programToSearch, 3)
    } catch (error) {
      console.error('❌ Error searching certificates:', error)
    }

    try {
      foundDiplomas = await searchDiplomas(message, programToSearch, 3)
    } catch (error) {
      console.error('❌ Error searching diplomas:', error)
    }

    try {
      // Get relevant document chunks for RAG
      docChunks = await searchElectiveDocs(message, 0.6, 5)
    } catch (error) {
      console.error('❌ Error searching document chunks:', error)
    }

    // Check if we should ask about completed electives
    const shouldAskAboutElectives = shouldAskAboutCompletedElectives(message, profile)

  // Check if user is asking for specializations or options
  const isAskingForSpecializations = message.toLowerCase().includes('specialization') || 
                                    message.toLowerCase().includes('specializations')
  const isAskingForOptions = message.toLowerCase().includes('option') || 
                            message.toLowerCase().includes('options')
  const isAskingForOptionDetails = message.toLowerCase().includes('details') || 
                                  message.toLowerCase().includes('requirements') ||
                                  message.toLowerCase().includes('progress')
  
  let recommendations = []
  let specializations = []
  let options: any[] = []
  let optionAnalysis = null
  
  if (isAskingForSpecializations) {
    console.log('🔍 User asking for specializations')
    specializations = await searchSpecializations(message, profile.program)
    console.log('📚 Found specializations:', specializations.length)
  }
  
  if (isAskingForOptions) {
    console.log('🔍 User asking for options')
    
    // Check if user is asking for specific option details
    const extractedOption = extractOptionFromMessage(message)
    if (extractedOption && isAskingForOptionDetails) {
      console.log(`🔍 User asking for details about option: ${extractedOption}`)
      try {
        optionAnalysis = await analyzeOptionProgress(extractedOption, profile.completed_courses || [])
        console.log('📊 Option analysis completed:', optionAnalysis.progress.percentage + '% complete')
      } catch (error) {
        console.error('❌ Error analyzing option progress:', error)
        // Fallback to basic option details
        const optionDetails = await getOptionDetails(extractedOption)
        if (optionDetails) {
          optionAnalysis = { option: optionDetails, progress: null }
        }
      }
    } else {
      // Get all options for the program
      options = await getOptionsForProgram(profile.program)
      console.log('📚 Found options for program:', options.length, 'for program:', profile.program)
      
      // If no options found for specific program, try to get all available options
      if (options.length === 0) {
        console.log('🔍 No options found for specific program, getting all available options')
        try {
          const { data: allOptions, error } = await supabase
            .from('options')
            .select('*')
            .order('name')
          if (!error && allOptions) {
            options = allOptions
            console.log('📚 Found all available options:', options.length)
          }
        } catch (error) {
          console.error('❌ Error fetching all options:', error)
        }
      }
      
      // If user has interests, also search by interests
      if (profile.interests && profile.interests.length > 0) {
        const interestBasedOptions = await searchOptionsByInterests(profile.interests, profile.program)
        console.log('🎯 Found interest-based options:', interestBasedOptions.length)
        // Merge and deduplicate
        const allOptions = [...options, ...interestBasedOptions]
        const uniqueOptions = allOptions.filter((option, index, self) => 
          index === self.findIndex(o => o.id === option.id)
        )
        options = uniqueOptions
      }
    }
  }
  
  // Build context for the LLM (after options and specializations are populated)
  const context = buildContext(searchResults, docChunks, profile, foundSpecializations, foundCertificates, foundDiplomas, options, optionAnalysis)
  
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
  
  // Extract course mentions from AI response and create recommendations
  const mentionedCourses = await extractCourseMentions(aiResponse, profile)
  console.log('📚 Courses mentioned in AI response:', mentionedCourses)
  
  // Always generate course recommendations - GUARANTEED
  console.log('📚 Always generating recommendations for message:', message)
  
  // Use the full conversation context for better search
  const contextQuery = buildSearchQueryFromContext(message, recentMessages)
  console.log('🔍 Using context query for search:', contextQuery)
  recommendations = await generateRecommendations(profile, contextQuery)
  console.log('📚 Generated recommendations:', recommendations.length, 'courses')
  
  // If no recommendations found, try with just the message
  if (recommendations.length === 0) {
    console.log('📚 No recommendations from context query, trying with original message')
    recommendations = await generateRecommendations(profile, message)
    console.log('📚 Generated recommendations with original message:', recommendations.length, 'courses')
  }
  
  // GUARANTEE recommendations - if still empty, use fallback
  if (recommendations.length === 0) {
    console.log('📚 Still no recommendations, using guaranteed fallback')
    recommendations = await generateRecommendations(profile, 'elective course')
    console.log('📚 Fallback recommendations:', recommendations.length, 'courses')
  }
  
  // Final guarantee - if still empty, get real courses from database
  if (recommendations.length === 0) {
    console.log('📚 No recommendations found, getting real courses from database as fallback')
    try {
      // Get some real courses from the database
      const { data: fallbackCourses, error: fallbackError } = await supabase
        .from('courses')
        .select('*')
        .limit(10)
        .order('level', { ascending: true })
      
      if (!fallbackError && fallbackCourses && fallbackCourses.length > 0) {
        console.log('📚 Found fallback courses from database:', fallbackCourses.length)
        
        // Filter out program-specific core courses and convert to recommendation format
        recommendations = fallbackCourses
          .filter(course => !isProgramSpecificCoreCourse(course, profile.program))
          .map(course => {
            const scoreData = calculateCourseScore(course, profile, profile.goal_tags)
            return {
              course,
              ...scoreData
            }
          })
        
        console.log('📚 Created recommendations from database fallback:', recommendations.length)
      } else {
        console.log('📚 Database fallback also failed, creating hardcoded fallback')
        // Create hardcoded fallback recommendations
        recommendations = [
          {
            course: {
              id: 'CS246',
              title: 'Object-Oriented Software Development',
              dept: 'CS',
              number: 246,
              level: 200,
              units: 0.5,
              prereqs: 'CS 136 or CS 146',
              terms_offered: ['F', 'W', 'S'],
              workload: { reading: 2, assignments: 4, projects: 3, labs: 1 },
              skills: ['programming', 'software development', 'object-oriented design']
            },
            score: 75,
            explanation: ['Popular elective course'],
            counts_toward: [],
            prereqs_met: false,
            next_offered: ['F', 'W', 'S'],
            workload_score: 7,
            ai_mentioned: false
          },
          {
            course: {
              id: 'ECE 250',
              title: 'Algorithms and Data Structures',
              dept: 'ECE',
              number: 250,
              level: 200,
              units: 0.5,
              prereqs: 'ECE 150 or CS 136',
              terms_offered: ['F', 'W', 'S'],
              workload: { reading: 3, assignments: 4, projects: 2, labs: 1 },
              skills: ['algorithms', 'data structures', 'programming']
            },
            score: 70,
            explanation: ['Core algorithms course'],
            counts_toward: [],
            prereqs_met: false,
            next_offered: ['F', 'W', 'S'],
            workload_score: 8,
            ai_mentioned: false
          },
          {
            course: {
              id: 'MSCI 211',
              title: 'Organizational Behaviour',
              dept: 'MSCI',
              number: 211,
              level: 200,
              units: 0.5,
              prereqs: '',
              terms_offered: ['F', 'W', 'S'],
              workload: { reading: 2, assignments: 3, projects: 1, labs: 0 },
              skills: ['management', 'organizational behavior', 'leadership']
            },
            score: 65,
            explanation: ['Management elective'],
            counts_toward: [],
            prereqs_met: true,
            next_offered: ['F', 'W', 'S'],
            workload_score: 4,
            ai_mentioned: false
          }
        ]
        console.log('📚 Created hardcoded fallback recommendations:', recommendations.length)
      }
    } catch (error) {
      console.error('❌ Error in database fallback:', error)
      // Create hardcoded fallback even if database fails
      recommendations = [
        {
          course: {
            id: 'CS246',
            title: 'Object-Oriented Software Development',
            dept: 'CS',
            number: 246,
            level: 200,
            units: 0.5,
            prereqs: 'CS 136 or CS 146',
            terms_offered: ['F', 'W', 'S'],
            workload: { reading: 2, assignments: 4, projects: 3, labs: 1 },
            skills: ['programming', 'software development', 'object-oriented design']
          },
          score: 75,
          explanation: ['Popular elective course'],
          counts_toward: [],
          prereqs_met: false,
          next_offered: ['F', 'W', 'S'],
          workload_score: 7,
          ai_mentioned: false
        }
      ]
    }
  }
  
  // Combine generated recommendations with mentioned courses from AI response
  if (mentionedCourses.length > 0) {
    console.log('📚 Adding mentioned courses to recommendations:', mentionedCourses.length)
    
    // Remove duplicates (courses that are already in recommendations)
    const existingCourseIds = new Set(recommendations.map(r => r.course.id))
    const newMentionedCourses = mentionedCourses.filter((mc: any) => !existingCourseIds.has(mc.course.id))
    
    // Add mentioned courses at the beginning (higher priority)
    recommendations = [...newMentionedCourses, ...recommendations]
    
    // Re-sort by score to ensure AI-mentioned courses (score 95) are at the top
    recommendations.sort((a, b) => b.score - a.score)
    
    console.log('📚 Final combined recommendations:', recommendations.length, 'courses')
  }

    console.log('📤 API Response:', {
      responseLength: aiResponse.length,
      recommendationsCount: recommendations.length,
      recommendations: recommendations.map(r => ({ id: r.course?.id, title: r.course?.title, score: r.score }))
    })

    return NextResponse.json({
      response: aiResponse,
      recommendations,
      specializations: specializations || [],
      options: options || [],
      optionAnalysis: optionAnalysis || null,
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
  diplomas: any[] = [],
  options: any[] = [],
  optionAnalysis: any = null
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

  // Add options information
  if (options.length > 0) {
    context += 'OPTIONS AVAILABLE (use ONLY these, do not generate your own list):\n'
    options.forEach((option: any, index: number) => {
      context += `${index + 1}. ${option.name}\n`
      context += `   Description: ${option.description?.substring(0, 200)}...\n`
      context += `   Program: ${option.program}\n`
      if (option.courses && option.courses.length > 0) {
        context += `   Courses: ${option.courses.slice(0, 5).map((c: any) => c.id).join(', ')}${option.courses.length > 5 ? '...' : ''}\n`
      }
      context += '\n'
    })
    context += 'IMPORTANT: Only mention these options above. Do not create or generate additional lists. Ask if they want to see more options.\n\n'
  }

  // Add option analysis if available
  if (optionAnalysis) {
    context += 'DETAILED OPTION ANALYSIS:\n'
    context += `Option: ${optionAnalysis.option.name}\n`
    context += `Description: ${optionAnalysis.option.description?.substring(0, 300)}...\n`
    
    if (optionAnalysis.progress) {
      context += `Progress: ${optionAnalysis.progress.percentage}% complete (${optionAnalysis.progress.completed}/${optionAnalysis.progress.total} courses)\n`
      
      if (optionAnalysis.progress.remaining && optionAnalysis.progress.remaining.length > 0) {
        context += `Remaining courses needed:\n`
        optionAnalysis.progress.remaining.slice(0, 8).forEach((course: any, index: number) => {
          context += `   ${index + 1}. ${course.id} - ${course.title}\n`
          if (course.prereqs) {
            context += `      Prerequisites: ${course.prereqs.substring(0, 100)}...\n`
          }
        })
        if (optionAnalysis.progress.remaining.length > 8) {
          context += `   ... and ${optionAnalysis.progress.remaining.length - 8} more courses\n`
        }
      }
      
      if (optionAnalysis.progress.next_steps && optionAnalysis.progress.next_steps.length > 0) {
        context += `Recommended next steps:\n`
        optionAnalysis.progress.next_steps.forEach((step: string, index: number) => {
          context += `   ${index + 1}. ${step}\n`
        })
      }
    }
    context += '\n'
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

🚨 CRITICAL FORMATTING RULES - I MUST NEVER USE MARKDOWN 🚨

I AM ABSOLUTELY FORBIDDEN FROM USING:
- Asterisks (*) anywhere in my responses
- Double asterisks (**) anywhere in my responses  
- Underscores (_) anywhere in my responses
- Any markdown formatting whatsoever
- Bold text or italic text
- Any formatting symbols

I MUST ALWAYS USE:
- Plain text only
- Same font size throughout
- Same font weight throughout
- Numbers and plain text for lists
- No special formatting whatsoever

WRONG EXAMPLES (NEVER DO THIS):
❌ **BME121: Digital Computation** - This course...
❌ *This is important* - Never do this
❌ **Important:** Never use bold
❌ 1. **Course Name** - Description

CORRECT EXAMPLES (ALWAYS DO THIS):
✅ BME121: Digital Computation - This course...
✅ This is important - Always do this
✅ Important: Always use plain text
✅ 1. Course Name - Description

I WILL BE PENALIZED IF I USE ANY MARKDOWN FORMATTING!

About you:
- Program: ${fullProgramName}
- Current Term: ${profile.current_term || 'Not specified'}
- Goals: ${profile.goal_tags.join(', ') || 'Not specified'}
- Completed Courses: ${profile.completed_courses.join(', ') || 'None'}
- Likely Completed (based on term): ${likelyCompletedCourses.join(', ')}

COURSE CONTEXT AWARENESS:
- I understand that as a ${profile.current_term || 'student'}, you've likely completed certain core courses
- I know that ${fullProgramName} students typically don't have electives until 2A term
- If you're in 1A or 1B, I won't ask about completed electives since you likely haven't taken any yet
- I consider prerequisites when recommending courses - I won't suggest courses you can't take yet
- I'm aware of typical course progression in ${fullProgramName} program

COURSE LEVEL INTELLIGENCE:
- I understand course levels: 1xx = 1st year, 2xx = 2nd year, 3xx = 3rd year, 4xx = 4th year
- For ${profile.current_term || 'students'}: I recommend appropriate level courses based on your current term
- When you ask "what courses can I take now?" I focus on courses appropriate for your current level
- When you ask "what should I plan for the future?" I include advanced courses with context about when you can take them
- I explain course levels and prerequisites clearly so you understand the progression
- I never recommend 4th year capstone courses to 2A students unless they're asking about future planning

COURSE RESTRICTION AWARENESS:
- I understand that some courses are restricted to specific faculties or programs
- CS246 (Data Structures) is restricted to Computer Science students in Mathematics Faculty, not available to Engineering students
- Engineering students should take ECE250 (Algorithms and Data Structures) instead of CS246
- I always check if courses are actually available to ${fullProgramName} students before recommending them
- I explain any restrictions or alternative courses when relevant

COURSE ACCURACY:
- I ONLY provide course information from the official Waterloo course database
- I never make up or invent course information
- All course titles, descriptions, prerequisites, and details come directly from the database
- If the database is unavailable, I clearly state that course information is not available
- I never provide fallback or placeholder course data
- If I'm unsure about course details, I clearly state that and suggest checking the official calendar

IMPORTANT: If the user's program is "Not specified", I should ask them to specify their engineering program (e.g., Software Engineering, Computer Engineering, etc.) so I can provide accurate recommendations for specializations, certificates, and diplomas.

SPECIALIZATIONS vs OPTIONS:
- SPECIALIZATIONS are additional areas of focus within a program (like "Artificial Intelligence Specialization" in Software Engineering)
- OPTIONS are broader program tracks within the Faculty of Engineering (like "Artificial Intelligence Option" which is available across multiple programs)
- When users ask about "specializations", I should show them the specializations from the database
- When users ask about "options", I should show them the engineering options from the database and include the URL: https://uwaterloo.ca/engineering/undergraduate-students/degree-enhancement/options
- I should never confuse these two - they are different things

How I can help:
- Chat about course options and what might interest you
- Explain prerequisites and requirements in simple terms
- Help you understand how courses fit into different specializations and options
- Show you available specializations, certificates, and diplomas for your program
- Analyze your progress toward specific options and specializations when you mention them
- Recommend courses that fulfill multiple options/specializations
- Give you the real scoop on workload and term availability
- Share career insights and why certain courses matter
- Ask about your completed electives when relevant for better recommendations
- Help you plan your academic path toward specific options
- Explain CSE (Complementary Studies Electives) requirements and List A, B, C, D classifications

CSE (COMPLEMENTARY STUDIES ELECTIVES) KNOWLEDGE:
I understand Waterloo Engineering's CSE requirements and can help with:
- CSE courses are non-technical electives that provide breadth outside engineering, math, and science
- Most engineering programs require 2.0 units (4 courses) of CSE electives
- CSE courses are classified into Lists A, B, C, and D:
  * List A: Humanities and Social Sciences (345 courses available)
  * List B: Management and Business (8 courses available) 
  * List C: Arts and Design (91 courses available)
  * List D: Communication and Language (160 courses available)
- Some courses are marked as EXCLUSION and cannot be used for CSE credit
- Popular CSE departments include: STV (Science, Technology & Values), HIST (History), SOC (Sociology), PHIL (Philosophy), PSYCH (Psychology), ENGL (English), ANTH (Anthropology), BET (Business, Entrepreneurship & Technology)
- STV courses are particularly popular with engineering students as they explore technology's social impact
- I can recommend CSE courses that align with your interests and career goals

OPTION ANALYSIS CAPABILITIES:
When users mention specific options (like "AI option", "Software Engineering option", "Biomechanics option", etc.), I can:
- Analyze their current progress toward that option based on completed courses
- Show which courses they still need to take
- Identify prerequisites they need to complete first
- Suggest the best next steps to complete the option
- Explain the option's requirements and course structure
- Recommend courses that fulfill multiple options simultaneously

IMPORTANT RULES:
- I ONLY use information provided in the context below - I never make up or generate lists
- When users ask for "all" options, specializations, or courses, I provide comprehensive lists from the database
- When users ask for recommendations, I show the top 3 best options with their specific course requirements
- I provide the exact course codes and names from the database (e.g., "CS 486 Introduction to Artificial Intelligence")
- For comprehensive lists, I show all available options without limiting to top 3
- For recommendations, I ask if you want to see more options after showing the top 3
- I never mention programs that aren't in the context (like Aerospace Engineering)
- I'm conversational and friendly - no formal academic jargon unless needed
- I only give recommendations when you ask for them
- I'll ask questions to understand what you're looking for
- I'm honest about what I know and don't know
- I NEVER use markdown formatting like **bold** or *italic* - just use plain text
- IMPORTANT: Use only plain text, no asterisks, no bold, no italic formatting
- NEVER use ** for bold text or * for italic text - always use plain text
- When listing items, use numbers and plain text, not markdown formatting
- CRITICAL: Never use asterisks (*) or double asterisks (**) anywhere in my responses
- CRITICAL: Never use underscores (_) for italic text
- CRITICAL: Always use plain text formatting only
- I consider your academic level and likely completed courses when making recommendations
- For Mechatronics Engineering students: I know you don't have electives until 2A term, so I won't ask about completed electives if you're in 1A or 1B
- If you're in 2A or later and haven't specified completed electives, I may ask for clarification
- CRITICAL: When users ask about "specializations", I must show the SPECIALIZATIONS from the context, not options
- CRITICAL: When users ask about "options", I must show the OPTIONS from the context, not specializations
- I must clearly distinguish between these two different types of academic programs

🚨 FINAL FORMATTING REMINDER 🚨
I must NEVER use ** or * or _ anywhere in my responses. I must use ONLY plain text formatting. This is absolutely critical and non-negotiable. I will be penalized for using any markdown formatting!

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
  const messageLower = message.toLowerCase().trim()
  
  console.log('🔍 Testing recommendation trigger for:', message)
  console.log('🔍 Message lowercased:', messageLower)
  
  // Don't give recommendations for simple greetings only
  const simpleGreetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'thanks', 'thank you', 'ok', 'okay', 'yes', 'no']
  const isOnlySimpleGreeting = simpleGreetings.some(greeting => messageLower === greeting)
  
  if (isOnlySimpleGreeting) {
    console.log('🔍 Blocked: Message is only a simple greeting')
    return false
  }
  
  // Generate recommendations for any substantive message (more than 2 characters)
  const isSubstantive = messageLower.length > 2
  
  console.log('🔍 Recommendation check:', {
    message: messageLower,
    isOnlySimpleGreeting,
    isSubstantive,
    shouldRecommend: isSubstantive
  })
  
  return isSubstantive
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

// Extract specific term from user message (2A, 2B, 3A, 3B, 4A, 4B)
function extractTermFromMessage(message: string): string | null {
  const messageLower = message.toLowerCase()
  
  // Look for term patterns like "2a", "2b", "3a", "3b", "4a", "4b"
  const termPattern = /(2a|2b|3a|3b|4a|4b)/i
  const match = messageLower.match(termPattern)
  
  if (match) {
    const term = match[1].toUpperCase()
    console.log(`🎯 Extracted term from message: "${term}"`)
    return term
  }
  
  console.log(`🎯 No specific term found in message: "${message}"`)
  return null
}

// Extract option/specialization from user message
function extractOptionFromMessage(message: string): string | null {
  const optionKeywords = {
    'artificial-intelligence': ['ai option', 'artificial intelligence option', 'ai specialization', 'artificial intelligence', 'ai'],
    'biomechanics': ['biomechanics option', 'biomechanics specialization', 'biomechanics'],
    'computer-engineering': ['computer engineering option', 'computer engineering specialization', 'computer engineering'],
    'computing': ['computing option', 'computing specialization', 'computing'],
    'entrepreneurship': ['entrepreneurship option', 'entrepreneurship specialization', 'entrepreneurship'],
    'environmental-engineering': ['environmental engineering option', 'environmental engineering specialization', 'environmental engineering'],
    'life-sciences': ['life sciences option', 'life sciences specialization', 'life sciences'],
    'management-science': ['management science option', 'management science specialization', 'management science'],
    'mechatronics': ['mechatronics option', 'mechatronics specialization', 'mechatronics'],
    'physical-sciences': ['physical sciences option', 'physical sciences specialization', 'physical sciences'],
    'quantum-engineering': ['quantum engineering option', 'quantum engineering specialization', 'quantum engineering'],
    'software-engineering': ['software engineering option', 'software engineering specialization', 'software engineering'],
    'statistics': ['statistics option', 'statistics specialization', 'statistics']
  }
  
  const messageLower = message.toLowerCase()
  for (const [optionId, keywords] of Object.entries(optionKeywords)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      console.log(`🎯 Extracted option from message: "${optionId}"`)
      return optionId
    }
  }
  
  console.log(`🎯 No specific option found in message: "${message}"`)
  return null
}

async function generateRecommendations(
  profile: UserProfile,
  query: string
): Promise<any[]> {
  console.log('🔍 generateRecommendations called with:', { query, profile: profile.program, term: profile.current_term })
  
  // Check if user is asking for comprehensive lists
  const isComprehensiveList = query.toLowerCase().includes('all') || 
                             query.toLowerCase().includes('list') ||
                             query.toLowerCase().includes('every') ||
                             query.toLowerCase().includes('complete')
  
  // Extract specific term from query if mentioned
  const requestedTerm = extractTermFromMessage(query)
  const searchTerm = requestedTerm || profile.current_term
  
  console.log(`🔍 Generate recommendations for term: "${searchTerm}" (requested: "${requestedTerm}", profile: "${profile.current_term}")`)
  console.log(`🔍 Is comprehensive list request: ${isComprehensiveList}`)
  
  // Use different search strategies to provide variety
  let courses = await searchCourses(query, {
    term: searchTerm,
    currentTerm: profile.current_term,
    skills: profile.goal_tags
  })
  
  // If user is asking for CSE courses specifically, use CSE search
  if (query.toLowerCase().includes('cse') || query.toLowerCase().includes('complementary studies')) {
    console.log('🔍 User asking for CSE courses, using CSE search...')
    const cseCourses = await searchCSECourses()
    if (cseCourses.length > 0) {
      courses = cseCourses
      console.log('📚 Found CSE courses:', courses.length)
    }
  }
  
  // If user is asking for "more" or "different" recommendations, try alternative searches
  if (query.toLowerCase().includes('more') || query.toLowerCase().includes('different') || query.toLowerCase().includes('other')) {
    console.log('🔍 User wants more/different recommendations, trying alternative searches...')
    
    // Try searching by different keywords
    const alternativeQueries = [
      'elective course',
      'technical elective',
      'complementary studies',
      'humanities',
      'social sciences',
      'arts',
      'business',
      'management'
    ]
    
    for (const altQuery of alternativeQueries) {
      if (courses.length < 10) { // Only if we need more courses
        const altCourses = await searchCourses(altQuery, {
          term: searchTerm,
          currentTerm: profile.current_term,
          skills: profile.goal_tags
        })
        
        // Add courses that aren't already in the list
        const existingIds = new Set(courses.map(c => c.id))
        const newCourses = altCourses.filter(c => !existingIds.has(c.id))
        courses = [...courses, ...newCourses]
        
        console.log(`📚 Added ${newCourses.length} courses from "${altQuery}" search`)
      }
    }
  }
  
  console.log('📚 Found courses:', courses.length, 'courses')
  if (courses.length > 0) {
    console.log('📚 Sample course:', courses[0].id, courses[0].title)
  }

  // If no courses found, try a broader search
  let finalCourses = courses
  if (courses.length === 0) {
    console.log('🔍 No courses found with specific search, trying broader search...')
    const broaderCourses = await searchCourses('elective course', {
      term: searchTerm,
      currentTerm: profile.current_term
    })
    finalCourses = broaderCourses
    console.log('📚 Broader search found:', broaderCourses.length, 'courses')
  }

  // Calculate scores and generate recommendations
  const recommendations = finalCourses
    .filter(course => {
      // Filter out program-specific core courses that shouldn't be recommended as electives
      return !isProgramSpecificCoreCourse(course, profile.program)
    })
    .map(course => {
      const scoreData = calculateCourseScore(course, profile, profile.goal_tags)
      console.log(`📊 Course ${course.id} score:`, scoreData.score)
      return {
        course,
        ...scoreData
      }
    })
    .sort((a, b) => b.score - a.score)

  // For comprehensive lists, return more results; for recommendations, limit to top 5
  const finalRecommendations = isComprehensiveList ? recommendations : recommendations.slice(0, 5)

  console.log('🎯 Final recommendations:', finalRecommendations.length, 'recommendations')
  if (finalRecommendations.length > 0) {
    console.log('🎯 Sample recommendations:', finalRecommendations.slice(0, 3).map(r => ({ id: r.course.id, title: r.course.title, score: r.score })))
  }
  return finalRecommendations
}

// Extract course mentions from AI response and create recommendations
async function extractCourseMentions(aiResponse: string, profile: UserProfile): Promise<any[]> {
  console.log('🔍 Extracting course mentions from AI response...')
  
  // Pattern to match course codes like "CS246", "ECE250", "STV205", etc.
  const coursePattern = /\b([A-Z]{2,4}\d{3}[A-Z]?)\b/g
  const matches = aiResponse.match(coursePattern)
  
  if (!matches || matches.length === 0) {
    console.log('📚 No course codes found in AI response')
    return []
  }
  
  // Remove duplicates and get unique course codes
  const uniqueCourseCodes = [...new Set(matches)]
  console.log('📚 Found unique course codes:', uniqueCourseCodes)
  
  // Fetch course details from database
  const courseRecommendations = []
  
  for (const courseCode of uniqueCourseCodes) {
    try {
      const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseCode)
        .single()
      
      if (!error && course) {
        console.log(`✅ Found course in database: ${courseCode} - ${course.title}`)
        
        // Check if this is a program-specific core course that shouldn't be recommended
        if (isProgramSpecificCoreCourse(course, profile.program)) {
          console.log(`❌ Skipping program-specific core course: ${courseCode} - ${course.title}`)
          continue
        }
        
        // Calculate actual workload intensity score (1-10)
        let workload_score = 5 // Default to medium workload
        if (course.workload) {
          const total = (course.workload.reading || 0) + (course.workload.assignments || 0) + (course.workload.projects || 0) + (course.workload.labs || 0)
          workload_score = Math.min(10, Math.max(1, Math.round(total / 2))) // Convert to 1-10 scale
        }

        // Create recommendation object
        const recommendation = {
          course,
          score: 95, // Very high score since AI specifically mentioned it
          explanation: [`AI specifically recommended this course`],
          counts_toward: course.fulfills_options || [],
          prereqs_met: true, // Assume met for now
          next_offered: course.terms_offered || [],
          workload_score,
          ai_mentioned: true // Flag to indicate this was mentioned by AI
        }
        
        courseRecommendations.push(recommendation)
      } else {
        console.log(`❌ Course not found in database: ${courseCode}`)
      }
    } catch (error) {
      console.error(`❌ Error fetching course ${courseCode}:`, error)
    }
  }
  
  console.log(`📚 Created ${courseRecommendations.length} recommendations from AI mentions`)
  return courseRecommendations
}
