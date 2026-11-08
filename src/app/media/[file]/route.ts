import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MEDIA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'media')
  : path.join(process.cwd(), 'public', 'media');

const FILE_PATTERN = /^\d{13}-[a-z0-9]{8}\.(png|jpg|webp|svg|mp3|m4a|aac|ogg|wav)$/;

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!file || !FILE_PATTERN.test(file)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const filePath = path.join(MEDIA_DIR, file);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const ext = file.split('.').pop() || '';
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
