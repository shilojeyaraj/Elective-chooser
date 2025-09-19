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

// Course search with filters
export async function searchCourses(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20
): Promise<Course[]> {
  console.log('🔍 searchCourses called with:', { query, filters, limit })
  console.log('🔍 NEW VERSION - Updated search function is running!')
  
        // Check if this is a CSE elective query (only when explicitly mentioned)
        const isCSEQuery = query.toLowerCase().includes('cse') || 
                           query.toLowerCase().includes('complementary studies')
  
  if (isCSEQuery) {
    console.log('🔍 Detected CSE query, searching courses table for CSE electives')
    try {
      // Search for courses that are CSE electives (typically 100-200 level non-engineering courses)
      const { data: cseCourses, error: cseError } = await supabase
        .from('courses')
        .select('*')
        .or('title.ilike.%ethics%,title.ilike.%society%,title.ilike.%sustainability%,title.ilike.%social%,title.ilike.%environment%')
        .limit(limit)
      
      if (!cseError && cseCourses && cseCourses.length > 0) {
        console.log('✅ Found CSE electives:', cseCourses.length)
        return cseCourses
      } else {
        console.log('⚠️ No CSE electives found in courses table')
      }
    } catch (error) {
      console.log('⚠️ CSE search failed:', error)
    }
  }
  
  // Skip vector search for now - use text search directly
  console.log('🔍 Skipping vector search, using text search directly')
  
  // Fallback to text search
  let supabaseQuery = supabase
    .from('courses')
    .select('*')
    .limit(limit)
  
  // Apply text search
  if (query) {
    // Extract key terms from the query for better matching
    const keyTerms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters including commas
      .split(/\s+/)
      .filter(term => 
        term.length > 2 && 
        !['what', 'can', 'i', 'choose', 'to', 'do', 'want', 'the', 'and', 'or', 'for', 'with', 'about', 'from', 'are', 'is', 'in', 'on', 'at', 'by', 'of', 'a', 'an', 'havent', 'taken', 'any', 'give', 'me', 'please'].includes(term)
      )
      .slice(0, 3) // Take top 3 key terms
    
    console.log('🔍 Extracted key terms:', keyTerms)
    
    if (keyTerms.length > 0) {
      // Build search conditions for each key term
      const searchConditions = keyTerms.map(term => {
        const cleanTerm = term.replace(/[%_]/g, '\\$&')
        return `title.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%,skills.cs.["${cleanTerm}"]`
      }).join(',')
      
      supabaseQuery = supabaseQuery.or(searchConditions)
    } else {
      // Fallback to searching for common elective terms
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%elective%,description.ilike.%elective%,title.ilike.%course%,description.ilike.%course%`
      )
    }
    
    // If no results found, try broader search terms
    if (keyTerms.includes('machine') || keyTerms.includes('learning')) {
      console.log('🔍 Adding AI/ML related search terms')
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%artificial%,title.ilike.%intelligence%,title.ilike.%ai%,title.ilike.%ml%,description.ilike.%artificial%,description.ilike.%intelligence%,description.ilike.%ai%,description.ilike.%ml%`
      )
    }
  }
  
  // Apply filters (but don't restrict by term - use it as guidance only)
  if (filters.term) {
    console.log('🔍 Term filter provided but not applied - showing courses for all terms')
    // Note: We don't filter by term to allow future course recommendations
  }
  
  if (filters.dept && filters.dept.length > 0) {
    supabaseQuery = supabaseQuery.in('dept', filters.dept)
  }
  
  if (filters.level && filters.level.length > 0) {
    supabaseQuery = supabaseQuery.in('level', filters.level)
  }
  
  if (filters.skills && filters.skills.length > 0) {
    console.log('🔍 Applying skills filter:', filters.skills)
    // Use the correct JSONB operator for array intersection
    supabaseQuery = supabaseQuery.filter('skills', 'cs', `["${filters.skills.join('","')}"]`)
  }
  
  if (filters.max_workload) {
    // Assuming workload is stored as a composite score
    supabaseQuery = supabaseQuery.lte('workload->total', filters.max_workload)
  }
  
  console.log('🔍 Executing database query...')
  console.log('🔍 Query details:', { query, filters, limit })
  
  // First, let's test if we can query the database at all
  const { data: testData, error: testError } = await supabase
    .from('courses')
    .select('id, title')
    .limit(3)
  
  console.log('🔍 Database connectivity test:', { 
    testFound: testData?.length || 0, 
    testError: testError?.message || 'None',
    sampleCourses: testData?.slice(0, 2).map(c => ({ id: c.id, title: c.title })) || []
  })
  
  const { data, error } = await supabaseQuery
  
  if (error) {
    console.error('❌ Course search error:', error)
    return []
  }
  
  console.log('📚 Database search result:', { found: data?.length || 0, query, filters })
  if (data && data.length > 0) {
    console.log('📚 Sample courses found:', data.slice(0, 3).map(c => ({ id: c.id, title: c.title })))
  }
  
  // If no data found in database, fall back to demo data
  if (!data || data.length === 0) {
    console.log('📚 No courses found in database, using demo data')
    const demoResults = filterDemoCourses(query, filters, limit)
    console.log('📚 Demo data results:', demoResults.length)
    return demoResults
  }
  
  console.log('✅ Database search returned', data.length, 'courses')
  return data || []
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
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(queryLower) ||
        course.description.toLowerCase().includes(queryLower) ||
        course.skills.some(skill => skill.toLowerCase().includes(queryLower)) ||
        course.id.toLowerCase().includes(queryLower) ||
        // Show courses that match CSE themes
        course.skills.some(skill => 
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
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(queryLower) ||
        course.description.toLowerCase().includes(queryLower) ||
        course.skills.some(skill => skill.toLowerCase().includes(queryLower)) ||
        course.id.toLowerCase().includes(queryLower) ||
        // Show courses that match common elective themes
        course.skills.some(skill => 
          ['programming', 'software', 'ai', 'robotics', 'data', 'algorithms', 'systems'].some(theme => 
            skill.toLowerCase().includes(theme)
          )
        )
      )
    } else {
      // For specific queries, use exact matching
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(queryLower) ||
        course.description.toLowerCase().includes(queryLower) ||
        course.skills.some(skill => skill.toLowerCase().includes(queryLower)) ||
        course.id.toLowerCase().includes(queryLower)
      )
    }
  }
  
  // Apply filters (but don't restrict by term - use it as guidance only)
  if (filters.term) {
    console.log('🔍 Demo data: Term filter provided but not applied - showing courses for all terms')
    // Note: We don't filter by term to allow future course recommendations
  }
  
  if (filters.dept && filters.dept.length > 0) {
    filteredCourses = filteredCourses.filter(course => 
      filters.dept!.includes(course.dept)
    )
  }
  
  if (filters.level && filters.level.length > 0) {
    filteredCourses = filteredCourses.filter(course => 
      filters.level!.includes(course.level)
    )
  }
  
  if (filters.skills && filters.skills.length > 0) {
    filteredCourses = filteredCourses.filter(course => 
      course.skills.some(skill => 
        filters.skills!.some(filterSkill => 
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
