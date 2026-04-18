export const SESSION_COOKIE_NAME = 'cms_session';
export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 8;

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}

interface SessionPayload {
  sub: string;
  email: string;
  role: string;
  name?: string | null;
  exp: number;
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'local-dev-insecure-change-me';
}

function encodeBase64Url(input: string) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf8').toString('base64url');
  }

  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(input: string) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'base64url').toString('utf8');
  }

  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  return atob(padded);
}

function bytesToBase64Url(bytes: Uint8Array) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }

  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getAuthSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function sign(value: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(user: SessionUser, maxAge = DEFAULT_SESSION_MAX_AGE) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionUser | null> {
  if (!token) {
    return null;
  }

  const [payloadPart, signaturePart] = token.split('.');

  if (!payloadPart || !signaturePart) {
    return null;
  }

  const expectedSignature = await sign(payloadPart);
  if (expectedSignature !== signaturePart) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as SessionPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
