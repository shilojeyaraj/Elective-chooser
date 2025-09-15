import { supabaseAdmin } from './supabase'
import { getEmbedding } from './openai'
import { Course, Option, ElectiveDoc } from './types'

// Text extraction utilities
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // This would use pypdf or similar in a real implementation
  // For now, return placeholder
  return "PDF text extraction not implemented yet"
}

export async function extractTextFromHTML(html: string): Promise<string> {
  // This would use trafilatura or similar in a real implementation
  // For now, return placeholder
  return "HTML text extraction not implemented yet"
}

// Course data ingestion
export async function ingestCourses(courses: Course[]): Promise<void> {
  const { error } = await supabaseAdmin
    .from('courses')
    .upsert(courses, { onConflict: 'id' })
  
  if (error) {
    throw new Error(`Failed to ingest courses: ${error.message}`)
  }
}

// Option data ingestion
export async function ingestOptions(options: Option[]): Promise<void> {
  const { error } = await supabaseAdmin
    .from('options')
    .upsert(options, { onConflict: 'id' })
  
  if (error) {
    throw new Error(`Failed to ingest options: ${error.message}`)
  }
}

// Document chunking and embedding for RAG
export function chunkText(text: string, chunkSize: number = 1200, overlap: number = 150): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunk = text.slice(start, end)
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.')
      const lastNewline = chunk.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)
      
      if (breakPoint > start + chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1)
      }
    }
    
    chunks.push(chunk.trim())
    start = start + chunk.length - overlap
  }
  
  return chunks.filter(chunk => chunk.length > 50) // Filter out very short chunks
}

// Process and store document chunks with embeddings
export async function processDocument(
  text: string,
  sourceUrl: string,
  courseId?: string,
  optionId?: string
): Promise<void> {
  const chunks = chunkText(text)
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = await getEmbedding(chunk)
    
    const { error } = await supabaseAdmin
      .from('elective_docs')
      .insert({
        course_id: courseId,
        option_id: optionId,
        text: chunk,
        source_url: sourceUrl,
        chunk_id: i,
        embedding: embedding
      })
    
    if (error) {
      console.error(`Failed to insert chunk ${i}:`, error)
    }
  }
}

// CSV parsing utilities
export function parseCoursesCSV(csvContent: string): Course[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const courses: Course[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const course: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index]
      
      switch (header) {
        case 'terms_offered':
        case 'skills':
          course[header] = JSON.parse(value)
          break
        case 'workload':
        case 'assessments':
          course[header] = value ? JSON.parse(value) : undefined
          break
        case 'units':
        case 'level':
        case 'gpa':
          course[header] = value ? parseFloat(value) : undefined
          break
        default:
          course[header] = value || undefined
      }
    })
    
    courses.push(course as Course)
  }
  
  return courses
}

export function parseOptionsCSV(csvContent: string): Option[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const options: Option[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const option: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index]
      
      switch (header) {
        case 'required_courses':
        case 'selective_rules':
          option[header] = value ? JSON.parse(value) : undefined
          break
        default:
          option[header] = value || undefined
      }
    })
    
    options.push(option as Option)
  }
  
  return options
}
