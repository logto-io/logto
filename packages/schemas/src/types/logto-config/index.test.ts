import { describe, expect, it } from 'vitest';

import {
  type LogtoOidcConfigType,
  LogtoOidcConfigKey,
  LogtoTenantConfigKey,
  OidcSigningKeyStatus,
  logtoOidcConfigGuard,
  logtoTenantConfigGuard,
  oidcConfigKeysResponseGuard,
} from './index.js';

describe('logto config guards', () => {
  it('accepts legacy private keys without status', () => {
    const privateKeys: LogtoOidcConfigType[LogtoOidcConfigKey.PrivateKeys] = [
      {
        id: 'key_1',
        value: 'private-key-1',
        createdAt: 1_710_000_000_000,
      },
    ];

    const result = logtoOidcConfigGuard[LogtoOidcConfigKey.PrivateKeys].safeParse(privateKeys);

    expect(result.success).toBe(true);
  });

  it('accepts signing key status in OIDC key responses', () => {
    const result = oidcConfigKeysResponseGuard.safeParse({
      id: 'key_1',
      createdAt: 1_710_000_000_000,
      status: OidcSigningKeyStatus.Current,
    });

    expect(result.success).toBe(true);
  });

  it('accepts partial signing key rotation state', () => {
    const result = logtoTenantConfigGuard[LogtoTenantConfigKey.SigningKeyRotationState].safeParse({
      signingKeyRotationAt: 1_710_000_000_000,
    });

    expect(result.success).toBe(true);
  });
});
