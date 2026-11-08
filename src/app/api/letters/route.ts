import { NextRequest, NextResponse } from 'next/server';
import { createSentLetterRecord, listRecordsByOwner, toPublicRecord } from '@/lib/server-letters';
import { attachOwner, readJson, resolveOwner } from '@/lib/server-security';

export async function GET(req: NextRequest) {
  const owner = resolveOwner(req);
  const items = owner.isNew ? [] : listRecordsByOwner(owner.id).map(toPublicRecord);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (!body.doc?.text || !String(body.doc.text).trim()) {
    return NextResponse.json({ error: 'empty' }, { status: 400 });
  }
  if (body.openAt) {
    const openTime = new Date(body.openAt).getTime();
    if (!Number.isFinite(openTime) || openTime <= Date.now()) {
      return NextResponse.json({ error: 'open_at_past' }, { status: 400 });
    }
  }
  const { password } = body;
  if (password !== undefined && password !== null && password !== '') {
    if (
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 128 ||
      !password.trim()
    ) {
      return NextResponse.json({ error: 'bad_password' }, { status: 400 });
    }
  }
  const owner = resolveOwner(req);
  const rec = createSentLetterRecord(body, owner.id);
  return attachOwner(NextResponse.json({ id: rec.id }), owner);
}
