import { cookies } from 'next/headers';
import { env, getDb } from './db';

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

const COOKIE = 'p2m_session';
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100_000;

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, , salt, hash] = stored.split('$');
  if (scheme !== 'pbkdf2' || !salt || !hash) return false;
  return timingSafeEqual(await derive(password, fromBase64(salt)), hash);
}

function sessionSecret(): string {
  const secret = env().SESSION_SECRET;
  if (secret) return secret;
  // Development fallback so the site still runs before secrets are configured.
  return 'pronostics-2m-dev-secret-change-me';
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toBase64(new Uint8Array(signature)).replace(/=+$/, '');
}

/** Secure cookies require HTTPS, which the local dev server does not use. */
function secureCookies(): boolean {
  return process.env.NODE_ENV !== 'development';
}

export async function createSession(userId: number): Promise<void> {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  const token = `${payload}.${await sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, '', {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

async function readSessionUserId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [rawId, rawExpires, signature] = parts;
  const payload = `${rawId}.${rawExpires}`;
  if (!timingSafeEqual(await sign(payload), signature)) return null;
  const expires = Number(rawExpires);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await readSessionUserId();
  if (id === null) return null;
  try {
    const db = await getDb();
    const user = await db
      .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?1')
      .bind(id)
      .first<User>();
    return user ?? null;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/** Creates the admin account declared in the environment, once. */
export async function ensureAdminAccount(): Promise<void> {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = env();
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  const db = await getDb();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await db
    .prepare('SELECT id FROM users WHERE email = ?1')
    .bind(email)
    .first<{ id: number }>();
  if (existing) {
    await db.prepare("UPDATE users SET role = 'admin' WHERE id = ?1").bind(existing.id).run();
    return;
  }
  await db
    .prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?1, ?2, ?3, 'admin')",
    )
    .bind('Admin', email, await hashPassword(ADMIN_PASSWORD))
    .run();
}
