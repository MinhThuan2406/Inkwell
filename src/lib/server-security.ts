import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const PRIMARY_OWNER_COOKIE = 'inkwell_owner';
const LEGACY_OWNER_COOKIE = 'dear_owner';
const OWNER_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const MAX_BODY_BYTES = 1_000_000;
const ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const ATTEMPT_TABLE_LIMIT = 5000;

export const isProduction = process.env.NODE_ENV === 'production';

interface Owner {
  id: string;
  isNew: boolean;
  shouldMigrate?: boolean;
}

const failedAttempts = new Map<string, { count: number; resetAt: number }>();

export function isValidId(id: string): boolean {
  return ID_PATTERN.test(id);
}

export function generateId(): string {
  return Array.from(randomBytes(12), (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join('');
}

export async function readJson(req: NextRequest): Promise<Record<string, any> | null> {
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return null;
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length);
  return timingSafeEqual(actual, expected);
}

export function createUnlockToken(id: string, storedPassword: string): string {
  return createHmac('sha256', storedPassword).update(id).digest('base64url');
}

export function isUnlockTokenValid(
  id: string,
  storedPassword: string,
  token: string | undefined
): boolean {
  if (!token) return false;
  const expected = Buffer.from(createUnlockToken(id, storedPassword));
  const actual = Buffer.from(token);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

export function isRateLimited(key: string): boolean {
  const entry = failedAttempts.get(key);
  return Boolean(entry && entry.resetAt > Date.now() && entry.count >= ATTEMPT_LIMIT);
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  if (failedAttempts.size >= ATTEMPT_TABLE_LIMIT) {
    for (const [k, entry] of failedAttempts) {
      if (entry.resetAt <= now) failedAttempts.delete(k);
    }
  }
  const entry = failedAttempts.get(key);
  if (!entry || entry.resetAt <= now) {
    failedAttempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearFailedAttempts(key: string): void {
  failedAttempts.delete(key);
}

export function resolveOwner(req: NextRequest): Owner {
  const inkwellOwner = req.cookies.get(PRIMARY_OWNER_COOKIE)?.value;
  if (inkwellOwner && OWNER_PATTERN.test(inkwellOwner)) {
    return { id: inkwellOwner, isNew: false };
  }

  const legacyOwner = req.cookies.get(LEGACY_OWNER_COOKIE)?.value;
  if (legacyOwner && OWNER_PATTERN.test(legacyOwner)) {
    return { id: legacyOwner, isNew: false, shouldMigrate: true };
  }

  return { id: randomBytes(24).toString('base64url'), isNew: true };
}

export function attachOwner(res: NextResponse, owner: Owner): NextResponse {
  if (owner.isNew || owner.shouldMigrate) {
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 365,
    };
    res.cookies.set(PRIMARY_OWNER_COOKIE, owner.id, cookieOptions);
    res.cookies.set(LEGACY_OWNER_COOKIE, owner.id, cookieOptions);
  }
  return res;
}

export function setAuthCookie(res: NextResponse, value: '0' | '1'): NextResponse {
  const cookieOptions = {
    path: '/',
    httpOnly: false,
    sameSite: 'lax' as const,
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 30,
  };
  res.cookies.set('inkwell_auth', value, cookieOptions);
  res.cookies.set('dear_auth', value, cookieOptions);
  return res;
}
