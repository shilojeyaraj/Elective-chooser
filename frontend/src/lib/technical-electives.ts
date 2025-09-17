import { parse } from 'csv-parse/sync'
import { Course, Option, CourseOptionMap } from './types'

// Technical Electives parsing
export function parseTechnicalElectivesCSV(csvContent: string): {
  courses: Course[]
  courseOptionMaps: CourseOptionMap[]
} {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      quote: '"',
      escape: '"',
      relax_column_count: true,
      relax_quotes: true
    })
    
    return processTechnicalElectiveRecords(records)
  } catch (error) {
    console.warn('CSV parsing failed, trying manual parsing:', error)
    return parseTechnicalElectivesCSVManual(csvContent)
  }
}

function processTechnicalElectiveRecords(records: any[]): {
  courses: Course[]
  courseOptionMaps: CourseOptionMap[]
} {
  const courses: Course[] = []
  const courseOptionMaps: CourseOptionMap[] = []
  const seenCourseIds = new Set<string>()
  
  for (const record of records) {
    const course: any = {}
    
    Object.keys(record).forEach(header => {
      const value = record[header]
      course[header] = processTechnicalElectiveField(header, value)
    })
    
    // Skip if no course code
    if (!course.Course_Code) {
      continue
    }
    
    // Create course ID from course code (remove spaces)
    const courseId = course.Course_Code.replace(/\s+/g, '')
    
    // Ensure courseId is not empty
    if (!courseId) {
      continue
    }
    
    // Only process each course once
    if (!seenCourseIds.has(courseId)) {
      seenCourseIds.add(courseId)
      
      // Convert to standard course format
      const standardCourse: Course = {
        id: courseId,
        title: course.Course_Title || '',
        dept: extractDepartment(course.Course_Code),
        number: extractCourseNumber(course.Course_Code),
        units: 0.5, // Assume 0.5 units for technical electives
        level: extractCourseLevel(course.Course_Code),
        description: `Technical Elective - ${course.Program || 'Engineering'}`,
        faculty: 'Engineering',
        terms_offered: ['F', 'W', 'S'], // Assume all terms
        prereqs: generateTechnicalElectivePrereqs(course.Course_Code, course.Program),
        skills: [course.Bucket || 'technical', course.Helps_Fulfill_Option || 'general'],
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
        source_url: `https://uwaterloo.ca/undergraduate-studies/courses/${courseId.toLowerCase()}`
      }
      
      courses.push(standardCourse)
    }
    
    // Create course-option mapping
    if (course.Helps_Fulfill_Option) {
      const optionId = generateOptionId(course.Program, course.Helps_Fulfill_Option)
      
      const courseOptionMap: CourseOptionMap = {
        option_id: optionId,
        course_id: courseId,
        rule: {
          bucket: course.Bucket || 'general',
          weight: getBucketWeight(course.Bucket)
        }
      }
      
      courseOptionMaps.push(courseOptionMap)
    }
  }
  
  return { courses, courseOptionMaps }
}

function parseTechnicalElectivesCSVManual(csvContent: string): {
  courses: Course[]
  courseOptionMaps: CourseOptionMap[]
} {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const courses: Course[] = []
  const courseOptionMaps: CourseOptionMap[] = []
  const seenCourseIds = new Set<string>()
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
    const course: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index] ? values[index].replace(/^"|"$/g, '') : ''
      course[header] = processTechnicalElectiveField(header, value)
    })
    
    if (!course.Course_Code) continue
    
    const courseId = course.Course_Code.replace(/\s+/g, '')
    
    // Ensure courseId is not empty
    if (!courseId) continue
    
    if (!seenCourseIds.has(courseId)) {
      seenCourseIds.add(courseId)
      
      const standardCourse: Course = {
        id: courseId,
        title: course.Course_Title || '',
        dept: extractDepartment(course.Course_Code),
        number: extractCourseNumber(course.Course_Code),
        units: 0.5,
        level: extractCourseLevel(course.Course_Code),
        description: `Technical Elective - ${course.Program || 'Engineering'}`,
        faculty: 'Engineering',
        terms_offered: ['F', 'W', 'S'],
        prereqs: generateTechnicalElectivePrereqs(course.Course_Code, course.Program),
        skills: [course.Bucket || 'technical', course.Helps_Fulfill_Option || 'general'],
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
        source_url: `https://uwaterloo.ca/undergraduate-studies/courses/${courseId.toLowerCase()}`
      }
      
      courses.push(standardCourse)
    }
    
    if (course.Helps_Fulfill_Option) {
      const optionId = generateOptionId(course.Program, course.Helps_Fulfill_Option)
      
      const courseOptionMap: CourseOptionMap = {
        option_id: optionId,
        course_id: courseId,
        rule: {
          bucket: course.Bucket || 'general',
          weight: getBucketWeight(course.Bucket)
        }
      }
      
      courseOptionMaps.push(courseOptionMap)
    }
  }
  
  return { courses, courseOptionMaps }
}

function processTechnicalElectiveField(header: string, value: string): any {
  switch (header) {
    case 'Required_Total':
      return value ? parseInt(value) : 0
    default:
      return value || undefined
  }
}

function extractDepartment(courseCode: string): string {
  const match = courseCode.match(/^([A-Z]+)/)
  return match ? match[1] : 'ENG'
}

function extractCourseNumber(courseCode: string): number {
  const match = courseCode.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

function extractCourseLevel(courseCode: string): number {
  const match = courseCode.match(/(\d+)/)
  if (match) {
    const num = parseInt(match[1])
    if (num >= 100 && num < 200) return 100
    if (num >= 200 && num < 300) return 200
    if (num >= 300 && num < 400) return 300
    if (num >= 400 && num < 500) return 400
    if (num >= 500 && num < 600) return 500
  }
  return 300 // Default for technical electives
}

function generateTechnicalElectivePrereqs(courseCode: string, program: string): string {
  const level = extractCourseLevel(courseCode)
  
  if (level === 300) {
    return 'Completion of second year or permission of instructor'
  } else if (level === 400) {
    return 'Completion of third year or permission of instructor'
  } else if (level === 500) {
    return 'Completion of fourth year or permission of instructor'
  }
  
  return 'Prerequisites vary - check course calendar'
}

function generateOptionId(program: string, option: string): string {
  // Create a consistent option ID from program and option
  const programSlug = program.toLowerCase().replace(/\s+/g, '-')
  const optionSlug = option.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `${programSlug}-${optionSlug}`
}

function getBucketWeight(bucket: string): number {
  // Assign weights based on bucket priority
  if (bucket?.includes('List 1')) return 3
  if (bucket?.includes('List 2')) return 2
  if (bucket?.includes('List 3')) return 1
  return 1
}
