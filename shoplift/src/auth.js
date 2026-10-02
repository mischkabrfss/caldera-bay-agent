// Jetons signés HMAC : pas de base de données, impossible à falsifier sans la clé secrète.
const enc = new TextEncoder();
const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (text) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

// Secret du serveur (signature des sessions, poivre des mots de passe) :
// APP_SECRET s'il est défini, sinon un secret aléatoire généré une fois et gardé dans KV (aucune étape à faire).
let generated = null;
export function secretOf(env) {
  return env.APP_SECRET || generated || env.STRIPE_SECRET_KEY || 'shoplift-dev-only-secret';
}
export async function loadSecret(env) {
  if (env.APP_SECRET || generated || !env.DATA) return;
  let s = await env.DATA.get('app-secret');
  if (!s) {
    s = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    await env.DATA.put('app-secret', s);
    s = (await env.DATA.get('app-secret')) || s; // deux instances au tout premier démarrage : on garde celui qui est enregistré
  }
  generated = s;
}

async function key(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function sign(payload, secret) {
  const body = b64(enc.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(body));
  return `${body}.${b64(signature)}`;
}

export async function verify(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  try {
    const ok = await crypto.subtle.verify('HMAC', await key(secret), unb64(signature), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(unb64(body)));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
