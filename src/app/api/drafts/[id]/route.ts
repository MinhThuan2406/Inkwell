import { NextRequest, NextResponse } from 'next/server';
import {
  deleteRecord,
  getRecord,
  toPublicRecord,
  updateDraftRecord,
} from '@/lib/server-letters';
import { attachOwner, isValidId, readJson, resolveOwner } from '@/lib/server-security';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const rec = isValidId(id) ? getRecord(id) : null;
  if (!rec) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (rec.status === 'sent') {
    return NextResponse.json({ id: rec.id, status: rec.status });
  }
  return NextResponse.json(toPublicRecord(rec));
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const existing = getRecord(id);
  if (existing?.status === 'sent') {
    return NextResponse.json({ error: 'already_sent' }, { status: 409 });
  }
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const owner = resolveOwner(req);
  if (existing?.ownerId && existing.ownerId !== owner.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const rec = updateDraftRecord(id, body, owner.id);
  return attachOwner(NextResponse.json({ id: rec.id, version: rec.version }), owner);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const existing = getRecord(id);
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (existing.status === 'sent') {
    return NextResponse.json({ error: 'already_sent' }, { status: 409 });
  }
  const owner = resolveOwner(req);
  if (existing.ownerId && existing.ownerId !== owner.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  deleteRecord(id);
  return new NextResponse(null, { status: 204 });
}
