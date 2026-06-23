import { describe, expect, it } from 'vitest';

import {
  LogtoInlineHookKey,
  type LogtoOidcConfigType,
  LogtoOidcConfigKey,
  LogtoTenantConfigKey,
  OidcSigningKeyStatus,
  inlineHookConfigGuard,
  logtoOidcConfigGuard,
  logtoConfigGuards,
  logtoConfigKeys,
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

  it('accepts inline hook configs', () => {
    const result = inlineHookConfigGuard[LogtoInlineHookKey.PostFirstFactorVerification].safeParse({
      script: 'export default async () => ({ action: "createUser" });',
      environmentVariables: {
        endpoint: 'https://example.com',
      },
      contextSample: ['json', { value: true }],
      enabled: true,
      onExecutionError: 'block',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid inline hook execution error policy', () => {
    const result = inlineHookConfigGuard[LogtoInlineHookKey.PostSignIn].safeParse({
      script: 'export default async () => ({ action: "updateUser" });',
      onExecutionError: 'ignore',
    });

    expect(result.success).toBe(false);
  });

  it('includes inline hook keys in the logto config summary guards', () => {
    expect(logtoConfigKeys).toContain(LogtoInlineHookKey.PostFirstFactorVerification);
    expect(logtoConfigKeys).toContain(LogtoInlineHookKey.PostSignIn);
    expect(logtoConfigGuards[LogtoInlineHookKey.PostSignIn]).toBe(
      inlineHookConfigGuard[LogtoInlineHookKey.PostSignIn]
    );
  });
});
