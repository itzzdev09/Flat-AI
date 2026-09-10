import crypto from 'crypto';

const base64Url = (input) => Buffer.from(input).toString('base64url');

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

/**
 * Read the signing secret at call time, not at module load.
 *
 * server.js calls dotenv.config() in its own top-level body, but ES modules are
 * evaluated before the importing module's body runs. Capturing process.env here
 * at import time therefore always saw `undefined` and made every signup, login
 * and protected request fail with "JWT_SECRET is not configured", no matter what
 * the .env file contained.
 */
const requireSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
};

/** Resolved per call for the same reason as the secret. */
export const getDefaultExpiresInSeconds = () => {
  const parsed = Number.parseInt(process.env.JWT_EXPIRES_IN_SECONDS ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_EXPIRES_IN_SECONDS;
};

const sign = (encodedHeader, encodedPayload) => crypto
  .createHmac('sha256', requireSecret())
  .update(`${encodedHeader}.${encodedPayload}`)
  .digest('base64url');

const buildSessionMetadata = (issuedAt, expiresInSeconds) => ({
  expiresInSeconds,
  expiresAt: new Date((issuedAt + expiresInSeconds) * 1000).toISOString(),
});

export const createSignedToken = (payload, expiresInSeconds = getDefaultExpiresInSeconds()) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(body));

  return {
    token: `${encodedHeader}.${encodedPayload}.${sign(encodedHeader, encodedPayload)}`,
    session: buildSessionMetadata(now, expiresInSeconds),
  };
};

export const signToken = (payload, expiresInSeconds = getDefaultExpiresInSeconds()) =>
  createSignedToken(payload, expiresInSeconds).token;

export const getSessionMetadataFromPayload = (payload) => {
  if (!payload?.exp) {
    return null;
  }

  const issuedAt = payload.iat || Math.floor(Date.now() / 1000);
  const expiresInSeconds = Math.max(0, payload.exp - issuedAt);
  return buildSessionMetadata(issuedAt, expiresInSeconds);
};

/**
 * Constant-time compare that tolerates length differences.
 *
 * crypto.timingSafeEqual throws a RangeError when the buffers differ in length,
 * so a truncated signature used to surface as that error text instead of a clean
 * "Invalid token signature".
 */
const safeEqual = (a, b) => {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const verifyToken = (token) => {
  const [encodedHeader, encodedPayload, signature] = String(token || '').split('.');
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Invalid token');
  }

  if (!safeEqual(signature, sign(encodedHeader, encodedPayload))) {
    throw new Error('Invalid token signature');
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid token');
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
};
