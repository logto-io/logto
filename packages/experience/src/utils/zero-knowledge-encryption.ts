/**
 * Zero-knowledge encryption utilities for client-side secret management.
 * These utilities handle password splitting, key derivation, and encryption/decryption
 * operations using the Web Crypto API.
 */

import { uint8ArrayToBase64, base64ToUint8Array } from 'uint8array-extras';

function parseJsonWebKey(jwkString: string): JsonWebKey {
  // We assume the string contains a valid JWK since it's coming from our own key generation
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(jwkString);
}

/**
 * Split a password into two derived keys: one for server authentication and one for client encryption.
 * Uses PBKDF2 for key derivation with different salts.
 */
export async function splitPassword(
  password: string
): Promise<{ serverPassword: string; clientPassword: string }> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Generate deterministic salts based on the purpose
  const serverSalt = encoder.encode('logto_server_password_salt');
  const clientSalt = encoder.encode('logto_client_password_salt');

  // Import the password as a CryptoKey
  const baseKey = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, [
    'deriveBits',
  ]);

  // Derive server password
  const serverBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: serverSalt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  // Derive client password
  const clientBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: clientSalt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  // Convert to base64 strings
  const serverPassword = uint8ArrayToBase64(new Uint8Array(serverBits));
  const clientPassword = uint8ArrayToBase64(new Uint8Array(clientBits));

  return { serverPassword, clientPassword };
}

/**
 * Generate a secure random secret string.
 */
export function generateSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return uint8ArrayToBase64(array);
}

/**
 * Encrypt data using AES-GCM with a password-derived key.
 */
export async function encryptWithPassword(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from password
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

  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBuffer);

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return uint8ArrayToBase64(combined);
}

/**
 * Decrypt data using AES-GCM with a password-derived key.
 */
export async function decryptWithPassword(
  encryptedData: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Decode from base64
  const combined = base64ToUint8Array(encryptedData);

  // Extract IV and encrypted data
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  // Derive key from password
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

  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

  return decoder.decode(decrypted);
}

/**
 * Generate an RSA key pair for asymmetric encryption.
 */
export async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Export keys to JWK format
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

  return {
    publicKey: JSON.stringify(publicKeyJwk),
    privateKey: JSON.stringify(privateKeyJwk),
  };
}

/**
 * Derive an app-specific secret from a base secret using HKDF.
 * This ensures each application gets a unique secret derived from the user's base secret.
 */
export async function deriveAppSecret(baseSecret: string, appId: string): Promise<string> {
  const encoder = new TextEncoder();

  // Convert base secret from base64 to bytes
  const secretBytes = base64ToUint8Array(baseSecret);

  // Import the base secret as key material
  const keyMaterial = await crypto.subtle.importKey('raw', secretBytes, 'HKDF', false, [
    'deriveKey',
  ]);

  // Derive app-specific key using HKDF
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: encoder.encode('logto_app_secret_derivation'),
      info: encoder.encode(appId), // Use app ID as context info
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Export the derived key as raw bytes
  const derivedKeyBytes = await crypto.subtle.exportKey('raw', derivedKey);

  // Convert to base64 string for consistent format
  return uint8ArrayToBase64(new Uint8Array(derivedKeyBytes));
}

/**
 * Encrypt data with an RSA public key.
 */
export async function encryptWithPublicKey(data: string, publicKeyJwk: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Import the public key
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    parseJsonWebKey(publicKeyJwk),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );

  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, dataBuffer);

  return uint8ArrayToBase64(new Uint8Array(encrypted));
}

/**
 * Decrypt data with an RSA private key.
 */
export async function decryptWithPrivateKey(
  encryptedData: string,
  privateKeyJwk: string
): Promise<string> {
  const decoder = new TextDecoder();

  // Decode from base64
  const encrypted = base64ToUint8Array(encryptedData);

  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    parseJsonWebKey(privateKeyJwk),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );

  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, encrypted);

  return decoder.decode(decrypted);
}
