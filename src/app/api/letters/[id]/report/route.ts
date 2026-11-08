import { NextRequest, NextResponse } from 'next/server';
import { reportLetterRecord } from '@/lib/server-letters';
import { isValidId, readJson } from '@/lib/server-security';

const REPORT_REASONS = new Set(['spam', 'abuse', 'other']);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const body = await readJson(req);
  const reason = REPORT_REASONS.has(body?.reason) ? body?.reason : 'other';
  const ok = reportLetterRecord(id, reason);
  if (!ok) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
