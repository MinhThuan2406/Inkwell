import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateId, readJson } from '@/lib/server-security';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const FILE_PATTERN = /^\d{13}-[a-z0-9]{8}\.(png|jpg|webp|svg|mp3|m4a|aac|ogg|wav)$/;
const MEDIA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'media')
  : path.join(process.cwd(), 'public', 'media');

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
};

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: 'upload_init_failed' }, { status: 400 });
  }
  if (Number(body.size) > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 });
  }
  const ext = MIME_TO_EXT[body.mime] || 'webp';
  const fileName = `${Date.now()}-${generateId().slice(0, 8)}.${ext}`;
  return NextResponse.json({
    uploadUrl: `/api/upload?file=${encodeURIComponent(fileName)}`,
    publicUrl: `/media/${fileName}`,
  });
}

export async function PUT(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file');
  if (!file || !FILE_PATTERN.test(file)) {
    return NextResponse.json({ error: 'invalid_file' }, { status: 400 });
  }
  if (Number(req.headers.get('content-length') ?? 0) > MAX_UPLOAD_BYTES + 1024) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 });
  }
  try {
    const formData = await req.formData();
    const blob = formData.get('') as Blob | null;
    if (!blob) {
      return NextResponse.json({ error: 'missing_blob' }, { status: 400 });
    }
    if (blob.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'file_too_large' }, { status: 413 });
    }
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
    fs.writeFileSync(path.join(MEDIA_DIR, file), Buffer.from(await blob.arrayBuffer()), {
      flag: 'wx',
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      return NextResponse.json({ error: 'file_exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'upload_put_failed' }, { status: 500 });
  }
}
