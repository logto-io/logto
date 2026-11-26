import { timingSafeEqual } from 'node:crypto';

/**
 * Compare two secret-ish strings (e.g. a CSRF token from a cookie and from a request body) in
 * constant time. Returns `false` when either value is not a string or when the byte lengths
 * differ, since `timingSafeEqual()` throws on inputs of different length.
 */
export const safeCompare = (a: unknown, b: unknown): boolean => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  return bufferA.byteLength === bufferB.byteLength && timingSafeEqual(bufferA, bufferB);
};
