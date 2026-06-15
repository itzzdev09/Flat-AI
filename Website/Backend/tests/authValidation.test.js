import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  normalizeEmail,
  normalizeName,
  validateLoginInput,
  validatePasswordChangeInput,
  validateProfileInput,
  validateSignupInput,
} from '../utils/validation.js';

test('normalizeEmail trims and lowercases', () => {
  assert.equal(normalizeEmail('  USER@Example.COM '), 'user@example.com');
});

test('isValidEmail rejects malformed emails', () => {
  assert.equal(isValidEmail('wrong-email'), false);
  assert.equal(isValidEmail('missing@domain'), false);
  assert.equal(isValidEmail('ok@example.com'), true);
});

test('normalizeName collapses extra spaces', () => {
  assert.equal(normalizeName('  Ada   Lovelace '), 'Ada Lovelace');
});

test('validateSignupInput catches edge cases', () => {
  assert.equal(validateSignupInput({ name: '', email: '', password: '' }).valid, false);
  assert.equal(validateSignupInput({ name: 'A', email: 'a@example.com', password: '123456' }).message, 'Name must be at least 2 characters');
  assert.equal(validateSignupInput({ name: 'Ada', email: 'wrong', password: '123456' }).message, 'Enter a valid email address');
  assert.equal(validateSignupInput({ name: 'Ada', email: 'ada@example.com', password: '123' }).message, 'Password must be at least 6 characters');
});

test('validateSignupInput returns normalized payload', () => {
  const result = validateSignupInput({ name: '  Ada   Lovelace ', email: ' ADA@Example.com ', password: 'secret12' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.payload, {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'secret12',
  });
});

test('validateLoginInput validates and normalizes login data', () => {
  assert.equal(validateLoginInput({ email: 'bad', password: 'secret12' }).message, 'Enter a valid email address');
  const result = validateLoginInput({ email: ' USER@Example.com ', password: 'secret12' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.payload, { email: 'user@example.com', password: 'secret12' });
});

test('validateProfileInput validates name and email updates', () => {
  assert.equal(validateProfileInput({ name: 'A', email: 'ok@example.com' }).message, 'Name must be at least 2 characters');
  assert.equal(validateProfileInput({ name: 'Ada', email: 'bad' }).message, 'Enter a valid email address');
  const result = validateProfileInput({ name: ' Ada ', email: ' ADA@example.com ' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.payload, { name: 'Ada', email: 'ada@example.com' });
});

test('validatePasswordChangeInput catches bad password changes', () => {
  assert.equal(validatePasswordChangeInput({ currentPassword: '', newPassword: '', confirmPassword: '' }).valid, false);
  assert.equal(validatePasswordChangeInput({ currentPassword: 'secret12', newPassword: '123', confirmPassword: '123' }).message, 'New password must be at least 6 characters');
  assert.equal(validatePasswordChangeInput({ currentPassword: 'secret12', newPassword: 'secret34', confirmPassword: 'secret35' }).message, 'New password and confirmation do not match');
  assert.equal(validatePasswordChangeInput({ currentPassword: 'secret12', newPassword: 'secret12', confirmPassword: 'secret12' }).message, 'New password must be different from the current password');
});
