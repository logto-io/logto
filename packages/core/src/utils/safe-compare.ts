import { timingSafeEqual } from 'node:crypto';

/**
 * Compare two secret-ish strings (e.g. a CSRF token from a cookie and from a request body) in
 * constant time. Returns `false` when either value is not a string or when the byte lengths
 * differ, since `timingSafeEqual()` throws on inputs of different length.
 *
 * Strings are encoded as UTF-16LE, which keeps every code unit: UTF-8 would turn each lone
 * surrogate into U+FFFD, so '\uD800' and '\uD801' would compare equal.
 */
export const safeCompare = (left: unknown, right: unknown): boolean => {
  if (typeof left !== 'string' || typeof right !== 'string') {
    return false;
  }

  const bufferA = Buffer.from(left, 'utf16le');
  const bufferB = Buffer.from(right, 'utf16le');

  return bufferA.byteLength === bufferB.byteLength && timingSafeEqual(bufferA, bufferB);
};
