import { describe, expect, it } from 'vitest';

import { isValidSubdomain } from './sub-domain.js';

describe('isValidSubdomain()', () => {
  it('should return true for valid subdomains', () => {
    expect(isValidSubdomain('a')).toBe(true);
    expect(isValidSubdomain('1')).toBe(true);
    expect(isValidSubdomain('a1')).toBe(true);
    expect(isValidSubdomain('a1-b2')).toBe(true);
  });

  it('should return false for invalid subdomains', () => {
    expect(isValidSubdomain('')).toBe(false);
    expect(isValidSubdomain('a1-')).toBe(false);
    expect(isValidSubdomain('-a1')).toBe(false);
    expect(isValidSubdomain('a1-')).toBe(false);
    expect(isValidSubdomain('a1.b')).toBe(false);
    expect(isValidSubdomain('a_b')).toBe(false);
    expect(isValidSubdomain('aBc')).toBe(false);
  });
});
