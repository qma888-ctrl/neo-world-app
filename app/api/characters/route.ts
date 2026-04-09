import { NextRequest, NextResponse } from 'next/server'
import { fetchCharacters } from '@/lib/notion'

export async function GET(request: NextRequest) {
  try {
    const characters = await fetchCharacters()
    return NextResponse.json(characters)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}
