import { NextRequest, NextResponse } from 'next/server';
import { createDraftRecord, listRecordsByOwner, toPublicRecord } from '@/lib/server-letters';
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
  const owner = resolveOwner(req);
  const rec = createDraftRecord(body, owner.id);
  return attachOwner(NextResponse.json({ id: rec.id, version: rec.version }), owner);
}
