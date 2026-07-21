import { afterEach, describe, expect, it, vi } from 'vitest';

import GlobalValues, { parseNonNegativeIntegerEnv, parseTimeoutEnv } from './GlobalValues.js';

const createGlobalValues = () => {
  vi.stubEnv('DB_URL', 'postgres://postgres:password@localhost:5432/logto');
  return new GlobalValues();
};

const unsetEnvironmentVariable = (key: string) => {
  vi.stubEnv(key, '');
  Reflect.deleteProperty(process.env, key);
};

describe('OIDC provider SSRF protection', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is enabled by default in self-hosted deployments', () => {
    unsetEnvironmentVariable('IS_CLOUD');
    unsetEnvironmentVariable('OIDC_PROVIDER_SSRF_PROTECTION_ENABLED');

    expect(createGlobalValues().isOidcProviderSsrfProtectionEnabled).toBe(true);
  });

  it('can be disabled in self-hosted deployments', () => {
    unsetEnvironmentVariable('IS_CLOUD');
    vi.stubEnv('OIDC_PROVIDER_SSRF_PROTECTION_ENABLED', 'false');

    expect(createGlobalValues().isOidcProviderSsrfProtectionEnabled).toBe(false);
  });

  it.each(['', 'flase'])('stays enabled for an invalid value: %s', (value) => {
    unsetEnvironmentVariable('IS_CLOUD');
    vi.stubEnv('OIDC_PROVIDER_SSRF_PROTECTION_ENABLED', value);

    expect(createGlobalValues().isOidcProviderSsrfProtectionEnabled).toBe(true);
  });

  it('stays enabled in Cloud when the environment variable is false', () => {
    vi.stubEnv('IS_CLOUD', 'true');
    vi.stubEnv('OIDC_PROVIDER_SSRF_PROTECTION_ENABLED', 'false');

    expect(createGlobalValues().isOidcProviderSsrfProtectionEnabled).toBe(true);
  });
});

describe('parseTimeoutEnv', () => {
  it('returns undefined for missing, blank, or invalid values', () => {
    expect(parseTimeoutEnv()).toBeUndefined();
    expect(parseTimeoutEnv('')).toBeUndefined();
    expect(parseTimeoutEnv('   ')).toBeUndefined();
    expect(parseTimeoutEnv('abc')).toBeUndefined();
    expect(parseTimeoutEnv('123abc')).toBeUndefined();
  });

  it('returns DISABLE_TIMEOUT for the sentinel value', () => {
    expect(parseTimeoutEnv('DISABLE_TIMEOUT')).toBe('DISABLE_TIMEOUT');
    expect(parseTimeoutEnv(' DISABLE_TIMEOUT ')).toBe('DISABLE_TIMEOUT');
  });

  it('parses numeric timeout values', () => {
    expect(parseTimeoutEnv('5000')).toBe(5000);
    expect(parseTimeoutEnv(' 15 ')).toBe(15);
    expect(parseTimeoutEnv('0')).toBe(0);
  });

  it('accepts negative and decimal values as numbers', () => {
    expect(parseTimeoutEnv('-1')).toBe(-1);
    expect(parseTimeoutEnv('1.5')).toBe(1.5);
  });
});

describe('parseNonNegativeIntegerEnv', () => {
  it('returns the fallback for missing, blank, negative, decimal, invalid, or unsafe integer values', () => {
    expect(parseNonNegativeIntegerEnv()).toBe(0);
    expect(parseNonNegativeIntegerEnv('')).toBe(0);
    expect(parseNonNegativeIntegerEnv('   ')).toBe(0);
    expect(parseNonNegativeIntegerEnv('-1')).toBe(0);
    expect(parseNonNegativeIntegerEnv('1.5')).toBe(0);
    expect(parseNonNegativeIntegerEnv('abc')).toBe(0);
    expect(parseNonNegativeIntegerEnv('9007199254740992')).toBe(0);
    expect(parseNonNegativeIntegerEnv('abc', 30)).toBe(30);
  });

  it('parses non-negative integer values', () => {
    expect(parseNonNegativeIntegerEnv('0')).toBe(0);
    expect(parseNonNegativeIntegerEnv('60')).toBe(60);
    expect(parseNonNegativeIntegerEnv(' 14400 ')).toBe(14_400);
  });
});
