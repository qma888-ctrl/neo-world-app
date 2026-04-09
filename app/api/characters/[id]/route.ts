import { NextRequest, NextResponse } from 'next/server'
import {
  fetchCharacterById,
  updateCharacter,
} from '@/lib/notion'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const character = await fetchCharacterById(params.id)

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(character)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const success = await updateCharacter(params.id, body)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update character' },
        { status: 500 }
      )
    }

    const updated = await fetchCharacterById(params.id)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    )
  }
}
