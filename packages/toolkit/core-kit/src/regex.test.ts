import { describe, expect, it } from 'vitest';

import { domainRegEx, emailOrEmailDomainRegex } from './regex.js';

describe('Regular expressions should work as expected', () => {
  it('should allow valid domains that consists of 3 parts. E.g. foo.bar.com', () => {
    expect(domainRegEx.test('foo.bar.com')).toBe(true);
    expect(domainRegEx.test('foo1.bar.com')).toBe(true);
    expect(domainRegEx.test('foo.bar1.com')).toBe(true);
    expect(domainRegEx.test('1foo.bar.com')).toBe(true);
    expect(domainRegEx.test('f.bar.co')).toBe(true);
    expect(domainRegEx.test('f.b.com')).toBe(true);
    expect(domainRegEx.test('1.b.tk')).toBe(true);
  });

  it('should not allow domains that consists of 2 parts. E.g. bar.com', () => {
    expect(domainRegEx.test('bar.com')).toBe(false);
    expect(domainRegEx.test('b.co')).toBe(false);
  });

  it('should handle domains that contains dash in the middle. E.g. auth-gate.bar.com', () => {
    expect(domainRegEx.test('auth-gate.bar.com')).toBe(true);
    expect(domainRegEx.test('auth-.bar.com')).toBe(false);
    expect(domainRegEx.test('-auth.bar.com')).toBe(false);
    expect(domainRegEx.test('auth.bar-foo.com')).toBe(true);
  });

  describe('domainRegEx', () => {
    it('should not allow partial email address without proper domain', () => {
      expect(domainRegEx.test('foo.bar')).toBe(false);
      expect(domainRegEx.test('foo.bar@')).toBe(false);
      expect(domainRegEx.test('foo.bar@com')).toBe(false);
      expect(emailOrEmailDomainRegex.test('foo.bar@.com')).toBe(false);
    });

    it('should allow full email address', () => {
      expect(emailOrEmailDomainRegex.test('bar@example.com')).toBe(true);
      expect(emailOrEmailDomainRegex.test('foo.bar@example.com')).toBe(true);
      expect(emailOrEmailDomainRegex.test('foo.bar@example-bar.com')).toBe(true);
    });

    it('should not allow partial email domain without @ mark', () => {
      expect(emailOrEmailDomainRegex.test('foo.com')).toBe(false);
      expect(emailOrEmailDomainRegex.test('foo.bar.com')).toBe(false);
    });

    it('should allow email domain with @ mark', () => {
      expect(emailOrEmailDomainRegex.test('@example.com')).toBe(true);
      expect(emailOrEmailDomainRegex.test('@foo.bar.com')).toBe(true);
    });
  });
});
