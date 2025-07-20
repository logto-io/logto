/**
 * Encryption utilities for the demo app's zero-knowledge encryption implementation.
 * These utilities handle key pair generation and secret decryption.
 */

import { toUint8Array, fromUint8Array } from 'js-base64';

// Type definitions for better type safety
type JWKWithRequiredFields = {
  kty: string;
  n: string;
  e: string;
  d: string;
};

/**
 * Type guard to check if an object is a valid JWK
 */
function isValidJWK(object: unknown): object is JsonWebKey {
  return (
    typeof object === 'object' &&
    object !== null &&
    'kty' in object &&
    'n' in object &&
    'e' in object &&
    'd' in object
  );
}

/**
 * Safely decode base64 string to Uint8Array
 * We disable ESLint rules here as js-base64 types are not properly recognized
 */
function safeToUint8Array(data: string): Uint8Array {
  try {
    const result = toUint8Array(data);
    // Additional validation to ensure we got the expected type
    if (result instanceof Uint8Array) {
      return result;
    }
    throw new Error('Failed to decode base64 data');
  } catch {
    throw new Error('Failed to decode base64 data');
  }
}

/**
 * Safely encode Uint8Array to base64 string
 * We disable ESLint rules here as js-base64 types are not properly recognized
 */
function safeFromUint8Array(data: Uint8Array, urlSafe = false): string {
  try {
    const result = fromUint8Array(data, urlSafe);
    // Additional validation to ensure we got the expected type
    if (typeof result === 'string') {
      return result;
    }
    throw new Error('Failed to encode to base64');
  } catch {
    throw new Error('Failed to encode to base64');
  }
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
 * Decrypt data with an RSA private key.
 */
export async function decryptWithPrivateKey(
  encryptedData: string,
  privateKeyJwk: string
): Promise<string> {
  const decoder = new TextDecoder();

  // Decode from base64
  const encrypted = safeToUint8Array(encryptedData);

  // Import the private key
  const parsedJwk: unknown = JSON.parse(privateKeyJwk);

  // Validate JWK structure using type guard
  if (!isValidJWK(parsedJwk)) {
    throw new Error('Invalid JWK format');
  }

  // ParsedJwk is now typed as JsonWebKey thanks to the type guard
  const jwkKey = parsedJwk;
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwkKey,
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

/**
 * Storage keys for managing encryption keys in localStorage.
 */
export const STORAGE_KEYS = {
  PUBLIC_KEY: 'logto_demo_public_key',
  PRIVATE_KEY: 'logto_demo_private_key',
  DECRYPTED_SECRET: 'logto_demo_decrypted_app_secret', // App-specific secret unique to this application
} as const;

/**
 * Initialize key pair if not already present.
 * Returns the public key that should be passed to the sign-in page.
 */
export async function initializeKeyPair(): Promise<string> {
  const existingPublicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
  const existingPrivateKey = localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY);

  if (!existingPublicKey || !existingPrivateKey) {
    const keyPair = await generateKeyPair();
    const { publicKey, privateKey } = keyPair;

    localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, publicKey);
    localStorage.setItem(STORAGE_KEYS.PRIVATE_KEY, privateKey);

    return publicKey;
  }

  return existingPublicKey;
}

// Track if we're already fetching to prevent concurrent requests
type RetrievalState = {
  isRetrieving: boolean;
  lastRetrievalError: number | undefined;
};

const createRetrievalState = (): RetrievalState => ({
  isRetrieving: false,
  lastRetrievalError: undefined,
});

const retrievalStateHolder = {
  state: createRetrievalState(),
  setState: (newState: RetrievalState) => {
    // This is intentionally mutable to manage state
    // eslint-disable-next-line @silverhand/fp/no-mutation
    retrievalStateHolder.state = newState;
  },
};
const ERROR_BACKOFF_MS = 30_000; // 30 seconds

/**
 * Retrieve and decrypt the app-specific secret from the user's account.
 * Each application receives a unique secret derived from the user's base secret.
 * This should be called after successful authentication.
 * @param getAccessToken - Function to get the access token from Logto SDK
 */
export async function retrieveAndDecryptSecret(
  getAccessToken: () => Promise<string | undefined>,
  getEncryptedClientSecret?: () => string | undefined
): Promise<string | undefined> {
  // Prevent concurrent requests
  if (retrievalStateHolder.state.isRetrieving) {
    return undefined;
  }

  // If we had an error recently, don't retry yet
  if (
    retrievalStateHolder.state.lastRetrievalError &&
    Date.now() - retrievalStateHolder.state.lastRetrievalError < ERROR_BACKOFF_MS
  ) {
    return undefined;
  }

  try {
    retrievalStateHolder.setState({ ...retrievalStateHolder.state, isRetrieving: true });

    // Clear any cached secret first to ensure we get a fresh one on each login
    localStorage.removeItem(STORAGE_KEYS.DECRYPTED_SECRET);

    const privateKey = localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY);
    const publicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
    if (!privateKey || !publicKey) {
      retrievalStateHolder.setState({
        ...retrievalStateHolder.state,
        isRetrieving: false,
        lastRetrievalError: Date.now(),
      });
      return undefined;
    }

    // Get the encrypted client secret from the token response
    const encryptedClientSecret = getEncryptedClientSecret?.();

    if (!encryptedClientSecret) {
      retrievalStateHolder.setState({
        ...retrievalStateHolder.state,
        isRetrieving: false,
        lastRetrievalError: Date.now(),
      });
      return undefined;
    }

    // Decrypt the client secret with our private key
    const decryptedSecret = await decryptWithPrivateKey(encryptedClientSecret, privateKey);

    // Cache the secret
    localStorage.setItem(STORAGE_KEYS.DECRYPTED_SECRET, decryptedSecret);

    return decryptedSecret;
  } catch {
    retrievalStateHolder.setState({
      ...retrievalStateHolder.state,
      isRetrieving: false,
      lastRetrievalError: Date.now(),
    });
    return undefined;
  } finally {
    retrievalStateHolder.setState({ ...retrievalStateHolder.state, isRetrieving: false });
  }
}

/**
 * Clear all encryption-related data from localStorage.
 * This should be called on logout.
 */
export function clearEncryptionData(): void {
  localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY);
  localStorage.removeItem(STORAGE_KEYS.PRIVATE_KEY);
  localStorage.removeItem(STORAGE_KEYS.DECRYPTED_SECRET);
}

/**
 * Encrypt text using AES-GCM with the provided secret key.
 */
export async function encryptText(text: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();

  // Create a key from the secret
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive AES key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the text
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));

  // Combine salt, iv, and encrypted data
  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(encryptedArray, salt.length + iv.length);

  // Return as base64
  return safeFromUint8Array(combined, true);
}

/**
 * Decrypt text using AES-GCM with the provided secret key.
 */
export async function decryptText(encryptedText: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    // Decode from base64
    const combined = safeToUint8Array(encryptedText);

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    // Create a key from the secret
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive AES key
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
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
  } catch {
    throw new Error('Failed to decrypt text. Invalid encrypted data or wrong secret.');
  }
}
