import { describe, expect, it } from 'vitest';

import { emailServiceBrandingGuard, urlRegEx } from './passwordless.js';

describe('urlRegEx', () => {
  it('does not treat dotted abbreviations or legal suffixes as URLs', () => {
    const sample = 'SomeCompany p.s.a. | os. Some Street 12/34 60-123 Poznań, PL | KRS 0001221212';
    expect(urlRegEx.test(sample)).toBe(false);
    expect(urlRegEx.test('Company p.s.a.')).toBe(false);
    expect(urlRegEx.test('Company P.S.A.')).toBe(false);
    expect(urlRegEx.test('Company S.A.')).toBe(false);
    expect(urlRegEx.test('Company P.C.')).toBe(false);
  });

  it('still detects http(s) URLs', () => {
    expect(urlRegEx.test('https://example.com')).toBe(true);
    expect(urlRegEx.test('prefix https://example.com/phish suffix')).toBe(true);
    expect(urlRegEx.test('HTTPS://Example.COM/path')).toBe(true);
  });

  it('still detects www.-prefixed hostnames', () => {
    expect(urlRegEx.test('www.example.com')).toBe(true);
    expect(urlRegEx.test('See WWW.EXAMPLE.COM for details')).toBe(true);
  });

  it('still detects bare domains without scheme or www', () => {
    expect(urlRegEx.test('example.com')).toBe(true);
    expect(urlRegEx.test('contact example.com only')).toBe(true);
    expect(urlRegEx.test('foo.bar/path')).toBe(true);
    expect(urlRegEx.test('x.y')).toBe(true);
    expect(urlRegEx.test('a.b.c.com')).toBe(true);
  });
});

describe('emailServiceBrandingGuard companyInformation', () => {
  it('accepts Polish company info containing p.s.a.', () => {
    const parsed = emailServiceBrandingGuard.safeParse({
      companyInformation:
        'SomeCompany p.s.a. | os. Some Street 12/34 60-123 Poznań, PL | KRS 0001221212',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects company info containing a bare domain', () => {
    const parsed = emailServiceBrandingGuard.safeParse({
      companyInformation: 'SomeCompany example.com',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('emailServiceBrandingGuard senderName', () => {
  it('accepts dotted legal suffixes', () => {
    const parsed = emailServiceBrandingGuard.safeParse({
      senderName: 'SomeCompany S.A.',
    });
    expect(parsed.success).toBe(true);
  });
});
