import { NextRequest, NextResponse } from 'next/server'
import { fetchChapters } from '@/lib/notion'

export async function GET(request: NextRequest) {
  try {
    const chapters = await fetchChapters()
    return NextResponse.json(chapters)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    )
  }
}
