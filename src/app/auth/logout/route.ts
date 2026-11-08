import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/server-security';

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/?notice=signed_out', req.url), 303);
  return setAuthCookie(res, '0');
}
