import { NextRequest, NextResponse } from 'next/server';
import { getChapterById } from '@/lib/notion';
import { Chapter } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {Try {\n      const chapter = await getChapterById(params.id);
\n      if (!chapter) {\n        return NextResponse.json({ error: 'Not found' }, { status: 404 });\n      }\n      return NextResponse.json(chapter);\n    } catch (error) {\n      return NextResponse.json(\n        { error: 'Internal server error' },\n        { status: 500 }\n      );\n    }\n  }
