import { NextRequest, NextResponse } from 'next/server'
import { parseCSEElectivesCSV } from '@/lib/cse-electives'
import { ingestCourses } from '@/lib/data-ingestion'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const csvContent = await file.text()
    console.log('📁 CSE Electives CSV content length:', csvContent.length)
    
    // Parse CSE electives CSV
    const courses = parseCSEElectivesCSV(csvContent)
    console.log('📊 Parsed CSE electives:', courses.length)
    
    if (courses.length === 0) {
      return NextResponse.json({ error: 'No valid courses found in CSV' }, { status: 400 })
    }

    // Ingest courses into database
    await ingestCourses(courses)
    
    return NextResponse.json({ 
      message: `✅ Successfully uploaded ${courses.length} CSE electives!`,
      count: courses.length
    })
    
  } catch (error) {
    console.error('CSE electives upload error:', error)
    return NextResponse.json(
      { error: `CSE electives upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
