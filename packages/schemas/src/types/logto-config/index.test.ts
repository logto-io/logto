import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  LogtoActionKey,
  type LogtoOidcConfigType,
  LogtoOidcConfigKey,
  LogtoTenantConfigKey,
  OidcSigningKeyStatus,
  actionConfigGuard,
  logtoOidcConfigGuard,
  logtoConfigGuards,
  logtoConfigKeys,
  logtoTenantConfigGuard,
  oidcConfigKeysResponseGuard,
  preRegisterResultGuard,
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

  it('accepts action configs', () => {
    const result = actionConfigGuard[LogtoActionKey.PostFirstFactorVerification].safeParse({
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

  it('rejects invalid action execution error policy', () => {
    const result = actionConfigGuard[LogtoActionKey.PostSignIn].safeParse({
      script: 'export default async () => ({ action: "updateUser" });',
      onExecutionError: 'ignore',
    });

    expect(result.success).toBe(false);
  });

  it('includes action keys in the logto config summary guards', () => {
    expect(logtoConfigKeys).toContain(LogtoActionKey.PostFirstFactorVerification);
    expect(logtoConfigKeys).toContain(LogtoActionKey.PostSignIn);
    expect(logtoConfigGuards[LogtoActionKey.PostSignIn]).toBe(
      actionConfigGuard[LogtoActionKey.PostSignIn]
    );
    expect(logtoConfigKeys).toContain(LogtoActionKey.PreRegister);
    expect(logtoConfigGuards[LogtoActionKey.PreRegister]).toBe(
      actionConfigGuard[LogtoActionKey.PreRegister]
    );
  });

  it('accepts only allow and deny pre-register results', () => {
    expect(preRegisterResultGuard.safeParse({ action: 'allow' }).success).toBe(true);
    expect(preRegisterResultGuard.safeParse({ action: 'deny' }).success).toBe(true);
    expect(
      preRegisterResultGuard.safeParse({ action: 'deny', message: 'x'.repeat(256) }).success
    ).toBe(true);
    expect(
      preRegisterResultGuard.safeParse({ action: 'deny', message: 'x'.repeat(257) }).success
    ).toBe(false);
    expect(preRegisterResultGuard.safeParse({ action: 'allow', message: 'ok' }).success).toBe(
      false
    );
    expect(preRegisterResultGuard.safeParse({ action: 'updateUser' }).success).toBe(false);
  });

  it('includes the CIMD key in the logto config summary guards', () => {
    expect(logtoConfigKeys).toContain(LogtoTenantConfigKey.Cimd);
    expect(logtoConfigGuards[LogtoTenantConfigKey.Cimd]).toBe(
      logtoTenantConfigGuard[LogtoTenantConfigKey.Cimd]
    );
  });

  it('keeps a stored CIMD config value', () => {
    expect(logtoTenantConfigGuard[LogtoTenantConfigKey.Cimd].parse({ enabled: true })).toEqual({
      enabled: true,
    });
  });

  it('rejects invalid CIMD config values', () => {
    const result = logtoTenantConfigGuard[LogtoTenantConfigKey.Cimd].safeParse({ enabled: 'yes' });

    expect(result.success).toBe(false);
  });

  it('parses OIDC configs without the optional session row', () => {
    const result = z.object(logtoOidcConfigGuard).parse({
      [LogtoOidcConfigKey.PrivateKeys]: [
        { id: 'key_1', value: 'private-key-1', createdAt: 1_710_000_000_000 },
      ],
      [LogtoOidcConfigKey.CookieKeys]: [],
    });

    expect(result[LogtoOidcConfigKey.Session]).toEqual({});
  });
});
