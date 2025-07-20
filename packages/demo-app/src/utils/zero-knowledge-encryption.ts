// Encryption functions for zero-knowledge secret management
import { toUint8Array, fromUint8Array } from 'js-base64';

export async function encryptWithPassword(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('logto_encryption_salt'),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBuffer);

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return fromUint8Array(combined, true);
}

export async function decryptWithPassword(
  encryptedData: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const combined = toUint8Array(encryptedData);

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('logto_encryption_salt'),
        iterations: 100_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

    const result = decoder.decode(decrypted);

    return result;
  } catch {
    throw new Error('Failed to decrypt with password');
  }
}
