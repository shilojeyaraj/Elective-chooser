import { NextRequest, NextResponse } from 'next/server'
import { ingestCourses, ingestOptions, parseCoursesCSV, parseOptionsCSV } from '@/lib/data-ingestion'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.json')) {
      return NextResponse.json({ error: 'File must be a JSON file' }, { status: 400 })
    }

    const fileContent = await file.text()
    const jsonData = JSON.parse(fileContent)

    // Process the JSON data to extract courses and programs
    const courses = []
    const programs = []

    // Process each program
    for (const [programName, programData] of Object.entries(jsonData.programs || {})) {
      const program = programData as any
      
      // Create program entry
      programs.push({
        id: programName.toLowerCase().replace(/\s+/g, '-').replace('engineering', 'eng'),
        name: programName,
        program: program.degree || 'BASc',
        faculty: 'Engineering',
        description: `${programName} program requirements`,
        source_url: `https://uwaterloo.ca/engineering/undergraduate-studies/${programName.toLowerCase().replace(/\s+/g, '-')}`
      })

      // Process courses from all terms
      for (const [term, coursesList] of Object.entries(program.terms || {})) {
        for (const courseString of coursesList as string[]) {
          if (courseString && !courseString.startsWith('WKRPT') && !courseString.startsWith('COMMST') && courseString !== 'Approved Elective') {
            // Parse course string like "ECE 486 - Robot Dynamics and Control"
            const courseMatch = courseString.match(/^([A-Z]+)\s+(\d+)\s*-\s*(.+)$/)
            if (courseMatch) {
              const [, dept, number, title] = courseMatch
              const courseId = `${dept}${number}`
              
              // Check if course already exists
              if (!courses.find(c => c.id === courseId)) {
                const level = parseInt(number) < 200 ? 100 : 
                             parseInt(number) < 300 ? 200 : 
                             parseInt(number) < 400 ? 300 : 400

                // Extract skills from title
                const skills = []
                const titleLower = title.toLowerCase()
                if (titleLower.includes('robot') || titleLower.includes('robotics')) skills.push('robotics')
                if (titleLower.includes('control')) skills.push('control')
                if (titleLower.includes('machine learning') || titleLower.includes('ai')) skills.push('machine learning')
                if (titleLower.includes('software') || titleLower.includes('programming')) skills.push('software')
                if (titleLower.includes('hardware') || titleLower.includes('circuit')) skills.push('hardware')
                if (titleLower.includes('mechanics') || titleLower.includes('dynamics')) skills.push('mechanics')
                if (titleLower.includes('math') || titleLower.includes('calculus')) skills.push('mathematics')
                if (titleLower.includes('design')) skills.push('design')
                if (titleLower.includes('systems')) skills.push('systems')
                if (titleLower.includes('data')) skills.push('data')
                if (skills.length === 0) skills.push('general engineering')

                courses.push({
                  id: courseId,
                  title: title,
                  dept: dept,
                  number: parseInt(number),
                  units: 0.5,
                  level: level,
                  description: `Course from ${programName} program`,
                  terms_offered: ["F", "W"],
                  prereqs: '',
                  skills: skills,
                  workload: { reading: 2, assignments: 3, projects: 1, labs: 1 },
                  assessments: { midterm: 30, final: 40, assignments: 30 },
                  source_url: `https://uwaterloo.ca/engineering/undergraduate-studies/${programName.toLowerCase().replace(/\s+/g, '-')}`
                })
              }
            }
          }
        }
      }
    }

    console.log(`📊 Processing JSON: ${courses.length} courses, ${programs.length} programs`)

    // Upload courses
    if (courses.length > 0) {
      await ingestCourses(courses)
    }

    // Upload programs
    if (programs.length > 0) {
      await ingestOptions(programs)
    }

    return NextResponse.json({ 
      message: `Successfully uploaded ${courses.length} courses and ${programs.length} programs from JSON file` 
    })

  } catch (error) {
    console.error('JSON upload error:', error)
    return NextResponse.json({ 
      error: `Failed to process JSON file: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
