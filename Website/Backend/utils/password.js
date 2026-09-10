import crypto from 'crypto';

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${ITERATIONS}:${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  // A stored hash can be absent or malformed for accounts written by older code.
  // Returning false keeps that a normal "wrong credentials" answer instead of
  // throwing out of the login handler as a 500.
  const [iterations, salt, originalHash] = String(storedHash || '').split(':');
  const rounds = Number(iterations);
  if (!salt || !originalHash || !Number.isFinite(rounds) || rounds <= 0) {
    return false;
  }

  const hash = crypto
    .pbkdf2Sync(password, salt, rounds, KEY_LENGTH, DIGEST)
    .toString('hex');

  const actual = Buffer.from(hash, 'hex');
  const expected = Buffer.from(originalHash, 'hex');
  // timingSafeEqual throws when lengths differ, so guard before comparing.
  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
};
