import { NextRequest, NextResponse } from 'next/server'
import {
  fetchWorldRuleById,
  updateWorldRule,
} from '@/lib/notion'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rule = await fetchWorldRuleById(params.id)

    if (!rule) {
      return NextResponse.json(
        { error: 'World rule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(rule)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch world rule' },
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
    const success = await updateWorldRule(params.id, body)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update world rule' },
        { status: 500 }
      )
    }

    const updated = await fetchWorldRuleById(params.id)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update world rule' },
      { status: 500 }
    )
  }
}
