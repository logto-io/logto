import { describe, expect, it } from 'vitest';

import { dateRegEx, domainRegEx, emailOrEmailDomainRegEx } from './regex.js';

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
      expect(emailOrEmailDomainRegEx.test('foo.bar@.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo@example')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo@-example.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo@example-.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo@example..com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo@example_.com')).toBe(false);
    });

    it('should allow full email address', () => {
      expect(emailOrEmailDomainRegEx.test('bar@example.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('foo.bar@example.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('foo.bar@example-bar.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('foo+bar@example.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('foo@example.c')).toBe(true);
    });

    it('should not allow partial full email address matches', () => {
      expect(emailOrEmailDomainRegEx.test('foo@example.com extra')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo@example.com,extra')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo@example.com\n')).toBe(false);
    });

    it('should not allow partial email domain without @ mark', () => {
      expect(emailOrEmailDomainRegEx.test('foo.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('foo.bar.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('example')).toBe(false);
    });

    it('should allow email domain with @ mark', () => {
      expect(emailOrEmailDomainRegEx.test('@example.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('@foo.bar.com')).toBe(true);
      expect(emailOrEmailDomainRegEx.test('@example-bar.com')).toBe(true);
    });

    it('should not allow invalid email domain with @ mark', () => {
      expect(emailOrEmailDomainRegEx.test('@example')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('@-example.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('@example-.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('@example..com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('@example_.com')).toBe(false);
      expect(emailOrEmailDomainRegEx.test('@example.com extra')).toBe(false);
    });
  });

  describe('dateRegEx', () => {
    it('should allow a full yyyy-MM-dd date', () => {
      expect(dateRegEx.test('2020-01-01')).toBe(true);
      expect(dateRegEx.test('1999-12-31')).toBe(true);
    });

    it('should not allow a valid date prefix followed by trailing input', () => {
      expect(dateRegEx.test('2020-01-01xyz')).toBe(false);
      expect(dateRegEx.test('2020-01-01T00:00:00Z')).toBe(false);
      expect(dateRegEx.test('2020-01-01 ')).toBe(false);
    });
  });
});
