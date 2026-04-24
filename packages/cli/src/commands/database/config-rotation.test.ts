import { describe, expect, it } from 'vitest';

const { getEffectiveRotationGracePeriod, parseRotationGracePeriod } = await import(
  './config-rotation.js'
);
const { LogtoOidcConfigKey } = await import('@logto/schemas');

describe('parseRotationGracePeriod()', () => {
  it('returns undefined when env is not set', () => {
    expect(parseRotationGracePeriod()).toBeUndefined();
    expect(parseRotationGracePeriod('   ')).toBeUndefined();
  });

  it('parses a valid non-negative integer', () => {
    expect(parseRotationGracePeriod('14400')).toBe(14_400);
  });

  it('throws on malformed input instead of silently falling back to 0', () => {
    expect(() => parseRotationGracePeriod('4h')).toThrow(
      'Invalid PRIVATE_KEY_ROTATION_GRACE_PERIOD env value'
    );
    expect(() => parseRotationGracePeriod('-1')).toThrow(
      'Invalid PRIVATE_KEY_ROTATION_GRACE_PERIOD env value'
    );
  });
});

describe('getEffectiveRotationGracePeriod()', () => {
  it('uses the explicit private-key grace period when provided', () => {
    expect(
      getEffectiveRotationGracePeriod({
        key: LogtoOidcConfigKey.PrivateKeys,
        gracePeriod: 60,
      })
    ).toBe(60);
  });

  it('uses the env default for private keys when no explicit grace period is provided', () => {
    expect(
      getEffectiveRotationGracePeriod({
        key: LogtoOidcConfigKey.PrivateKeys,
        envGracePeriod: '120',
      })
    ).toBe(120);
  });

  it('rejects cookie-key grace period even when the explicit value is 0', () => {
    expect(() =>
      getEffectiveRotationGracePeriod({
        key: LogtoOidcConfigKey.CookieKeys,
        gracePeriod: 0,
      })
    ).toThrow(`${LogtoOidcConfigKey.CookieKeys} does not support grace period`);
  });
});
