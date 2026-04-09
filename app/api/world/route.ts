import { NextRequest, NextResponse } from 'next/server'
import { fetchWorldRules } from '@/lib/notion'

export async function GET(request: NextRequest) {
  try {
    const rules = await fetchWorldRules()
    return NextResponse.json(rules)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch world rules' },
      { status: 500 }
    )
  }
}
