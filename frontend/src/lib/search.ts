import { supabase } from './supabase'
import { getEmbedding } from './openai'
import { Course, CourseRecommendation, SearchFilters, UserProfile } from './types'

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
  let supabaseQuery = supabase
    .from('courses')
    .select('*')
    .limit(limit)
  
  // Apply text search
  if (query) {
    supabaseQuery = supabaseQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    )
  }
  
  // Apply filters
  if (filters.term) {
    // Use the correct JSONB operator for array contains
    supabaseQuery = supabaseQuery.filter('terms_offered', 'cs', `["${filters.term}"]`)
  }
  
  if (filters.dept && filters.dept.length > 0) {
    supabaseQuery = supabaseQuery.in('dept', filters.dept)
  }
  
  if (filters.level && filters.level.length > 0) {
    supabaseQuery = supabaseQuery.in('level', filters.level)
  }
  
  if (filters.skills && filters.skills.length > 0) {
    // Use the correct JSONB operator for array intersection
    supabaseQuery = supabaseQuery.filter('skills', 'cs', `["${filters.skills.join('","')}"]`)
  }
  
  if (filters.max_workload) {
    // Assuming workload is stored as a composite score
    supabaseQuery = supabaseQuery.lte('workload->total', filters.max_workload)
  }
  
  const { data, error } = await supabaseQuery
  
  if (error) {
    console.error('Course search error:', error)
    return []
  }
  
  return data || []
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
