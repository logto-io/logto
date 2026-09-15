import { describe, it, expect } from 'vitest';

import { samlEncryptionGuard, samlAuthnRequestConfigGuard } from './saml-application-configs.js';

describe('samlEncryptionGuard', () => {
  // Test valid configurations
  it('should pass when encryption is disabled', () => {
    const result = samlEncryptionGuard.safeParse({
      encryptAssertion: false,
    });
    expect(result.success).toBe(true);
  });

  it('should pass when encryption is enabled with all required fields', () => {
    const result = samlEncryptionGuard.safeParse({
      encryptAssertion: true,
      encryptThenSign: true,
      certificate: '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...',
    });
    expect(result.success).toBe(true);
  });

  // Test invalid configurations
  it('should fail when encryptAssertion is true but missing encryptThenSign', () => {
    const result = samlEncryptionGuard.safeParse({
      encryptAssertion: true,
      certificate: '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        '`encryptThenSign` and `certificate` are required when `encryptAssertion` is `true`'
      );
    }
  });

  it('should fail when encryptAssertion is true but missing certificate', () => {
    const result = samlEncryptionGuard.safeParse({
      encryptAssertion: true,
      encryptThenSign: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        '`encryptThenSign` and `certificate` are required when `encryptAssertion` is `true`'
      );
    }
  });

  it('should fail when encryptAssertion is true but missing both encryptThenSign and certificate', () => {
    const result = samlEncryptionGuard.safeParse({
      encryptAssertion: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        '`encryptThenSign` and `certificate` are required when `encryptAssertion` is `true`'
      );
    }
  });
});

describe('samlAuthnRequestConfigGuard', () => {
  it('keeps the per-application force-login setting', () => {
    expect(samlAuthnRequestConfigGuard.parse({ forceAuthn: true })).toEqual({ forceAuthn: true });
  });

  it('allows default session reuse', () => {
    expect(samlAuthnRequestConfigGuard.parse({})).toEqual({});
  });

  it('rejects a non-boolean force-login setting', () => {
    expect(samlAuthnRequestConfigGuard.safeParse({ forceAuthn: 'true' }).success).toBe(false);
  });
});

describe('signed AuthnRequest policy', () => {
  it('requires a signing certificate when signatures are required', () => {
    expect(
      samlAuthnRequestConfigGuard.safeParse({ requireSignedAuthnRequests: true }).success
    ).toBe(false);
  });

  it('keeps the configured trust certificate', () => {
    const config = { requireSignedAuthnRequests: true, signingCertificate: 'certificate' };
    expect(samlAuthnRequestConfigGuard.parse(config)).toEqual(config);
  });

  it.each(['', '   '])('rejects an empty certificate: %j', (signingCertificate) => {
    expect(samlAuthnRequestConfigGuard.safeParse({ signingCertificate }).success).toBe(false);
  });
});
