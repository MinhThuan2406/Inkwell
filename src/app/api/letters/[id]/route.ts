import { NextRequest, NextResponse } from 'next/server';
import { getRecord, toPublicRecord } from '@/lib/server-letters';
import { isUnlockTokenValid, isValidId } from '@/lib/server-security';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const rec = isValidId(id) ? getRecord(id) : null;
  if (!rec || rec.hidden) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const isUnlocked =
    !rec.password ||
    isUnlockTokenValid(id, rec.password, req.cookies.get(`dear_unlock_${id}`)?.value);
  if (!isUnlocked) {
    return NextResponse.json({ id: rec.id, passwordRequired: true });
  }

  const parentRec = rec.replyTo ? getRecord(rec.replyTo) : null;
  const replyFrom = parentRec?.doc?.from || parentRec?.from || null;

  return NextResponse.json({
    ...toPublicRecord(rec),
    passwordRequired: false,
    replyFrom,
  });
}
