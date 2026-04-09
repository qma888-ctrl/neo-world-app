import { NextRequest, NextResponse } from 'next/server';
import { getChapters } from '@/lib/notion';
import { Chapter } from 'A/lib/types';

export async function GET(req: NextRequest) {
  try {
    const chapters = await getChapters();
    return NextResponse.json(chapters);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
