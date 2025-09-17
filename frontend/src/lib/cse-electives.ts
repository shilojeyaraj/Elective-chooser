import { parse } from 'csv-parse/sync'
import { Course } from './types'

// CSE Electives parsing
export function parseCSEElectivesCSV(csvContent: string): Course[] {
  try {
    // First, clean up the CSV content by removing extra quotes around entire rows
    const cleanedContent = csvContent.replace(/^"([^"]*)"$/gm, '$1')
    
    const records = parse(cleanedContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      quote: '"',
      escape: '"',
      relax_column_count: true,
      relax_quotes: true
    })
    
    return processCSEElectiveRecords(records)
  } catch (error) {
    console.warn('CSV parsing failed, trying manual parsing:', error)
    return parseCSEElectivesCSVManual(csvContent)
  }
}

function processCSEElectiveRecords(records: any[]): Course[] {
  const courses: Course[] = []
  const seenIds = new Set<string>()
  
  for (const record of records) {
    const course: any = {}
    
    Object.keys(record).forEach(header => {
      const value = record[header]
      course[header] = processCSEElectiveField(header, value)
    })
    
    // Skip if no course code or if we've already seen this ID
    if (!course.Course_Code || seenIds.has(course.Course_Code)) {
      continue
    }
    
    seenIds.add(course.Course_Code)
    
    // Convert CSE elective format to standard course format
    const standardCourse: Course = {
      id: course.Course_Code,
      title: course.Course_Name || '',
      dept: course.Subject_Code || '',
      number: extractCourseNumber(course.Course_Code),
      units: course.Units ? parseFloat(course.Units) : 0.5,
      level: extractCourseLevel(course.Course_Code),
      description: `CSE Elective - ${course.Category || 'General'}`,
      faculty: 'Engineering',
      cse_classification: course.List || 'A', // Extract classification from List column
      terms_offered: ['F', 'W', 'S'], // Assume all electives offered all terms
      prereqs: generatePrereqs(course.Course_Code, course.Subject_Code),
      skills: [course.Category || 'general'],
      workload: {
        reading: 2,
        assignments: 3,
        projects: 1,
        labs: 0
      },
      assessments: {
        midterm: 30,
        final: 40,
        assignments: 30
      },
      source_url: `https://uwaterloo.ca/undergraduate-studies/courses/${course.Course_Code.toLowerCase()}`
    }
    
    courses.push(standardCourse)
  }
  
  return courses
}

function parseCSEElectivesCSVManual(csvContent: string): Course[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const courses: Course[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
    const course: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index] ? values[index].replace(/^"|"$/g, '') : ''
      course[header] = processCSEElectiveField(header, value)
    })
    
    // Convert to standard course format
    const standardCourse: Course = {
      id: course.Course_Code || '',
      title: course.Course_Name || '',
      dept: course.Subject_Code || '',
      number: extractCourseNumber(course.Course_Code || ''),
      units: course.Units ? parseFloat(course.Units) : 0.5,
      level: extractCourseLevel(course.Course_Code || ''),
      description: `CSE Elective - ${course.Category || 'General'}`,
      faculty: 'Engineering',
      cse_classification: course.List || 'A',
      terms_offered: ['F', 'W', 'S'],
      prereqs: generatePrereqs(course.Course_Code || '', course.Subject_Code || ''),
      skills: [course.Category || 'general'],
      workload: {
        reading: 2,
        assignments: 3,
        projects: 1,
        labs: 0
      },
      assessments: {
        midterm: 30,
        final: 40,
        assignments: 30
      },
      source_url: `https://uwaterloo.ca/undergraduate-studies/courses/${course.Course_Code?.toLowerCase() || ''}`
    }
    
    courses.push(standardCourse)
  }
  
  return courses
}

function processCSEElectiveField(header: string, value: string): any {
  switch (header) {
    case 'Units':
      return value ? parseFloat(value) : 0.5
    case 'List':
      return value === 'EXCLUSION' ? 'excluded' : 'eligible'
    default:
      return value || undefined
  }
}

function extractCourseNumber(courseCode: string): number {
  const match = courseCode.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

function extractCourseLevel(courseCode: string): number {
  const match = courseCode.match(/(\d+)/)
  if (match) {
    const num = parseInt(match[1])
    if (num >= 100 && num < 200) return 100
    if (num >= 200 && num < 300) return 200
    if (num >= 300 && num < 400) return 300
    if (num >= 400 && num < 500) return 400
  }
  return 100
}

function generatePrereqs(courseCode: string, subjectCode: string): string {
  const courseNumber = extractCourseNumber(courseCode)
  const level = extractCourseLevel(courseCode)
  
  // Basic prerequisite logic based on course level
  if (level === 100) {
    return 'None'
  } else if (level === 200) {
    return 'Completion of first year or permission of instructor'
  } else if (level === 300) {
    return 'Completion of second year or permission of instructor'
  } else if (level === 400) {
    return 'Completion of third year or permission of instructor'
  }
  
  return 'Prerequisites vary - check course calendar'
}
