import { NextRequest, NextResponse } from 'next/server';
import { getRecord } from '@/lib/server-letters';
import {
  clearFailedAttempts,
  clientIp,
  createUnlockToken,
  isProduction,
  isRateLimited,
  isValidId,
  readJson,
  recordFailedAttempt,
  verifyPassword,
} from '@/lib/server-security';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const rec = isValidId(id) ? getRecord(id) : null;
  if (!rec || rec.hidden) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (!rec.password) {
    return NextResponse.json({ ok: true });
  }

  const attemptKey = `${clientIp(req)}:${id}`;
  if (isRateLimited(attemptKey)) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429 });
  }

  const body = await readJson(req);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!verifyPassword(password, rec.password)) {
    recordFailedAttempt(attemptKey);
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }

  clearFailedAttempts(attemptKey);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(`dear_unlock_${id}`, createUnlockToken(id, rec.password), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
