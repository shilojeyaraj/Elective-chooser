import { NextRequest, NextResponse } from 'next/server'
import { ingestCourses, parseCoursesCSV } from '@/lib/data-ingestion'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const csvContent = await file.text()
    const courses = parseCoursesCSV(csvContent)
    
    await ingestCourses(courses)

    return NextResponse.json({
      message: `Successfully uploaded ${courses.length} courses`,
      count: courses.length
    })
  } catch (error) {
    console.error('Course upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload courses' },
      { status: 500 }
    )
  }
}
