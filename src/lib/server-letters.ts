import fs from 'fs';
import path from 'path';
import { generateId, hashPassword } from '@/lib/server-security';

const MAX_REPORTS = 100;

export interface StoredRecord {
  id: string;
  status: 'draft' | 'sent';
  doc: any;
  color: string;
  to: string;
  from: string;
  excerpt: string;
  openAt: string | null;
  replyTo: string | null;
  password?: string | null;
  ownerId?: string;
  version: number;
  views: number;
  lastViewedAt: string | null;
  sentAt: string | null;
  hidden?: boolean;
  reports?: Array<{ reason: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export type PublicRecord = Omit<StoredRecord, 'password' | 'ownerId' | 'reports'>;

type Store = Record<string, StoredRecord>;

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', '.data')
  : path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'letters.json');

function computeDerived(doc: any) {
  const color = doc?.envelope?.color || '#c9a67c';
  const to = typeof doc?.to === 'string' ? doc.to.trim() : '';
  const from = typeof doc?.from === 'string' ? doc.from.trim() : '';
  const rawText = typeof doc?.text === 'string' ? doc.text.trim().replace(/\s+/g, ' ') : '';
  const excerpt = rawText.length > 140 ? `${rawText.slice(0, 140)}…` : rawText;
  return { color, to, from, excerpt };
}

function normalizeRecord(rec: any): StoredRecord {
  const derived = computeDerived(rec.doc);
  return {
    ...rec,
    color: rec.color || derived.color,
    to: rec.to !== undefined ? rec.to : derived.to,
    from: rec.from !== undefined ? rec.from : derived.from,
    excerpt: rec.excerpt !== undefined ? rec.excerpt : derived.excerpt,
    openAt: rec.openAt ?? null,
    replyTo: rec.replyTo ?? null,
    views: rec.views ?? 0,
    lastViewedAt: rec.lastViewedAt ?? null,
    sentAt: rec.sentAt ?? (rec.status === 'sent' ? rec.updatedAt : null),
    hidden: Boolean(rec.hidden),
  };
}

function loadStore(): Store {
  const store: Store = Object.create(null);
  const targetFile = fs.existsSync(DATA_FILE)
    ? DATA_FILE
    : path.join(process.cwd(), '.data', 'letters.json');
  if (!fs.existsSync(targetFile)) return store;
  try {
    const raw = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    for (const [id, value] of Object.entries(raw)) {
      if (value && typeof value === 'object') store[id] = normalizeRecord(value);
    }
  } catch {
    return store;
  }
  return store;
}

function saveStore(store: Store): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tempFile, DATA_FILE);
}

export function toPublicRecord(rec: StoredRecord): PublicRecord {
  const { password: _password, ownerId: _ownerId, reports: _reports, ...publicRecord } = rec;
  return publicRecord;
}

export function getRecord(id: string): StoredRecord | null {
  return loadStore()[id] ?? null;
}

export function listRecordsByOwner(ownerId: string): StoredRecord[] {
  return Object.values(loadStore())
    .filter((rec) => rec.ownerId === ownerId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function createDraftRecord(body: any, ownerId: string): StoredRecord {
  const store = loadStore();
  const id = generateId();
  const now = new Date().toISOString();
  const rec: StoredRecord = {
    id,
    status: 'draft',
    doc: body.doc,
    ...computeDerived(body.doc),
    openAt: body.openAt || null,
    replyTo: body.replyTo || null,
    ownerId,
    version: 1,
    views: 0,
    lastViewedAt: null,
    sentAt: null,
    hidden: false,
    createdAt: now,
    updatedAt: now,
  };
  store[id] = rec;
  saveStore(store);
  return rec;
}

export function updateDraftRecord(id: string, body: any, ownerId: string): StoredRecord {
  const store = loadStore();
  const existing = store[id];
  const now = new Date().toISOString();
  const nextDoc = body.doc ?? existing?.doc;
  const rec: StoredRecord = {
    id,
    status: existing?.status ?? 'draft',
    doc: nextDoc,
    ...computeDerived(nextDoc),
    openAt: body.openAt !== undefined ? body.openAt || null : existing?.openAt ?? null,
    replyTo: body.replyTo !== undefined ? body.replyTo || null : existing?.replyTo ?? null,
    ownerId: existing?.ownerId ?? ownerId,
    version: (existing?.version ?? 0) + 1,
    views: existing?.views ?? 0,
    lastViewedAt: existing?.lastViewedAt ?? null,
    sentAt: existing?.sentAt ?? null,
    hidden: existing?.hidden ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  store[id] = rec;
  saveStore(store);
  return rec;
}

export function deleteRecord(id: string): boolean {
  const store = loadStore();
  if (!store[id]) return false;
  delete store[id];
  saveStore(store);
  return true;
}

export function createSentLetterRecord(body: any, ownerId: string): StoredRecord {
  const store = loadStore();
  const draft = typeof body.draftId === 'string' ? store[body.draftId] : undefined;
  const existing =
    draft?.status === 'draft' && (!draft.ownerId || draft.ownerId === ownerId) ? draft : undefined;
  const id = existing ? existing.id : generateId();
  const now = new Date().toISOString();
  const rec: StoredRecord = {
    id,
    status: 'sent',
    doc: body.doc,
    ...computeDerived(body.doc),
    openAt: body.openAt || null,
    replyTo: body.replyTo || null,
    password: body.password ? hashPassword(body.password) : null,
    ownerId: existing?.ownerId ?? ownerId,
    version: (existing?.version ?? 0) + 1,
    views: existing?.views ?? 0,
    lastViewedAt: existing?.lastViewedAt ?? null,
    sentAt: now,
    hidden: false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  store[id] = rec;
  saveStore(store);
  return rec;
}

export function incrementLetterViews(id: string): void {
  const store = loadStore();
  const rec = store[id];
  if (!rec) return;
  rec.views = (rec.views ?? 0) + 1;
  rec.lastViewedAt = new Date().toISOString();
  saveStore(store);
}

export function reportLetterRecord(id: string, reason: string): boolean {
  const store = loadStore();
  const rec = store[id];
  if (!rec) return false;
  const reports = rec.reports ?? [];
  if (reports.length < MAX_REPORTS) {
    reports.push({ reason, createdAt: new Date().toISOString() });
    rec.reports = reports;
    saveStore(store);
  }
  return true;
}
