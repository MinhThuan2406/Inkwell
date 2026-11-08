import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/server-security';

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') ?? '/';
  const safeNext = /^\/(?![/\\])/.test(next) ? next : '/';
  return setAuthCookie(NextResponse.redirect(new URL(safeNext, req.url), 303), '1');
}
