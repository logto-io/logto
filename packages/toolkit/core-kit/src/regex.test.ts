import { describe, expect, it } from 'vitest';

import { domainRegEx, emailOrEmailDomainRegEx, usernameRegEx } from './regex.js';

describe('Regular expressions should work as expected', () => {
  describe('usernameRegEx', () => {
    it('should allow dots and hyphens after the leading username character', () => {
      expect(usernameRegEx.test('john.doe')).toBe(true);
      expect(usernameRegEx.test('user-name')).toBe(true);
      expect(usernameRegEx.test('john.doe123')).toBe(true);
      expect(usernameRegEx.test('user-name_123')).toBe(true);
      expect(usernameRegEx.test('_service.user-name')).toBe(true);
    });

    it('should reject usernames with unsupported leading or inner characters', () => {
      expect(usernameRegEx.test('1abc')).toBe(false);
      expect(usernameRegEx.test('.john')).toBe(false);
      expect(usernameRegEx.test('-john')).toBe(false);
      expect(usernameRegEx.test('john doe')).toBe(false);
      expect(usernameRegEx.test('john@doe')).toBe(false);
    });
  });

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
      expect(emailOrEmailDomainRegEx.test('foo.bar@.com')).toBe(false);
    });

    it('should allow full email address', () => {
      expect(emailOrEmailDomainRegEx.test('bar@example.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('foo.bar@example.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('foo.bar@example-bar.com')).toBe(true);
    });

    it('should not allow partial email domain without @ mark', () => {
      expect(emailOrEmailDomainRegEx.test('foo.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo.bar.com')).toBe(false);
    });

    it('should allow email domain with @ mark', () => {
      expect(emailOrEmailDomainRegEx.test('@example.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('@foo.bar.com')).toBe(true);
    });
  });
});
