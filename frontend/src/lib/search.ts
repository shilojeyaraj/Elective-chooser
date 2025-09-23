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
    return getFallbackCourses(query, limit)
  }
  
  if (!testData || testData.length === 0) {
    console.log('📚 No courses in database, using fallback data')
    return getFallbackCourses(query, limit)
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
  
  // Apply term filter if provided
  if (filters.term) {
    console.log(`🔍 Applying term filter: "${filters.term}"`)
    searchQuery = searchQuery.contains('terms_offered', [filters.term])
  }
  
  // Apply department filter if provided
  if (filters.dept && filters.dept.length > 0) {
    searchQuery = searchQuery.in('dept', filters.dept)
  }
  
  // Execute the query
  const { data, error } = await searchQuery
  
  if (error) {
    console.error('❌ Search query error:', error)
    return getFallbackCourses(query, limit)
  }
  
  console.log('📚 Search result:', { found: data?.length || 0, query })
  if (data && data.length > 0) {
    console.log('📚 Sample courses found:', data.slice(0, 3).map(c => ({ id: c.id, title: c.title, dept: c.dept })))
  }
  
  // If no results, try a broader search
  if (!data || data.length === 0) {
    console.log('🔍 No results found, trying broader search...')
    const { data: broadData, error: broadError } = await supabase
      .from('courses')
      .select('*')
      .limit(limit)
    
    if (!broadError && broadData && broadData.length > 0) {
      console.log('📚 Broad search found:', broadData.length, 'courses')
      return broadData
    }
    
    // Final fallback
    return getFallbackCourses(query, limit)
  }
  
  return data || []
}

// Fallback course data when database is unavailable
function getFallbackCourses(query: string, limit: number): Course[] {
  console.log('📚 Using fallback course data for query:', query)
  
  const fallbackCourses: Course[] = [
    {
      id: 'CS246',
      title: 'Data Structures and Data Management',
      description: 'Introduction to data structures and algorithms',
      dept: 'CS',
      level: 2,
      number: 246,
      units: 0.5,
      terms_offered: ['2A', '2B', '3A', '3B'],
      skills: ['programming', 'data structures', 'algorithms'],
      workload: { reading: 2, assignments: 1, projects: 0, labs: 0 }
    },
    {
      id: 'CS348',
      title: 'Introduction to Human-Computer Interaction',
      description: 'Design and evaluation of user interfaces',
      dept: 'CS',
      level: 3,
      number: 348,
      units: 0.5,
      terms_offered: ['3A', '3B', '4A', '4B'],
      skills: ['ui design', 'user experience', 'interface design'],
      workload: { reading: 2, assignments: 1, projects: 0, labs: 0 }
    },
    {
      id: 'ECE380',
      title: 'Software Engineering',
      description: 'Software development processes and methodologies',
      dept: 'ECE',
      level: 3,
      number: 380,
      units: 0.5,
      terms_offered: ['3A', '3B', '4A', '4B'],
      skills: ['software engineering', 'project management', 'development'],
      workload: { reading: 3, assignments: 1, projects: 0, labs: 0 }
    },
    {
      id: 'MTE544',
      title: 'Autonomous Mobile Robots',
      description: 'Design and control of autonomous mobile robots',
      dept: 'MTE',
      level: 4,
      number: 544,
      units: 0.5,
      terms_offered: ['4A', '4B'],
      skills: ['robotics', 'autonomous systems', 'control'],
      workload: { reading: 3, assignments: 0, projects: 1, labs: 0 }
    },
    {
      id: 'CS486',
      title: 'Introduction to Artificial Intelligence',
      description: 'Fundamental concepts in artificial intelligence',
      dept: 'CS',
      level: 4,
      number: 486,
      units: 0.5,
      terms_offered: ['4A', '4B'],
      skills: ['artificial intelligence', 'machine learning', 'algorithms'],
      workload: { reading: 3, assignments: 1, projects: 0, labs: 0 }
    },
    {
      id: 'ECE457A',
      title: 'Co-operative and Adaptive Algorithms',
      description: 'Advanced algorithms for cooperative systems',
      dept: 'ECE',
      level: 4,
      number: 457,
      units: 0.5,
      terms_offered: ['4A', '4B'],
      skills: ['algorithms', 'cooperative systems', 'optimization'],
      workload: { reading: 3, assignments: 1, projects: 0, labs: 0 }
    },
    {
      id: 'ME360',
      title: 'Introduction to Control Systems',
      description: 'Fundamentals of control system design',
      dept: 'ME',
      level: 3,
      number: 360,
      units: 0.5,
      terms_offered: ['3A', '3B', '4A', '4B'],
      skills: ['control systems', 'feedback', 'dynamics'],
      workload: { reading: 2, assignments: 1, projects: 0, labs: 1 }
    },
    {
      id: 'CHE322',
      title: 'Numerical Methods for Process Analysis and Design',
      description: 'Numerical methods for chemical engineering',
      dept: 'CHE',
      level: 3,
      number: 322,
      units: 0.5,
      terms_offered: ['3A', '3B'],
      skills: ['numerical methods', 'process design', 'simulation'],
      workload: { reading: 2, assignments: 1, projects: 0, labs: 1 }
    }
  ]
  
  // Filter based on query if provided
  if (query && query.trim()) {
    const cleanQuery = query.toLowerCase()
    return fallbackCourses
      .filter(course => 
        course.title.toLowerCase().includes(cleanQuery) ||
        (course.description && course.description.toLowerCase().includes(cleanQuery)) ||
        course.skills.some(skill => skill.includes(cleanQuery))
      )
      .slice(0, limit)
  }
  
  return fallbackCourses.slice(0, limit)
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
      // For CSE queries, show courses that match CSE themes
      filteredCourses = filteredCourses.filter((course: any) => 
        course.title.toLowerCase().includes(queryLower) ||
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
      )
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
  workload_score = workloadCheck.score
  explanation.push(...workloadCheck.explanations)
  
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

function checkPrerequisites(course: Course, completedCourses: string[]): {
  score: number
  met: boolean
  explanations: string[]
} {
  let score = 0
  const explanations: string[] = []
  
  if (!course.prereqs) {
    score = 15
    explanations.push('No prerequisites required')
    return { score, met: true, explanations }
  }
  
  // Simple prerequisite checking - in reality, this would be more sophisticated
  const prereqList = course.prereqs.split(',').map(p => p.trim())
  const metPrereqs = prereqList.filter(prereq => 
    completedCourses.some(completed => 
      completed.toLowerCase().includes(prereq.toLowerCase())
    )
  )
  
  if (metPrereqs.length === prereqList.length) {
    score = 15
    explanations.push('All prerequisites met')
  } else if (metPrereqs.length > 0) {
    score = 8
    explanations.push(`Some prerequisites met (${metPrereqs.length}/${prereqList.length})`)
  } else {
    score = 0
    explanations.push(`Prerequisites not met: ${course.prereqs}`)
  }
  
  return { 
    score, 
    met: metPrereqs.length === prereqList.length, 
    explanations 
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
