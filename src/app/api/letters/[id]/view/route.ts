import { NextRequest, NextResponse } from 'next/server';
import { incrementLetterViews } from '@/lib/server-letters';
import { isValidId } from '@/lib/server-security';

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  incrementLetterViews(id);
  return new NextResponse(null, { status: 204 });
}
