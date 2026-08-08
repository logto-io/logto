import { createHash, createHmac } from 'node:crypto';

/** Maximum UTF-8 byte length for SHA-256 / HMAC message input (1 MiB). */
export const customJwtCryptoMaxInputBytes = 1_048_576;

/** Maximum UTF-8 byte length for an HMAC key (64 KiB). */
export const customJwtCryptoMaxKeyBytes = 65_536;

type HmacSha256Options = Readonly<{
  key: string;
  input: string;
}>;

/**
 * Curated cryptographic operations for Custom JWT scripts.
 *
 * Kept local (not imported from `@logto/schemas`) so the worker-thread runner can load this
 * module with Node builtins only.
 */
type CustomJwtCryptographicCapability = Readonly<{
  sha256: (input: string) => Promise<string>;
  hmacSha256: (options: HmacSha256Options) => Promise<string>;
}>;

const textEncoder = new TextEncoder();

const assertPrimitiveString = (value: unknown, label: string): string => {
  if (typeof value !== 'string') {
    throw new TypeError(`The ${label} must be a string.`);
  }

  return value;
};

const encodeUtf8WithinLimit = (value: string, label: string, maxBytes: number): Uint8Array => {
  const bytes = textEncoder.encode(value);

  if (bytes.byteLength > maxBytes) {
    throw new TypeError(`The ${label} exceeds the maximum length of ${maxBytes} bytes.`);
  }

  return bytes;
};

const assertHexDigest = (digest: string): string => {
  if (digest.length !== 64 || /[^\da-f]/.test(digest)) {
    throw new TypeError('The cryptographic digest is not a valid lowercase hexadecimal string.');
  }

  return digest;
};

const readHmacOptions = (options: unknown): HmacSha256Options => {
  if (typeof options !== 'object' || options === null) {
    throw new TypeError('The HMAC options must be an object.');
  }

  if (!('key' in options) || !('input' in options)) {
    throw new TypeError('The HMAC options must include key and input.');
  }

  return {
    key: assertPrimitiveString(options.key, 'HMAC key'),
    input: assertPrimitiveString(options.input, 'input'),
  };
};

const sha256 = async (input: unknown): Promise<string> => {
  const value = assertPrimitiveString(input, 'input');
  const bytes = encodeUtf8WithinLimit(value, 'input', customJwtCryptoMaxInputBytes);
  const digest = createHash('sha256').update(bytes).digest('hex');

  return assertHexDigest(digest);
};

const hmacSha256 = async (options: unknown): Promise<string> => {
  const { key, input } = readHmacOptions(options);

  if (key.length === 0) {
    throw new TypeError('The HMAC key must not be empty.');
  }

  const keyBytes = encodeUtf8WithinLimit(key, 'HMAC key', customJwtCryptoMaxKeyBytes);
  const inputBytes = encodeUtf8WithinLimit(input, 'input', customJwtCryptoMaxInputBytes);
  const digest = createHmac('sha256', keyBytes).update(inputBytes).digest('hex');

  return assertHexDigest(digest);
};

/**
 * Build the curated Custom JWT cryptographic capability.
 *
 * Uses only Node builtins so the worker-thread script runner can import it safely.
 * Captures native references at module load before any tenant script runs.
 *
 * Custom JWT cryptographic capability
 */
export const createCustomJwtCryptographicCapability = (): CustomJwtCryptographicCapability =>
  Object.freeze({
    sha256,
    hmacSha256,
  });
