import { describe, expect, it } from 'vitest';

import { normalizeTimeout, toTimeoutMilliseconds } from './timeout.js';

describe('timeout helpers', () => {
  it.each([
    [undefined, 10],
    [Number.NaN, 10],
    [20, 20],
    [0, 0],
    [-1, 0],
    [Number.POSITIVE_INFINITY, 0],
  ])('should normalize %s seconds to %s', (timeout, expected) => {
    expect(normalizeTimeout(timeout)).toBe(expected);
  });

  it.each([
    [10, 10_000],
    [0.0005, 1],
    [Number.MAX_VALUE, 2_147_483_647],
  ])('should convert %s seconds to %s milliseconds', (timeout, expected) => {
    expect(toTimeoutMilliseconds(timeout)).toBe(expected);
  });
});
