import { describe, expect, it } from 'vitest';

import { createSiweMessage, toChecksumAddress } from './siwe.js';

const baseParams = {
  domain: 'example.logto.app',
  address: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
  uri: 'https://example.logto.app',
  nonce: 'abcdef0123456789',
  issuedAt: '2026-01-01T00:00:00.000Z',
  expirationTime: '2026-01-01T00:10:00.000Z',
  chainId: 1,
} as const;

describe('toChecksumAddress', () => {
  it.each([
    '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
    '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
  ])('normalizes %s to EIP-55', (address) => {
    expect(toChecksumAddress(address.toLowerCase())).toBe(address);
    expect(toChecksumAddress(address.toUpperCase().replace('0X', '0x'))).toBe(address);
  });

  it('throws for an invalid address', () => {
    expect(() => toChecksumAddress('0x1234')).toThrow();
    expect(() => toChecksumAddress('not an address')).toThrow();
  });
});

describe('createSiweMessage', () => {
  it('creates a message without a statement', () => {
    expect(createSiweMessage(baseParams)).toBe(
      `example.logto.app wants you to sign in with your Ethereum account:
0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed

URI: https://example.logto.app
Version: 1
Chain ID: 1
Nonce: abcdef0123456789
Issued At: 2026-01-01T00:00:00.000Z
Expiration Time: 2026-01-01T00:10:00.000Z`
    );
  });

  it('creates a message with a statement', () => {
    expect(createSiweMessage({ ...baseParams, statement: 'Sign in to Logto' })).toBe(
      `example.logto.app wants you to sign in with your Ethereum account:
0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed

Sign in to Logto

URI: https://example.logto.app
Version: 1
Chain ID: 1
Nonce: abcdef0123456789
Issued At: 2026-01-01T00:00:00.000Z
Expiration Time: 2026-01-01T00:10:00.000Z`
    );
  });

  it('collapses newlines and trims the statement', () => {
    const message = createSiweMessage({
      ...baseParams,
      statement: '  Sign in\nto Logto  ',
    });

    expect(message).toContain('\n\nSign in to Logto\n\nURI:');
    expect(message).not.toContain('Sign in\nto Logto');
  });

  it('omits an empty statement', () => {
    const message = createSiweMessage({ ...baseParams, statement: '   ' });

    expect(message).toContain('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed\n\nURI:');
  });
});
