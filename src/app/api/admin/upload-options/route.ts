import { NextRequest, NextResponse } from 'next/server'
import { ingestOptions, parseOptionsCSV } from '@/lib/data-ingestion'

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
    const options = parseOptionsCSV(csvContent)
    
    await ingestOptions(options)

    return NextResponse.json({
      message: `Successfully uploaded ${options.length} options`,
      count: options.length
    })
  } catch (error) {
    console.error('Options upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload options' },
      { status: 500 }
    )
  }
}
