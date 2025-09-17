import { supabaseAdmin } from './supabase'
import { getEmbedding } from './openai'
import { Course, Option, ElectiveDoc } from './types'
import { parse } from 'csv-parse/sync'

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
  console.log('🔧 Attempting to ingest courses with supabaseAdmin...')
  console.log('🔧 Service role key configured:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No')
  console.log('🔧 Service role key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...')
  console.log('🔧 Service role key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
  console.log('🔧 Supabase URL:', process.env.SUPABASE_URL)
  
  // Test the connection first
  console.log('🔧 Testing Supabase connection...')
  const { data: testData, error: testError } = await supabaseAdmin
    .from('courses')
    .select('count')
    .limit(1)
  
  if (testError) {
    console.error('❌ Connection test failed:', testError)
    throw new Error(`Failed to connect to Supabase: ${testError.message}`)
  }
  
  console.log('✅ Connection test passed, proceeding with upload...')
  
  // Debug: Log the first course to see what fields are being sent
  if (courses.length > 0) {
    console.log('🔍 First course data:', JSON.stringify(courses[0], null, 2))
    console.log('🔍 Course fields:', Object.keys(courses[0]))
  }

  // Filter out any fields that don't exist in the courses table schema
  const validCourseFields = [
    'id', 'title', 'dept', 'number', 'units', 'level', 'description', 'faculty', 'cse_classification',
    'terms_offered', 'prereqs', 'workload', 'skills', 'assessments', 'source_url'
  ]
  
  const filteredCourses = courses.map(course => {
    const filtered: any = {}
    validCourseFields.forEach(field => {
      if (course[field] !== undefined && course[field] !== null) {
        filtered[field] = course[field]
      }
    })
    return filtered
  })
  
  console.log('🔍 Filtered course fields:', Object.keys(filteredCourses[0] || {}))
  console.log('🔍 First filtered course:', JSON.stringify(filteredCourses[0], null, 2))

  const { error } = await supabaseAdmin
    .from('courses')
    .upsert(filteredCourses, { onConflict: 'id' })
  
  if (error) {
    console.error('❌ Supabase error details:', error)
    throw new Error(`Failed to ingest courses: ${error.message}`)
  }
  
  console.log('✅ Courses ingested successfully!')
}

// Option data ingestion
export async function ingestOptions(options: Option[]): Promise<void> {
  console.log('🔧 Attempting to ingest options with supabaseAdmin...')
  console.log('🔧 Service role key configured:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No')
  console.log('🔧 Service role key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...')
  console.log('🔧 Supabase URL:', process.env.SUPABASE_URL)
  
  const { error } = await supabaseAdmin
    .from('options')
    .upsert(options, { onConflict: 'id' })
  
  if (error) {
    console.error('❌ Supabase error details:', error)
    throw new Error(`Failed to ingest options: ${error.message}`)
  }
  
  console.log('✅ Options ingested successfully!')
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
  try {
    // Use proper CSV parser that handles quoted fields with newlines
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      quote: '"',
      escape: '"',
      relax_column_count: true,
      relax_quotes: true
    })
    
    return processCourseRecords(records)
  } catch (error) {
    console.warn('CSV parsing failed, trying manual parsing:', error)
    // Fallback to manual parsing if CSV parser fails
    return parseCoursesCSVManual(csvContent)
  }
}

function processCourseRecords(records: any[]): Course[] {
  
  const courses: Course[] = []
  
  for (const record of records) {
    const course: any = {}
    
    Object.keys(record).forEach(header => {
      const value = record[header]
      
      switch (header) {
        case 'terms_offered':
        case 'skills':
          try {
            if (value) {
              // Check if it's already a valid JSON array
              if (value.startsWith('[') && value.endsWith(']')) {
                const fixedValue = value.replace(/""/g, '"')
                course[header] = JSON.parse(fixedValue)
              } else {
                // If it's plain text, convert to array
                course[header] = [value]
              }
            } else {
              course[header] = []
            }
          } catch (error) {
            console.warn(`Failed to parse JSON for ${header}: ${value}`)
            // If parsing fails, treat as plain text and convert to array
            course[header] = value ? [value] : []
          }
          break
        case 'workload':
        case 'assessments':
          try {
            if (value) {
              // Check if it's already a valid JSON object
              if (value.startsWith('{') && value.endsWith('}')) {
                const fixedValue = value.replace(/""/g, '"')
                course[header] = JSON.parse(fixedValue)
              } else {
                // If it's plain text, create a default structure
                if (header === 'workload') {
                  course[header] = { reading: 2, assignments: 3, projects: 1, labs: 1 }
                } else {
                  course[header] = { midterm: 30, final: 40, assignments: 30 }
                }
              }
            } else {
              course[header] = undefined
            }
          } catch (error) {
            console.warn(`Failed to parse JSON for ${header}: ${value}`)
            // If parsing fails, create a default structure
            if (header === 'workload') {
              course[header] = { reading: 2, assignments: 3, projects: 1, labs: 1 }
            } else {
              course[header] = { midterm: 30, final: 40, assignments: 30 }
            }
          }
          break
        case 'units':
        case 'level':
        case 'gpa':
          course[header] = value ? parseFloat(value) : undefined
          break
        default:
          course[header] = 
          course[header] = value || undefined
      }
    })
    
    courses.push(course as Course)
  }
  
  return courses
}

function parseCoursesCSVManual(csvContent: string): Course[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const courses: Course[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Simple regex to split by comma but respect quoted fields
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
    const course: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index] ? values[index].replace(/^"|"$/g, '') : ''
      course[header] = processCourseField(header, value)
    })
    
    courses.push(course as Course)
  }
  
  return courses
}

function processCourseField(header: string, value: string): any {
  switch (header) {
    case 'terms_offered':
    case 'skills':
      try {
        if (value) {
          if (value.startsWith('[') && value.endsWith(']')) {
            const fixedValue = value.replace(/""/g, '"')
            return JSON.parse(fixedValue)
          } else {
            return [value]
          }
        }
        return []
      } catch (error) {
        console.warn(`Failed to parse JSON for ${header}: ${value}`)
        return value ? [value] : []
      }
    case 'workload':
    case 'assessments':
      try {
        if (value) {
          if (value.startsWith('{') && value.endsWith('}')) {
            const fixedValue = value.replace(/""/g, '"')
            return JSON.parse(fixedValue)
          } else {
            if (header === 'workload') {
              return { reading: 2, assignments: 3, projects: 1, labs: 1 }
            } else {
              return { midterm: 30, final: 40, assignments: 30 }
            }
          }
        }
        if (header === 'workload') {
          return { reading: 2, assignments: 3, projects: 1, labs: 1 }
        } else {
          return { midterm: 30, final: 40, assignments: 30 }
        }
      } catch (error) {
        console.warn(`Failed to parse JSON for ${header}: ${value}`)
        if (header === 'workload') {
          return { reading: 2, assignments: 3, projects: 1, labs: 1 }
        } else {
          return { midterm: 30, final: 40, assignments: 30 }
        }
      }
    case 'number':
    case 'units':
    case 'level':
      return value ? parseFloat(value) : undefined
    default:
      return value || undefined
  }
}

export function parseOptionsCSV(csvContent: string): Option[] {
  try {
    // Use proper CSV parser that handles quoted fields with newlines
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      quote: '"',
      escape: '"',
      relax_column_count: true,
      relax_quotes: true
    })
    
    return processOptionRecords(records)
  } catch (error) {
    console.warn('CSV parsing failed, trying manual parsing:', error)
    // Fallback to manual parsing if CSV parser fails
    return parseOptionsCSVManual(csvContent)
  }
}

function processOptionRecords(records: any[]): Option[] {
  
  const options: Option[] = []
  
  for (const record of records) {
    const option: any = {}
    
    Object.keys(record).forEach(header => {
      const value = record[header]
      
      switch (header) {
        case 'required_courses':
        case 'selective_rules':
          try {
            if (value) {
              // Check if it's already a valid JSON array/object
              if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
                const fixedValue = value.replace(/""/g, '"')
                option[header] = JSON.parse(fixedValue)
              } else {
                // If it's plain text, convert to array
                option[header] = [value]
              }
            } else {
              option[header] = undefined
            }
          } catch (error) {
            console.warn(`Failed to parse JSON for ${header}: ${value}`)
            // If parsing fails, treat as plain text and convert to array
            option[header] = value ? [value] : undefined
          }
          break
        default:
          option[header] = value || undefined
      }
    })
    
    options.push(option as Option)
  }
  
  return options
}

function parseOptionsCSVManual(csvContent: string): Option[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const options: Option[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Simple regex to split by comma but respect quoted fields
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
    const option: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index] ? values[index].replace(/^"|"$/g, '') : ''
      option[header] = processOptionField(header, value)
    })
    
    options.push(option as Option)
  }
  
  return options
}

function processOptionField(header: string, value: string): any {
  switch (header) {
    case 'required_courses':
    case 'selective_rules':
      try {
        if (value) {
          if (value.startsWith('[') && value.endsWith(']')) {
            const fixedValue = value.replace(/""/g, '"')
            return JSON.parse(fixedValue)
          } else if (value.startsWith('{') && value.endsWith('}')) {
            const fixedValue = value.replace(/""/g, '"')
            return JSON.parse(fixedValue)
          } else {
            return [value]
          }
        }
        return []
      } catch (error) {
        console.warn(`Failed to parse JSON for ${header}: ${value}`)
        return value ? [value] : []
      }
    case 'min_units':
    case 'max_units':
      return value ? parseFloat(value) : undefined
    default:
      return value || undefined
  }
}
