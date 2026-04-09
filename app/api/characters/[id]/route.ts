import { NextRequest, NextResponse } from 'next/server';
import { getCharacterById } from '@/lib/notion';
import { Character } from 'A/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: {id: string} }
) {
  try {
    const character = await getCharacterById(params.id);
    if (!character) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(character);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
