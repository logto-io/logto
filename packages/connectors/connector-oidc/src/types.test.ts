import { scopePostProcessor, idTokenClaimsGuardWithStringBooleans } from './types.js';

describe('scopePostProcessor', () => {
  it('`openid` will be added if not exists (with empty string)', () => {
    expect(scopePostProcessor('')).toEqual('openid');
  });

  it('`openid` will be added if not exists (with non-empty string)', () => {
    expect(scopePostProcessor('profile')).toEqual('profile openid');
  });

  it('return original input if openid exists', () => {
    expect(scopePostProcessor('profile openid')).toEqual('profile openid');
  });
});

describe('idTokenClaimsGuardWithStringBooleans', () => {
  it('should accept boolean values for email_verified and phone_verified', () => {
    const result = idTokenClaimsGuardWithStringBooleans.parse({
      sub: 'subject',
      email_verified: true,
      phone_verified: false,
    });

    expect(result).toEqual({
      sub: 'subject',
      email_verified: true,
      phone_verified: false,
    });
  });

  it('should accept null values for email_verified and phone_verified', () => {
    const result = idTokenClaimsGuardWithStringBooleans.parse({
      sub: 'subject',
      email_verified: null,
      phone_verified: null,
    });

    expect(result).toEqual({
      sub: 'subject',
      email_verified: null,
      phone_verified: null,
    });
  });

  it('should transform string "true" to boolean true for email_verified and phone_verified', () => {
    const result = idTokenClaimsGuardWithStringBooleans.parse({
      sub: 'subject',
      email_verified: 'true',
      phone_verified: 'TRUE',
    });

    expect(result).toEqual({
      sub: 'subject',
      email_verified: true,
      phone_verified: true,
    });
  });

  it('should transform string "false" to boolean false for email_verified and phone_verified', () => {
    const result = idTokenClaimsGuardWithStringBooleans.parse({
      sub: 'subject',
      email_verified: 'false',
      phone_verified: 'FALSE',
    });

    expect(result).toEqual({
      sub: 'subject',
      email_verified: false,
      phone_verified: false,
    });
  });

  it('should transform string "0" to boolean false for email_verified and phone_verified', () => {
    const result = idTokenClaimsGuardWithStringBooleans.parse({
      sub: 'subject',
      email_verified: '0',
      phone_verified: '0',
    });

    expect(result).toEqual({
      sub: 'subject',
      email_verified: false,
      phone_verified: false,
    });
  });

  it('should transform string "1" to boolean true for email_verified and phone_verified', () => {
    const result = idTokenClaimsGuardWithStringBooleans.parse({
      sub: 'subject',
      email_verified: '1',
      phone_verified: '1',
    });

    expect(result).toEqual({
      sub: 'subject',
      email_verified: true,
      phone_verified: true,
    });
  });

  it('should accept other standard claims', () => {
    const result = idTokenClaimsGuardWithStringBooleans.parse({
      sub: 'subject',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      picture: 'https://example.com/avatar.jpg',
      profile: 'https://example.com/profile',
      nonce: 'random-nonce',
    });

    expect(result).toEqual({
      sub: 'subject',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      picture: 'https://example.com/avatar.jpg',
      profile: 'https://example.com/profile',
      nonce: 'random-nonce',
    });
  });
});
