import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// Upstream credentials are encrypted at rest with AES-256-GCM. The key is 32 random bytes, supplied
// by the deployment as base64. Without a valid key, credentials cannot be stored or used.

export class CredentialKeyError extends Error {}

const algorithm = 'aes-256-gcm';
const version = 'v1';
const ivLength = 12;

/** Reads the deployment's encryption key. Throws when it is missing or not 32 bytes. */
export const parseCredentialKey = (raw?: string): Uint8Array => {
  if (!raw) {
    throw new CredentialKeyError('The MCP portal encryption key is not configured');
  }

  const key = Buffer.from(raw, 'base64');

  if (key.length !== 32) {
    throw new CredentialKeyError('The MCP portal encryption key must be 32 bytes, base64 encoded');
  }

  return key;
};

/** Encrypts a credential. The output carries its own IV and tag, so it can be stored as one string. */
export const encryptCredential = (plaintext: string, key: Uint8Array): string => {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, key, iv);
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [version, iv, tag, body].map((part) => part.toString('base64')).join('.');
};

/** Decrypts a stored credential. Throws when the value was tampered with or the key is wrong. */
export const decryptCredential = (stored: string, key: Uint8Array): string => {
  const parts = stored.split('.');

  if (parts.length !== 4 || parts[0] !== version) {
    throw new CredentialKeyError('The stored credential is malformed');
  }

  const [, iv, tag, body] = parts.map((part) => Buffer.from(part, 'base64'));

  if (!iv || iv.length !== ivLength || !tag || !body) {
    throw new CredentialKeyError('The stored credential is malformed');
  }

  const decipher = createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
};
