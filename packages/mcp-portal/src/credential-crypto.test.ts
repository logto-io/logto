import { randomBytes } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  CredentialKeyError,
  decryptCredential,
  encryptCredential,
  parseCredentialKey,
} from './credential-crypto.js';

const key = randomBytes(32);

describe('parseCredentialKey', () => {
  it('accepts a base64 encoded 32-byte key', () => {
    expect(parseCredentialKey(key.toString('base64'))).toEqual(key);
  });

  it('refuses a missing key', () => {
    expect(() => parseCredentialKey()).toThrow(CredentialKeyError);
    expect(() => parseCredentialKey('')).toThrow(CredentialKeyError);
  });

  it('refuses a key that is not 32 bytes', () => {
    expect(() => parseCredentialKey(randomBytes(16).toString('base64'))).toThrow(
      CredentialKeyError
    );
  });
});

describe('encryptCredential and decryptCredential', () => {
  it('round-trips a credential', () => {
    const stored = encryptCredential('secret-token', key);

    expect(decryptCredential(stored, key)).toBe('secret-token');
  });

  it('never stores the plaintext', () => {
    const stored = encryptCredential('secret-token', key);

    expect(stored).not.toContain('secret-token');
  });

  it('uses a fresh IV, so the same credential encrypts differently each time', () => {
    const first = encryptCredential('secret-token', key);
    const second = encryptCredential('secret-token', key);

    expect(first).not.toBe(second);
  });

  it('refuses to decrypt with a different key', () => {
    const stored = encryptCredential('secret-token', key);

    expect(() => decryptCredential(stored, randomBytes(32))).toThrow();
  });

  it('refuses a value that was changed after encryption', () => {
    const [version, iv, tag, body] = encryptCredential('secret-token', key).split('.');
    // Random bytes of the same length: the GCM tag no longer matches, so decryption must fail.
    const tampered = randomBytes(Buffer.from(body ?? '', 'base64').length).toString('base64');

    expect(() => decryptCredential([version, iv, tag, tampered].join('.'), key)).toThrow();
  });

  it('refuses a malformed value', () => {
    expect(() => decryptCredential('not-a-credential', key)).toThrow(CredentialKeyError);
    expect(() => decryptCredential('v2.a.b.c', key)).toThrow(CredentialKeyError);
  });
});
