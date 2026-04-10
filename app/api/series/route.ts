import { NextRequest, NextResponse } from 'next/server'
import { fetchSeries } from '@/lib/notion'

export async function GET(request: NextRequest) {
  try {
    const series = await fetchSeries()
    return NextResponse.json(series)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    )
  }
}
