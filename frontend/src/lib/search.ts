import { supabase } from './supabase'
import { getEmbedding } from './openai'
import { Course, CourseRecommendation, SearchFilters, UserProfile } from './types'
import { demoCourses } from './demo-data'

// Map program abbreviations to full names
const PROGRAM_ABBREVIATIONS: { [key: string]: string } = {
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

// Convert program abbreviation to full name
function getFullProgramName(abbreviation: string): string {
  return PROGRAM_ABBREVIATIONS[abbreviation] || abbreviation
}

// Vector similarity search for RAG
export async function searchElectiveDocs(
  query: string,
  threshold: number = 0.5,
  limit: number = 10
): Promise<Array<{ text: string; source_url: string; similarity: number }>> {
  const queryEmbedding = await getEmbedding(query)
  
  const { data, error } = await supabase.rpc('search_elective_docs', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit
  })
  
  if (error) {
    console.error('Vector search error:', error)
    return []
  }
  
  return data || []
}

// Search courses by option fulfillment
export async function searchCoursesByOption(
  optionId: string,
  program?: string,
  filters?: SearchFilters
): Promise<Course[]> {
  console.log(`🔍 Searching courses for option: ${optionId}`)
  
  let query = supabase
    .from('courses')
    .select('*')
    .contains('fulfills_options', [optionId])
  
  // Apply additional filters
  if (filters?.term) {
    query = query.contains('terms_offered', [filters.term])
  }
  
  if (filters?.level) {
    query = query.eq('level', filters.level)
  }
  
  if (filters?.dept) {
    query = query.eq('dept', filters.dept)
  }
  
  if (filters?.skills && filters.skills.length > 0) {
    query = query.overlaps('skills', filters.skills)
  }
  
  const { data, error } = await query.order('level', { ascending: true })
  
  if (error) {
    console.error('Option search error:', error)
    return []
  }
  
  console.log(`✅ Found ${data?.length || 0} courses for option ${optionId}`)
  return data || []
}

// Search courses by specialization
export async function searchCoursesBySpecialization(
  specializationId: string,
  program?: string,
  filters?: SearchFilters
): Promise<Course[]> {
  console.log(`🔍 Searching courses for specialization: ${specializationId}`)
  
  let query = supabase
    .from('courses')
    .select('*')
    .contains('fulfills_specializations', [specializationId])
  
  // Apply additional filters
  if (filters?.term) {
    query = query.contains('terms_offered', [filters.term])
  }
  
  if (filters?.level) {
    query = query.eq('level', filters.level)
  }
  
  if (filters?.dept) {
    query = query.eq('dept', filters.dept)
  }
  
  if (filters?.skills && filters.skills.length > 0) {
    query = query.overlaps('skills', filters.skills)
  }
  
  const { data, error } = await query.order('level', { ascending: true })
  
  if (error) {
    console.error('Specialization search error:', error)
    return []
  }
  
  console.log(`✅ Found ${data?.length || 0} courses for specialization ${specializationId}`)
  return data || []
}

// Get all available options for a program
export async function getOptionsForProgram(program: string): Promise<any[]> {
  console.log(`🔍 Getting options for program: ${program}`)
  
  const { data, error } = await supabase
    .from('options')
    .select('*')
    .eq('program', program)
    .order('name')
  
  if (error) {
    console.error('Options fetch error:', error)
    return []
  }
  
  console.log(`✅ Found ${data?.length || 0} options for ${program}`)
  return data || []
}

// Get detailed option information with course requirements
export async function getOptionDetails(optionId: string): Promise<any> {
  console.log(`🔍 Getting detailed option info for: ${optionId}`)
  
  const { data, error } = await supabase
    .from('options')
    .select('*')
    .eq('id', optionId)
    .single()
  
  if (error) {
    console.error('Option details fetch error:', error)
    return null
  }
  
  // Get courses that fulfill this option
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, description, prereqs, terms_offered, level, dept, units')
    .contains('fulfills_options', [optionId])
    .order('level', { ascending: true })
  
  if (coursesError) {
    console.error('Option courses fetch error:', coursesError)
  }
  
  return {
    ...data,
    courses: courses || []
  }
}

// Analyze user's progress toward an option
export async function analyzeOptionProgress(optionId: string, completedCourses: string[]): Promise<{
  option: any
  progress: {
    completed: number
    total: number
    percentage: number
    remaining: any[]
    next_steps: string[]
  }
}> {
  console.log(`🔍 Analyzing progress for option: ${optionId}`)
  
  const optionDetails = await getOptionDetails(optionId)
  if (!optionDetails) {
    throw new Error(`Option ${optionId} not found`)
  }
  
  const allCourses = optionDetails.courses || []
  const completed = allCourses.filter((course: any) => 
    completedCourses.some(completed => 
      completed.toLowerCase().includes(course.id.toLowerCase())
    )
  )
  
  const remaining = allCourses.filter((course: any) => 
    !completedCourses.some(completed => 
      completed.toLowerCase().includes(course.id.toLowerCase())
    )
  )
  
  const progress = {
    completed: completed.length,
    total: allCourses.length,
    percentage: Math.round((completed.length / allCourses.length) * 100),
    remaining: remaining,
    next_steps: generateNextSteps(remaining, completedCourses)
  }
  
  return {
    option: optionDetails,
    progress
  }
}

// Helper function to determine appropriate course levels for a given term
function getAppropriateCourseLevels(currentTerm: string, includeFuture: boolean = false): number[] {
  const termToLevels: { [key: string]: number[] } = {
    '1A': [1], // First year courses only
    '1B': [1], // First year courses only
    '2A': [1, 2], // First and second year courses
    '2B': [1, 2], // First and second year courses
    '3A': [1, 2, 3], // First, second, and third year courses
    '3B': [1, 2, 3], // First, second, and third year courses
    '4A': [1, 2, 3, 4], // All levels
    '4B': [1, 2, 3, 4] // All levels
  }
  
  const immediateLevels = termToLevels[currentTerm] || [1, 2, 3, 4]
  
  // If including future courses, expand to include ALL future levels
  if (includeFuture) {
    const termToFutureLevels: { [key: string]: number[] } = {
      '1A': [1, 2, 3, 4], // Can plan for all future years
      '1B': [1, 2, 3, 4], // Can plan for all future years
      '2A': [1, 2, 3, 4], // Can plan for all future years
      '2B': [1, 2, 3, 4], // Can plan for all future years
      '3A': [1, 2, 3, 4], // Can plan for all future years
      '3B': [1, 2, 3, 4], // Can plan for all future years
      '4A': [1, 2, 3, 4], // All levels
      '4B': [1, 2, 3, 4] // All levels
    }
    return termToFutureLevels[currentTerm] || [1, 2, 3, 4]
  }
  
  return immediateLevels
}

// Helper function to extract course level from course ID
function getCourseLevel(courseId: string): number {
  // Extract the number from course ID (e.g., "CS486" -> 4, "ECE250" -> 2)
  const match = courseId.match(/\d+/)
  if (match) {
    const num = parseInt(match[0])
    // Map course numbers to levels: 1xx=1, 2xx=2, 3xx=3, 4xx=4
    return Math.floor(num / 100)
  }
  return 1 // Default to level 1 if can't determine
}

// Helper function to detect if user is asking about future courses
function isAskingAboutFuture(query: string): boolean {
  const futureKeywords = [
    'future', 'plan', 'planning', 'later', 'upcoming', 'next year', 'next term',
    'eventually', 'down the road', 'in the future', 'for later', 'advanced',
    'upper year', 'senior', 'capstone', 'final year', 'graduation'
  ]
  
  const immediateKeywords = [
    'now', 'current', 'this term', 'next term', 'available', 'can take',
    'eligible', 'prerequisites met', 'ready to take'
  ]
  
  const queryLower = query.toLowerCase()
  
  // Check for future indicators
  const hasFutureKeywords = futureKeywords.some(keyword => queryLower.includes(keyword))
  
  // Check for immediate indicators
  const hasImmediateKeywords = immediateKeywords.some(keyword => queryLower.includes(keyword))
  
  // If they explicitly mention future planning, include future courses
  if (hasFutureKeywords) return true
  
  // If they explicitly mention immediate/current, only show current level
  if (hasImmediateKeywords) return false
  
  // Default behavior: if asking about "electives" or "courses" without context,
  // show appropriate level courses with some future planning context
  return false
}

// Generate next steps for option completion
function generateNextSteps(remainingCourses: any[], completedCourses: string[]): string[] {
  const nextSteps: string[] = []
  
  // Find courses with met prerequisites
  const availableCourses = remainingCourses.filter((course: any) => {
    if (!course.prereqs) return true
    
    // Simple prerequisite check - in reality this would be more sophisticated
    const prereqList = course.prereqs.split(',').map((p: string) => p.trim())
    return prereqList.every((prereq: string) => 
      completedCourses.some(completed => 
        completed.toLowerCase().includes(prereq.toLowerCase())
      )
    )
  })
  
  if (availableCourses.length > 0) {
    nextSteps.push(`You can take these courses next: ${availableCourses.slice(0, 3).map(c => c.id).join(', ')}`)
  }
  
  // Find courses that need prerequisites
  const needsPrereqs = remainingCourses.filter((course: any) => {
    if (!course.prereqs) return false
    
    const prereqList = course.prereqs.split(',').map((p: string) => p.trim())
    return !prereqList.every((prereq: string) => 
      completedCourses.some(completed => 
        completed.toLowerCase().includes(prereq.toLowerCase())
      )
    )
  })
  
  if (needsPrereqs.length > 0) {
    nextSteps.push(`Complete prerequisites for: ${needsPrereqs.slice(0, 2).map(c => c.id).join(', ')}`)
  }
  
  return nextSteps
}

// Get courses that fulfill multiple options
export async function getCoursesFulfillingMultipleOptions(program: string): Promise<any[]> {
  console.log(`🔍 Getting courses that fulfill multiple options for: ${program}`)
  
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, fulfills_options, level, dept')
    .not('fulfills_options', 'is', null)
    .order('level', { ascending: true })
  
  if (error) {
    console.error('Multi-option courses fetch error:', error)
    return []
  }
  
  // Filter courses that fulfill multiple options
  const multiOptionCourses = (data || []).filter((course: any) => 
    course.fulfills_options && course.fulfills_options.length > 1
  )
  
  console.log(`✅ Found ${multiOptionCourses.length} courses fulfilling multiple options`)
  return multiOptionCourses
}

// Search for options by user interests
export async function searchOptionsByInterests(interests: string[], program: string): Promise<any[]> {
  console.log(`🔍 Searching options by interests: ${interests.join(', ')}`)
  
  const { data, error } = await supabase
    .from('options')
    .select('*')
    .eq('program', program)
    .order('name')
  
  if (error) {
    console.error('Options search error:', error)
    return []
  }
  
  // Score options based on interest matching
  const scoredOptions = (data || []).map(option => {
    let score = 0
    const matchedInterests: string[] = []
    
    interests.forEach(interest => {
      const interestLower = interest.toLowerCase()
      const nameLower = option.name.toLowerCase()
      const descLower = (option.description || '').toLowerCase()
      
      if (nameLower.includes(interestLower) || descLower.includes(interestLower)) {
        score += 10
        matchedInterests.push(interest)
      }
    })
    
    return {
      ...option,
      score,
      matchedInterests
    }
  })
  
  // Sort by score and return top matches
  return scoredOptions
    .filter(option => option.score > 0)
    .sort((a, b) => b.score - a.score)
}

// Get all available specializations
export async function getSpecializations(): Promise<any[]> {
  console.log('🔍 Getting all specializations')
  
  const { data, error } = await supabase
    .from('specializations')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Specializations fetch error:', error)
    return []
  }
  
  console.log(`✅ Found ${data?.length || 0} specializations`)
  return data || []
}

// Course search with filters
export async function searchCourses(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<Course[]> {
  console.log('🔍 searchCourses called with:', { query, filters, limit })
  
  // First, let's test if we can query the database at all
  const { data: testData, error: testError } = await supabase
    .from('courses')
    .select('id, title, dept')
    .limit(5)
  
  console.log('🔍 Database connectivity test:', { 
    testFound: testData?.length || 0, 
    testError: testError?.message || 'None',
    sampleCourses: testData?.slice(0, 3).map(c => ({ id: c.id, title: c.title, dept: c.dept })) || []
  })
  
  if (testError) {
    console.error('❌ Database connection failed:', testError)
    return getFallbackCourses(query, limit, filters)
  }
  
  if (!testData || testData.length === 0) {
    console.log('📚 No courses in database, using fallback data')
    return getFallbackCourses(query, limit, filters)
  }
  
  // Build a simple but effective search query
  let searchQuery = supabase
    .from('courses')
    .select('*')
    .limit(limit)
  
  // Apply text search if query provided
  if (query && query.trim()) {
    const cleanQuery = query.trim().toLowerCase()
    console.log('🔍 Searching for:', cleanQuery)
    
    // Create search conditions
    const searchConditions = [
      `title.ilike.%${cleanQuery}%`,
      `description.ilike.%${cleanQuery}%`,
      `dept.ilike.%${cleanQuery}%`
    ]
    
    // Add specific term searches
    if (cleanQuery.includes('elective') || cleanQuery.includes('course')) {
      searchConditions.push(`title.ilike.%elective%`)
    }
    if (cleanQuery.includes('cse') || cleanQuery.includes('complementary studies')) {
      // For CSE electives, only return courses with CSE classification
      searchConditions.push(`cse_classification.in.(A,B,C,D)`)
    }
    if (cleanQuery.includes('technical')) {
      searchConditions.push(`title.ilike.%technical%`)
    }
    if (cleanQuery.includes('software') || cleanQuery.includes('programming')) {
      searchConditions.push(`title.ilike.%software%,title.ilike.%programming%,dept.eq.CS,dept.eq.SE`)
    }
    if (cleanQuery.includes('ai') || cleanQuery.includes('machine learning') || cleanQuery.includes('artificial')) {
      searchConditions.push(`title.ilike.%artificial%,title.ilike.%intelligence%,title.ilike.%machine%,title.ilike.%ai%`)
    }
    if (cleanQuery.includes('robotics') || cleanQuery.includes('mechatronics')) {
      searchConditions.push(`title.ilike.%robotics%,title.ilike.%mechatronics%,dept.eq.MTE`)
    }
    if (cleanQuery.includes('data') || cleanQuery.includes('analytics')) {
      searchConditions.push(`title.ilike.%data%,title.ilike.%analytics%,title.ilike.%statistics%`)
    }
    
    searchQuery = searchQuery.or(searchConditions.join(','))
  }
  
  // Note: We'll apply term filter after getting results to avoid JSON syntax issues
  
  // Apply department filter if provided
  if (filters.dept && filters.dept.length > 0) {
    searchQuery = searchQuery.in('dept', filters.dept)
  }
  
  // Execute the query
  const { data, error } = await searchQuery
  
  if (error) {
    console.error('❌ Search query error:', error)
    return getFallbackCourses(query, limit, filters)
  }
  
  console.log('📚 Search result:', { found: data?.length || 0, query })
  if (data && data.length > 0) {
    console.log('📚 Sample courses found:', data.slice(0, 3).map(c => ({ id: c.id, title: c.title, dept: c.dept })))
  }
  
  // Apply term filter after getting results to avoid JSON syntax issues
  let filteredData = data || []
  if (filters.term) {
    console.log(`🔍 Applying term filter after search: "${filters.term}"`)
    filteredData = filteredData.filter((course: any) => {
      const termsOffered = course.terms_offered
      if (!termsOffered) return true // If no terms specified, include the course
      
      // Handle both array and string formats
      let terms: string[] = []
      if (Array.isArray(termsOffered)) {
        terms = termsOffered
      } else if (typeof termsOffered === 'string') {
        try {
          terms = JSON.parse(termsOffered)
        } catch {
          // If it's not JSON, treat as comma-separated
          terms = termsOffered.split(',').map(t => t.trim())
        }
      }
      
      const hasTerm = terms.some(term => 
        term.toLowerCase().includes(filters.term!.toLowerCase())
      )
      
      if (!hasTerm) {
        console.log(`🚫 Filtered out ${course.id} - doesn't offer term ${filters.term}`)
      }
      
      return hasTerm
    })
    console.log(`📚 After term filtering: ${filteredData.length} courses remaining`)
  }
  
  // Filter courses by level if user's current term is provided
  if (filters.currentTerm) {
    const includeFuture = isAskingAboutFuture(query)
    const appropriateLevels = getAppropriateCourseLevels(filters.currentTerm, includeFuture)
    console.log(`🔍 Filtering courses for term ${filters.currentTerm}, includeFuture: ${includeFuture}, appropriate levels:`, appropriateLevels)
    
    filteredData = filteredData.filter((course: any) => {
      const courseLevel = getCourseLevel(course.id)
      const isAppropriate = appropriateLevels.includes(courseLevel)
      if (!isAppropriate) {
        console.log(`🚫 Filtered out ${course.id} (level ${courseLevel}) - not appropriate for ${filters.currentTerm} (future: ${includeFuture})`)
      }
      return isAppropriate
    })
    
    console.log(`📚 After level filtering: ${filteredData.length} courses remaining`)
  }
  
  // If no results after filtering, try a broader search
  if (filteredData.length === 0) {
    console.log('🔍 No results found after filtering, trying broader search...')
    const { data: broadData, error: broadError } = await supabase
      .from('courses')
      .select('*')
      .limit(limit)
    
    if (!broadError && broadData && broadData.length > 0) {
      console.log('📚 Broad search found:', broadData.length, 'courses')
      
      // Apply level filtering to broad search results too
      if (filters.currentTerm) {
        const includeFuture = isAskingAboutFuture(query)
        const appropriateLevels = getAppropriateCourseLevels(filters.currentTerm, includeFuture)
        const broadFiltered = broadData.filter((course: any) => {
          const courseLevel = getCourseLevel(course.id)
          return appropriateLevels.includes(courseLevel)
        })
        console.log(`📚 Broad search after level filtering: ${broadFiltered.length} courses`)
        return broadFiltered
      }
      
      return broadData
    }
    
    // Final fallback
    return getFallbackCourses(query, limit, filters)
  }
  
  // Shuffle the results to provide variety in recommendations
  const shuffledResults = [...filteredData].sort(() => Math.random() - 0.5)
  
  return shuffledResults
}

// No fallback courses - only use real data from database
function getFallbackCourses(query: string, limit: number, filters: SearchFilters = {}): Course[] {
  console.log('📚 Database unavailable - returning empty results instead of made-up data')
  return []
}

// Extract meaningful keywords from query
function extractSearchKeywords(query: string): string[] {
  // Remove common words and extract meaningful terms
  const stopWords = ['i', 'havent', 'have', 'taken', 'any', 'can', 'you', 'give', 'me', 'recommendations', 'for', 'please', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 3) // Take top 3 keywords
}

// Search specializations
export async function searchSpecializations(
  query: string,
  program?: string,
  limit: number = 3
): Promise<any[]> {
  let supabaseQuery = supabase
    .from('specializations')
    .select('*')
    .limit(limit)
  
  // Check if this is a general specialization query
  const isGeneralSpecializationQuery = query.toLowerCase().includes('specialization') || 
                                      query.toLowerCase().includes('specializations') ||
                                      query.toLowerCase().includes('what specializations') ||
                                      query.toLowerCase().includes('available specializations')
  
  // Apply text search with extracted keywords (only if not a general query)
  if (query && !isGeneralSpecializationQuery) {
    const keywords = extractSearchKeywords(query)
    if (keywords.length > 0) {
      const searchConditions = keywords.map(keyword => {
        const cleanKeyword = keyword.replace(/[%_]/g, '\\$&')
        return `name.ilike.%${cleanKeyword}%,description.ilike.%${cleanKeyword}%`
      }).join(',')
      supabaseQuery = supabaseQuery.or(searchConditions)
    }
  }
  
  // Filter by program if specified - convert abbreviation to full name
  if (program) {
    const fullProgramName = getFullProgramName(program)
    console.log(`🔍 Searching specializations for program: "${program}" -> "${fullProgramName}"`)
    supabaseQuery = supabaseQuery.eq('program', fullProgramName)
  }
  
  const { data, error } = await supabaseQuery
  
  if (error) {
    console.error('Specialization search error:', error)
    return []
  }
  
  console.log(`✅ Found ${data?.length || 0} specializations for program: ${program}`)
  return data || []
}

// Search certificates
export async function searchCertificates(
  query: string,
  program?: string,
  limit: number = 3
): Promise<any[]> {
  let supabaseQuery = supabase
    .from('certificates')
    .select('*')
    .eq('uw_engineering_listed', true) // Only show engineering-listed certificates
    .limit(limit)
  
  // Apply text search with extracted keywords
  if (query) {
    const keywords = extractSearchKeywords(query)
    if (keywords.length > 0) {
      const searchConditions = keywords.map(keyword => {
        const cleanKeyword = keyword.replace(/[%_]/g, '\\$&')
        return `name.ilike.%${cleanKeyword}%,description.ilike.%${cleanKeyword}%`
      }).join(',')
      supabaseQuery = supabaseQuery.or(searchConditions)
    }
  }
  
  // Note: certificates table doesn't have program column, so we skip program filtering
  if (program) {
    console.log(`🔍 Searching certificates (no program filter available)`)
  }
  
  const { data, error } = await supabaseQuery
  
  if (error) {
    console.error('Certificate search error:', error)
    return []
  }
  
  console.log(`✅ Found ${data?.length || 0} certificates for program: ${program}`)
  return data || []
}

// Search diplomas
export async function searchDiplomas(
  query: string,
  program?: string,
  limit: number = 3
): Promise<any[]> {
  let supabaseQuery = supabase
    .from('diplomas')
    .select('*')
    .eq('uw_engineering_listed', true) // Only show engineering-listed diplomas
    .limit(limit)
  
  // Apply text search with extracted keywords
  if (query) {
    const keywords = extractSearchKeywords(query)
    if (keywords.length > 0) {
      const searchConditions = keywords.map(keyword => {
        const cleanKeyword = keyword.replace(/[%_]/g, '\\$&')
        return `name.ilike.%${cleanKeyword}%,description.ilike.%${cleanKeyword}%`
      }).join(',')
      supabaseQuery = supabaseQuery.or(searchConditions)
    }
  }
  
  // Note: diplomas table doesn't have program column, so we skip program filtering
  if (program) {
    console.log(`🔍 Searching diplomas (no program filter available)`)
  }
  
  const { data, error } = await supabaseQuery
  
  if (error) {
    console.error('Diploma search error:', error)
    return []
  }
  
  console.log(`✅ Found ${data?.length || 0} diplomas for program: ${program}`)
  return data || []
}

// Filter demo courses based on query and filters
function filterDemoCourses(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Course[] {
  let filteredCourses = [...demoCourses]
  
  // Apply text search
  if (query) {
    const queryLower = query.toLowerCase()
    
    // Handle common query patterns
    const isElectiveQuery = queryLower.includes('elective') || queryLower.includes('course') || queryLower.includes('2a') || queryLower.includes('2b') || queryLower.includes('3a') || queryLower.includes('3b')
    const isCSEQuery = queryLower.includes('cse') || queryLower.includes('complementary studies')
    
    if (isCSEQuery) {
      // For CSE queries, prioritize courses with CSE classifications
      filteredCourses = filteredCourses.filter((course: any) => {
        // First check if it has a CSE classification (A, B, C, D)
        const hasCSEClassification = course.cse_classification && 
          ['A', 'B', 'C', 'D'].includes(course.cse_classification)
        
        // Then check if it matches the query
        const matchesQuery = course.title.toLowerCase().includes(queryLower) ||
          course.description.toLowerCase().includes(queryLower) ||
          course.skills.some((skill: any) => skill.toLowerCase().includes(queryLower)) ||
          course.id.toLowerCase().includes(queryLower) ||
          // Show courses that match CSE themes
          course.skills.some((skill: any) => 
            ['ethics', 'society', 'sustainability', 'social', 'environment', 'complementary studies'].some(theme => 
              skill.toLowerCase().includes(theme)
            )
          ) ||
          course.title.toLowerCase().includes('ethics') ||
          course.title.toLowerCase().includes('society') ||
          course.title.toLowerCase().includes('sustainability') ||
          course.title.toLowerCase().includes('social') ||
          course.title.toLowerCase().includes('environment')
        
        return hasCSEClassification && matchesQuery
      })
    } else if (isElectiveQuery) {
      // For elective queries, be more permissive and show relevant courses
      filteredCourses = filteredCourses.filter((course: any) => 
        course.title.toLowerCase().includes(queryLower) ||
        course.description.toLowerCase().includes(queryLower) ||
        course.skills.some((skill: any) => skill.toLowerCase().includes(queryLower)) ||
        course.id.toLowerCase().includes(queryLower) ||
        // Show courses that match common elective themes
        course.skills.some((skill: any) => 
          ['programming', 'software', 'ai', 'robotics', 'data', 'algorithms', 'systems'].some(theme => 
            skill.toLowerCase().includes(theme)
          )
        )
      )
    } else {
      // For specific queries, use exact matching
      filteredCourses = filteredCourses.filter((course: any) => 
        course.title.toLowerCase().includes(queryLower) ||
        course.description.toLowerCase().includes(queryLower) ||
        course.skills.some((skill: any) => skill.toLowerCase().includes(queryLower)) ||
        course.id.toLowerCase().includes(queryLower)
      )
    }
  }
  
  // Apply term filter if provided - use the term directly from the database
  if (filters.term) {
    console.log(`🔍 Demo data: Applying term filter: "${filters.term}"`)
    
    // Use the term directly as it appears in the database
    console.log(`🔍 Demo data: Filtering for courses offered in term: ${filters.term}`)
    
    // Filter by terms_offered
    filteredCourses = filteredCourses.filter((course: any) => 
      course.terms_offered && 
      filters.term &&
      course.terms_offered.includes(filters.term)
    )
  }
  
  if (filters.dept && filters.dept.length > 0) {
    filteredCourses = filteredCourses.filter((course: any) => 
      filters.dept!.includes(course.dept)
    )
  }
  
  if (filters.level && filters.level.length > 0) {
    filteredCourses = filteredCourses.filter((course: any) => 
      filters.level!.includes(course.level)
    )
  }
  
  if (filters.skills && filters.skills.length > 0) {
    filteredCourses = filteredCourses.filter((course: any) => 
      course.skills.some((skill: any) => 
        filters.skills!.some((filterSkill: any) => 
          skill.toLowerCase().includes(filterSkill.toLowerCase()) ||
          filterSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    )
  }
  
  return filteredCourses.slice(0, limit)
}

// Calculate course recommendation score
export function calculateCourseScore(
  course: Course,
  profile: UserProfile,
  goalTags: string[]
): {
  score: number
  explanation: string[]
  counts_toward: string[]
  prereqs_met: boolean
  next_offered: string[]
  workload_score: number
} {
  let score = 0
  const explanation: string[] = []
  const counts_toward: string[] = []
  let prereqs_met = true
  const next_offered: string[] = []
  let workload_score = 5 // Default to medium workload
  
  // Goal match (0-40 points)
  const goalMatch = calculateGoalMatch(course, goalTags)
  score += goalMatch.score
  explanation.push(...goalMatch.explanations)
  
  // Program fit (0-15 points)
  const programFit = calculateProgramFit(course, profile)
  score += programFit.score
  explanation.push(...programFit.explanations)
  
  // Prerequisites check (0-15 points)
  const prereqCheck = checkPrerequisites(course, profile.completed_courses)
  score += prereqCheck.score
  prereqs_met = prereqCheck.met
  explanation.push(...prereqCheck.explanations)
  
  // Term availability (0-10 points)
  const termCheck = checkTermAvailability(course, profile.current_term)
  score += termCheck.score
  next_offered.push(...termCheck.offered_terms)
  explanation.push(...termCheck.explanations)
  
  // Workload alignment (0-10 points)
  const workloadCheck = checkWorkloadAlignment(course, profile.constraints)
  score += workloadCheck.score
  explanation.push(...workloadCheck.explanations)
  
  // Calculate actual workload intensity score (1-10)
  if (course.workload) {
    const total = (course.workload.reading || 0) + (course.workload.assignments || 0) + (course.workload.projects || 0) + (course.workload.labs || 0)
    workload_score = Math.min(10, Math.max(1, Math.round(total / 2))) // Convert to 1-10 scale
  } else {
    workload_score = 5 // Default to medium workload if no data
  }
  
  // Level progression (0-10 points)
  const levelCheck = checkLevelProgression(course, profile.current_term)
  score += levelCheck.score
  explanation.push(...levelCheck.explanations)
  
  return {
    score: Math.round(score),
    explanation,
    counts_toward,
    prereqs_met,
    next_offered,
    workload_score
  }
}

function calculateGoalMatch(course: Course, goalTags: string[]): {
  score: number
  explanations: string[]
} {
  let score = 0
  const explanations: string[] = []
  
  const courseSkills = course.skills.map(s => s.toLowerCase())
  const goalSkills = goalTags.map(g => g.toLowerCase())
  
  const matches = courseSkills.filter(skill => 
    goalSkills.some(goal => 
      skill.includes(goal) || goal.includes(skill)
    )
  )
  
  if (matches.length > 0) {
    score = Math.min(40, matches.length * 10)
    explanations.push(`Matches your goals: ${matches.join(', ')}`)
  } else {
    explanations.push('Limited alignment with your stated goals')
  }
  
  return { score, explanations }
}

function calculateProgramFit(course: Course, profile: UserProfile): {
  score: number
  explanations: string[]
} {
  let score = 0
  const explanations: string[] = []
  
  // Check if this is a program-specific core course that shouldn't be recommended as an elective
  if (isProgramSpecificCoreCourse(course, profile.program)) {
    // Don't give any points to program-specific core courses for other programs
    return { score: 0, explanations: [`This is a core course for ${course.dept} students only`] }
  }
  
  // Check if course is from same department
  if (profile.program && course.dept === profile.program) {
    score += 10
    explanations.push(`Same department as your program (${profile.program})`)
  } else if (profile.program) {
    score += 5
    explanations.push(`Cross-departmental course (${course.dept})`)
  }
  
  // Check if course level is appropriate
  if (profile.current_term) {
    const termLevel = getTermLevel(profile.current_term)
    if (course.level >= termLevel) {
      score += 5
      explanations.push(`Appropriate level for ${profile.current_term}`)
    }
  }
  
  return { score, explanations }
}

// Helper function to identify program-specific core courses
export function isProgramSpecificCoreCourse(course: Course, userProgram?: string): boolean {
  if (!userProgram || !course.dept) return false
  
  console.log(`🔍 Checking if ${course.id} (${course.dept}) is program-specific for ${userProgram}`)
  
  // List of program-specific core courses that should not be recommended as electives
  const programSpecificCourses = {
    'BME': ['BME121', 'BME100', 'BME200', 'BME300', 'BME400'], // BME core courses
    'ECE': ['ECE100', 'ECE150', 'ECE200', 'ECE250', 'ECE300', 'ECE350', 'ECE400'], // ECE core courses
    'SE': ['SE101', 'SE102', 'SE200', 'SE300', 'SE400'], // SE core courses
    'CS': ['CS115', 'CS116', 'CS135', 'CS136', 'CS200', 'CS300', 'CS400'], // CS core courses
    'ME': ['ME100', 'ME200', 'ME300', 'ME400'], // ME core courses
    'MTE': ['MTE100', 'MTE121', 'MTE200', 'MTE300', 'MTE400'], // MTE core courses
    'SYDE': ['SYDE100', 'SYDE121', 'SYDE200', 'SYDE300', 'SYDE400'], // SYDE core courses
    'CIVE': ['CIVE100', 'CIVE200', 'CIVE300', 'CIVE400'], // CIVE core courses
    'CHE': ['CHE100', 'CHE200', 'CHE300', 'CHE400'], // CHE core courses
    'AE': ['AE100', 'AE123', 'AE200', 'AE300', 'AE400'], // AE core courses (AE123 is program-specific)
    'NANO': ['NANO100', 'NANO200', 'NANO300', 'NANO400'], // NANO core courses
    'ENVE': ['ENVE100', 'ENVE200', 'ENVE300', 'ENVE400'], // ENVE core courses
    'GEOE': ['GEOE100', 'GEOE200', 'GEOE300', 'GEOE400'], // GEOE core courses
    'MGT': ['MGT100', 'MGT200', 'MGT300', 'MGT400'], // MGT core courses
    'ARCH': ['ARCH100', 'ARCH200', 'ARCH300', 'ARCH400'] // ARCH core courses
  }
  
  // Check if the course is a core course for a different program
  for (const [program, coreCourses] of Object.entries(programSpecificCourses)) {
    if (program !== userProgram && coreCourses.includes(course.id)) {
      console.log(`❌ ${course.id} is a core course for ${program} (not ${userProgram})`)
      return true
    }
  }
  
  // Also check for 100-level courses that are typically program-specific
  if (course.level === 1 && course.dept !== userProgram) {
    console.log(`❌ ${course.id} is a 100-level course from ${course.dept} (not ${userProgram})`)
    return true
  }
  
  console.log(`✅ ${course.id} is not program-specific`)
  return false
}

function checkPrerequisites(course: Course, completedCourses: string[]): {
  score: number
  met: boolean
  explanations: string[]
  missing_prereqs: string[]
  met_prereqs: string[]
} {
  let score = 0
  const explanations: string[] = []
  const missing_prereqs: string[] = []
  const met_prereqs: string[] = []
  
  if (!course.prereqs || course.prereqs.trim() === '') {
    score = 15
    explanations.push('No prerequisites required')
    return { score, met: true, explanations, missing_prereqs, met_prereqs }
  }
  
  // Simple prerequisite checking - in reality, this would be more sophisticated
  const prereqList = course.prereqs.split(',').map(p => p.trim())
  
  prereqList.forEach(prereq => {
    const isMet = completedCourses.some(completed => 
      completed.toLowerCase().includes(prereq.toLowerCase())
    )
    
    if (isMet) {
      met_prereqs.push(prereq)
    } else {
      missing_prereqs.push(prereq)
    }
  })
  
  if (met_prereqs.length === prereqList.length) {
    score = 15
    explanations.push('All prerequisites met')
  } else if (met_prereqs.length > 0) {
    score = 8
    explanations.push(`Some prerequisites met (${met_prereqs.length}/${prereqList.length})`)
  } else {
    score = 0
    explanations.push(`Prerequisites not met: ${course.prereqs}`)
  }
  
  return { 
    score, 
    met: met_prereqs.length === prereqList.length, 
    explanations,
    missing_prereqs,
    met_prereqs
  }
}

function checkTermAvailability(course: Course, currentTerm?: string): {
  score: number
  offered_terms: string[]
  explanations: string[]
} {
  let score = 0
  const explanations: string[] = []
  const offered_terms: string[] = []
  
  if (!course.terms_offered || course.terms_offered.length === 0) {
    explanations.push('Term availability unknown')
    return { score: 5, offered_terms, explanations }
  }
  
  offered_terms.push(...course.terms_offered)
  
  if (currentTerm) {
    const nextTerm = getNextTerm(currentTerm)
    if (course.terms_offered.includes(nextTerm)) {
      score = 10
      explanations.push(`Offered next term (${nextTerm})`)
    } else if (course.terms_offered.length > 0) {
      score = 5
      explanations.push(`Offered in: ${course.terms_offered.join(', ')}`)
    }
  } else {
    score = 5
    explanations.push(`Offered in: ${course.terms_offered.join(', ')}`)
  }
  
  return { score, offered_terms, explanations }
}

function checkWorkloadAlignment(course: Course, constraints?: any): {
  score: number
  explanations: string[]
} {
  let score = 5 // Default medium
  const explanations: string[] = []
  
  if (!course.workload || !constraints?.max_workload) {
    return { score, explanations }
  }
  
  const totalWorkload = Object.values(course.workload).reduce((sum: number, val: any) => sum + val, 0)
  
  if (totalWorkload <= constraints.max_workload) {
    score = 10
    explanations.push(`Workload fits your constraints (${totalWorkload}/week)`)
  } else {
    score = 2
    explanations.push(`Heavy workload (${totalWorkload}/week)`)
  }
  
  return { score, explanations }
}

function checkLevelProgression(course: Course, currentTerm?: string): {
  score: number
  explanations: string[]
} {
  let score = 5 // Default
  const explanations: string[] = []
  
  if (!currentTerm) {
    return { score, explanations }
  }
  
  const termLevel = getTermLevel(currentTerm)
  
  if (course.level >= termLevel && course.level <= termLevel + 100) {
    score = 10
    explanations.push(`Appropriate level for ${currentTerm}`)
  } else if (course.level < termLevel) {
    score = 3
    explanations.push(`Lower level course (${course.level}xx)`)
  } else {
    score = 7
    explanations.push(`Advanced course (${course.level}xx)`)
  }
  
  return { score, explanations }
}

// Helper functions
function getTermLevel(term: string): number {
  const termMap: { [key: string]: number } = {
    '1A': 100, '1B': 100,
    '2A': 200, '2B': 200,
    '3A': 300, '3B': 300,
    '4A': 400, '4B': 400
  }
  return termMap[term] || 200
}

function getNextTerm(currentTerm: string): string {
  const termMap: { [key: string]: string } = {
    '1A': '1B', '1B': '2A',
    '2A': '2B', '2B': '3A',
    '3A': '3B', '3B': '4A',
    '4A': '4B', '4B': '4B'
  }
  return termMap[currentTerm] || '2A'
}

export async function searchCSECourses(
  classification?: 'A' | 'B' | 'C' | 'D',
  limit: number = 20
): Promise<any[]> {
  try {
    console.log('🔍 Searching CSE courses with classification:', classification)
    
    let query = supabase
      .from('courses')
      .select('*')
      .in('cse_classification', ['A', 'B', 'C', 'D'])
      .limit(limit * 2) // Get more results to shuffle from
    
    if (classification) {
      query = query.eq('cse_classification', classification)
    }
    
    const { data: courses, error } = await query
    
    if (error) {
      console.error('❌ Error fetching CSE courses:', error)
      return []
    }
    
    console.log('✅ Found', courses?.length || 0, 'CSE courses')
    
    // Shuffle results to provide variety
    const shuffledResults = [...(courses || [])].sort(() => Math.random() - 0.5)
    return shuffledResults.slice(0, limit)
    
  } catch (error) {
    console.error('❌ Error in searchCSECourses:', error)
    return []
  }
}
