import { userMfaDataKey, userPasskeySignInDataKey } from '@logto/schemas';

import { buildUpdatedUserLogtoConfig, buildUserLogtoConfigResponse } from './user-logto-config.js';

describe('buildUserLogtoConfigResponse', () => {
  it('returns all-false defaults with empty logtoConfig', () => {
    expect(buildUserLogtoConfigResponse({})).toStrictEqual({
      mfa: { enabled: undefined, skipped: false, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: false },
    });
  });

  it('returns all-false defaults when logtoConfig contains invalid data', () => {
    expect(
      buildUserLogtoConfigResponse({
        [userMfaDataKey]: 'not-an-object',
        [userPasskeySignInDataKey]: 42,
      })
    ).toStrictEqual({
      mfa: { enabled: undefined, skipped: false, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: false },
    });
  });

  it('returns undefined for mfa.enabled when the field is absent (legacy user)', () => {
    const result = buildUserLogtoConfigResponse({
      [userMfaDataKey]: { skipped: true },
    });
    expect(result.mfa.enabled).toBeUndefined();
  });

  it('returns mfa.enabled as true when explicitly set', () => {
    const result = buildUserLogtoConfigResponse({
      [userMfaDataKey]: { enabled: true },
    });
    expect(result.mfa.enabled).toBe(true);
  });

  it('returns mfa.enabled as false when explicitly set to false', () => {
    const result = buildUserLogtoConfigResponse({
      [userMfaDataKey]: { enabled: false },
    });
    expect(result.mfa.enabled).toBe(false);
  });

  it('returns correct values for all mfa fields when fully populated', () => {
    expect(
      buildUserLogtoConfigResponse({
        [userMfaDataKey]: { enabled: true, skipped: true, skipMfaOnSignIn: true },
      })
    ).toStrictEqual({
      mfa: { enabled: true, skipped: true, skipMfaOnSignIn: true },
      passkeySignIn: { skipped: false },
    });
  });

  it('defaults mfa.skipped and mfa.skipMfaOnSignIn to false when absent', () => {
    const result = buildUserLogtoConfigResponse({
      [userMfaDataKey]: { enabled: true },
    });
    expect(result.mfa.skipped).toBe(false);
    expect(result.mfa.skipMfaOnSignIn).toBe(false);
  });

  it('returns passkeySignIn.skipped correctly', () => {
    expect(
      buildUserLogtoConfigResponse({
        [userPasskeySignInDataKey]: { skipped: true },
      })
    ).toStrictEqual({
      mfa: { enabled: undefined, skipped: false, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: true },
    });
  });

  it('defaults passkeySignIn.skipped to false when absent', () => {
    const result = buildUserLogtoConfigResponse({
      [userPasskeySignInDataKey]: {},
    });
    expect(result.passkeySignIn.skipped).toBe(false);
  });
});

describe('buildUpdatedUserLogtoConfig', () => {
  it('preserves existing logtoConfig when updates are empty', () => {
    const user = {
      logtoConfig: {
        [userMfaDataKey]: { enabled: true, skipped: false, skipMfaOnSignIn: true },
        [userPasskeySignInDataKey]: { skipped: true },
      },
    };
    const result = buildUpdatedUserLogtoConfig(user, {});
    expect(result[userMfaDataKey]).toStrictEqual({
      enabled: true,
      skipped: false,
      skipMfaOnSignIn: true,
    });
    expect(result[userPasskeySignInDataKey]).toStrictEqual({ skipped: true });
  });

  it('merges partial mfa updates without overwriting untouched fields', () => {
    const user = {
      logtoConfig: {
        [userMfaDataKey]: { enabled: true, skipped: false, skipMfaOnSignIn: false },
      },
    };
    const result = buildUpdatedUserLogtoConfig(user, { mfa: { skipped: true } });
    expect(result[userMfaDataKey]).toStrictEqual({
      enabled: true,
      skipped: true,
      skipMfaOnSignIn: false,
    });
  });

  it('writes false values (does not treat false as undefined)', () => {
    const user = {
      logtoConfig: {
        [userMfaDataKey]: { enabled: true, skipped: true, skipMfaOnSignIn: true },
      },
    };
    const result = buildUpdatedUserLogtoConfig(user, {
      mfa: { enabled: false, skipped: false, skipMfaOnSignIn: false },
    });
    expect(result[userMfaDataKey]).toStrictEqual({
      enabled: false,
      skipped: false,
      skipMfaOnSignIn: false,
    });
  });

  it('does not write undefined values (preserves existing field)', () => {
    const user = {
      logtoConfig: {
        [userMfaDataKey]: { enabled: true, skipped: true },
      },
    };
    const result = buildUpdatedUserLogtoConfig(user, {
      mfa: { enabled: undefined, skipped: false },
    });
    // `enabled` should remain from existing data since undefined was passed
    expect((result[userMfaDataKey] as Record<string, unknown>).enabled).toBe(true);
    expect((result[userMfaDataKey] as Record<string, unknown>).skipped).toBe(false);
  });

  it('updates only passkeySignIn without affecting mfa', () => {
    const user = {
      logtoConfig: {
        [userMfaDataKey]: { enabled: true, skipped: false },
        [userPasskeySignInDataKey]: { skipped: false },
      },
    };
    const result = buildUpdatedUserLogtoConfig(user, {
      passkeySignIn: { skipped: true },
    });
    expect(result[userPasskeySignInDataKey]).toStrictEqual({ skipped: true });
    expect(result[userMfaDataKey]).toStrictEqual({ enabled: true, skipped: false });
  });

  it('preserves unrelated keys in logtoConfig', () => {
    const user = {
      logtoConfig: {
        someOtherKey: 'someValue',
        [userMfaDataKey]: { skipped: false },
      },
    };
    const result = buildUpdatedUserLogtoConfig(user, { mfa: { skipped: true } });
    expect(result.someOtherKey).toBe('someValue');
  });

  it('applies updates cleanly when existing logtoConfig is empty', () => {
    const user = { logtoConfig: {} };
    const result = buildUpdatedUserLogtoConfig(user, {
      mfa: { enabled: true, skipped: true, skipMfaOnSignIn: false },
      passkeySignIn: { skipped: true },
    });
    expect(result[userMfaDataKey]).toStrictEqual({
      enabled: true,
      skipped: true,
      skipMfaOnSignIn: false,
    });
    expect(result[userPasskeySignInDataKey]).toStrictEqual({ skipped: true });
  });

  it('applies updates cleanly when existing logtoConfig contains invalid data', () => {
    const user = {
      logtoConfig: {
        [userMfaDataKey]: 'invalid',
        [userPasskeySignInDataKey]: null,
      },
    };
    const result = buildUpdatedUserLogtoConfig(user, {
      mfa: { enabled: true },
      passkeySignIn: { skipped: true },
    });
    expect((result[userMfaDataKey] as Record<string, unknown>).enabled).toBe(true);
    expect(result[userPasskeySignInDataKey]).toStrictEqual({ skipped: true });
  });
});
