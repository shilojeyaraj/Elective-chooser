import { NextResponse } from 'next/server'
import { ingestCourses } from '@/lib/data-ingestion'
import { parseTechnicalElectivesCSV } from '@/lib/technical-electives'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const csvContent = await file.text()
    console.log('📁 Technical Electives CSV content length:', csvContent.length)

    const { courses, courseOptionMaps } = parseTechnicalElectivesCSV(csvContent)
    console.log('📊 Parsed technical electives:', courses.length)
    console.log('📊 Course-option mappings:', courseOptionMaps.length)

    await ingestCourses(courses)

    return NextResponse.json({ 
      message: 'Technical electives ingested successfully!', 
      coursesCount: courses.length,
      mappingsCount: courseOptionMaps.length
    })
  } catch (error: any) {
    console.error('❌ Technical electives upload error:', error)
    return NextResponse.json({ error: `Failed to ingest technical electives: ${error.message}` }, { status: 500 })
  }
}
