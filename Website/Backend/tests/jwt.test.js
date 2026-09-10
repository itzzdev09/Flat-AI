import test from 'node:test';
import assert from 'node:assert/strict';

// Imported at module scope, i.e. evaluated before any of the env setup below.
// That is the whole point: server.js loads these modules through its own import
// list and only calls dotenv.config() afterwards, so anything jwt.js reads at
// module-evaluation time is necessarily unset.
import {
  createSignedToken,
  getDefaultExpiresInSeconds,
  signToken,
  verifyToken,
  getSessionMetadataFromPayload,
} from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

// Deliberately set *after* the imports above.
process.env.JWT_SECRET = 'test-secret-set-after-module-evaluation';

test('regression: the secret is read per call, not at module load', () => {
  // Before the fix this threw 'JWT_SECRET is not configured', because jwt.js
  // captured process.env.JWT_SECRET into a const while it was still undefined.
  const { token, session } = createSignedToken({ id: 'u1', email: 'u1@example.com' });
  assert.ok(token.split('.').length === 3);
  assert.equal(verifyToken(token).email, 'u1@example.com');
  assert.ok(session.expiresAt);
});

test('a missing secret is still reported clearly', () => {
  const saved = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  try {
    assert.throws(() => signToken({ id: 'u1' }), /JWT_SECRET is not configured/);
  } finally {
    process.env.JWT_SECRET = saved;
  }
});

test('expiry is also resolved per call', () => {
  const saved = process.env.JWT_EXPIRES_IN_SECONDS;
  try {
    process.env.JWT_EXPIRES_IN_SECONDS = '60';
    assert.equal(getDefaultExpiresInSeconds(), 60);

    process.env.JWT_EXPIRES_IN_SECONDS = 'not-a-number';
    assert.equal(getDefaultExpiresInSeconds(), 60 * 60 * 24 * 7, 'falls back to one week');

    process.env.JWT_EXPIRES_IN_SECONDS = '-5';
    assert.equal(getDefaultExpiresInSeconds(), 60 * 60 * 24 * 7, 'rejects non-positive values');
  } finally {
    if (saved === undefined) delete process.env.JWT_EXPIRES_IN_SECONDS;
    else process.env.JWT_EXPIRES_IN_SECONDS = saved;
  }
});

test('a tampered payload is rejected', () => {
  const token = signToken({ id: 'u1', email: 'u1@example.com' });
  const [header, , signature] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ id: 'admin', exp: 4102444800 })).toString('base64url');
  assert.throws(() => verifyToken(`${header}.${forged}.${signature}`), /Invalid token signature/);
});

test('a truncated signature is rejected without a length error', () => {
  // crypto.timingSafeEqual throws a RangeError on differing lengths, which used
  // to surface to the client instead of a clean signature error.
  assert.throws(() => verifyToken('aa.bb.cc'), /Invalid token signature/);
  assert.throws(() => verifyToken('only-one-part'), /Invalid token/);
  assert.throws(() => verifyToken(''), /Invalid token/);
  assert.throws(() => verifyToken(undefined), /Invalid token/);
});

test('an expired token is rejected', () => {
  const token = signToken({ id: 'u1' }, -1);
  assert.throws(() => verifyToken(token), /Token expired/);
});

test('session metadata is derived from the payload', () => {
  const now = Math.floor(Date.now() / 1000);
  assert.equal(getSessionMetadataFromPayload(null), null);
  assert.equal(getSessionMetadataFromPayload({ iat: now }), null);
  assert.equal(getSessionMetadataFromPayload({ iat: now, exp: now + 100 }).expiresInSeconds, 100);
});

test('verifyPassword round-trips and rejects malformed stored hashes', () => {
  const stored = hashPassword('Passw0rd!23');
  assert.equal(verifyPassword('Passw0rd!23', stored), true);
  assert.equal(verifyPassword('wrong', stored), false);

  // Accounts written by older code can carry hashes in other shapes. These must
  // read as "wrong password", not throw out of the login handler as a 500.
  for (const bad of [undefined, null, '', 'garbage', '120000:onlysalt', ':::', '0:salt:abcd']) {
    assert.equal(verifyPassword('Passw0rd!23', bad), false, `expected false for ${JSON.stringify(bad)}`);
  }
});
