export interface Course {
  id: string
  title: string
  dept: string
  units: number
  level: number
  description?: string
  faculty?: string
  cse_classification?: string
  terms_offered: string[]
  prereqs?: string
  workload?: {
    reading: number
    assignments: number
    projects: number
    labs: number
  }
  skills: string[]
  assessments?: {
    midterm?: number
    final?: number
    assignments?: number
    projects?: number
    labs?: number
  }
  source_url?: string
  created_at?: string
  updated_at?: string
}

export interface Option {
  id: string
  name: string
  program?: string
  faculty?: string
  required_courses: string[]
  selective_rules?: {
    selectNfrom: string[]
    N: number
  }
  description?: string
  source_url?: string
  created_at?: string
  updated_at?: string
}

export interface CourseOptionMap {
  option_id: string
  course_id: string
  rule?: {
    bucket?: string
    weight?: number
  }
}

export interface UserProfile {
  user_id: string
  username?: string
  program?: string
  current_term?: string
  completed_courses: string[]
  planned_courses: string[]
  additional_comments?: string
  gpa?: number
  interests: string[]
  goal_tags: string[]
  constraints?: {
    max_workload?: number
    morning_labs?: boolean
    schedule_preferences?: string[]
  }
  created_at?: string
  updated_at?: string
}

export interface ChatSession {
  id: string
  user_id: string
  title?: string
  goal_snapshot?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens?: number
  citations?: Array<{
    url: string
    text: string
  }>
  created_at?: string
}

export interface ElectiveDoc {
  id: string
  course_id?: string
  option_id?: string
  text: string
  source_url?: string
  chunk_id?: number
  embedding?: number[]
  created_at?: string
}

export interface CourseRecommendation {
  course: Course
  score: number
  explanation: string[]
  counts_toward: string[]
  prereqs_met: boolean
  next_offered: string[]
  workload_score: number
}

export interface SearchFilters {
  term?: string
  option_id?: string
  dept?: string[]
  level?: number[]
  skills?: string[]
  max_workload?: number
}
