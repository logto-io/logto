import { describe, it, expect } from 'vitest';

import { samlEncryptionGuard } from './saml-application-configs.js';

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
