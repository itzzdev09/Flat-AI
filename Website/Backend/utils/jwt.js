import crypto from 'crypto';

const base64Url = (input) => Buffer.from(input).toString('base64url');
const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret-change-me';
const parsedExpiry = Number.parseInt(process.env.JWT_EXPIRES_IN_SECONDS ?? '', 10);
export const DEFAULT_JWT_EXPIRES_IN_SECONDS = Number.isFinite(parsedExpiry) && parsedExpiry > 0
  ? parsedExpiry
  : 60 * 60 * 24 * 7;

const buildSessionMetadata = (issuedAt, expiresInSeconds) => ({
  expiresInSeconds,
  expiresAt: new Date((issuedAt + expiresInSeconds) * 1000).toISOString(),
});

export const createSignedToken = (payload, expiresInSeconds = DEFAULT_JWT_EXPIRES_IN_SECONDS) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return {
    token: `${encodedHeader}.${encodedPayload}.${signature}`,
    session: buildSessionMetadata(now, expiresInSeconds),
  };
};

export const signToken = (payload, expiresInSeconds = DEFAULT_JWT_EXPIRES_IN_SECONDS) =>
  createSignedToken(payload, expiresInSeconds).token;

export const getSessionMetadataFromPayload = (payload) => {
  if (!payload?.exp) {
    return null;
  }

  const issuedAt = payload.iat || Math.floor(Date.now() / 1000);
  const expiresInSeconds = Math.max(0, payload.exp - issuedAt);
  return buildSessionMetadata(issuedAt, expiresInSeconds);
};

export const verifyToken = (token) => {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Invalid token');
  }

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
};
