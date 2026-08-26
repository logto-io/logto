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

/** The current name, and the narrower one it replaced, which stays supported. */
const optOutVariables = ['SSRF_PROTECTION_DISABLED', 'OIDC_PROVIDER_SSRF_PROTECTION_DISABLED'];

describe('SSRF protection', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is enabled by default in self-hosted deployments', () => {
    unsetEnvironmentVariable('IS_CLOUD');
    for (const variable of optOutVariables) {
      unsetEnvironmentVariable(variable);
    }

    const values = createGlobalValues();
    expect(values.isSsrfProtectionEnabled).toBe(true);
    expect(values.isOidcProviderSsrfProtectionEnabled).toBe(true);
  });

  describe.each(optOutVariables)('%s', (variable) => {
    it('can disable the protection in self-hosted deployments', () => {
      unsetEnvironmentVariable('IS_CLOUD');
      for (const other of optOutVariables) {
        unsetEnvironmentVariable(other);
      }
      vi.stubEnv(variable, 'true');

      const values = createGlobalValues();
      expect(values.isSsrfProtectionEnabled).toBe(false);
      expect(values.isOidcProviderSsrfProtectionEnabled).toBe(false);
    });

    it.each(['', 'false', 'flase'])('stays enabled when the opt-out value is: %s', (value) => {
      unsetEnvironmentVariable('IS_CLOUD');
      for (const other of optOutVariables) {
        unsetEnvironmentVariable(other);
      }
      vi.stubEnv(variable, value);

      expect(createGlobalValues().isSsrfProtectionEnabled).toBe(true);
    });

    it('stays enabled in Cloud when the environment variable is true', () => {
      vi.stubEnv('IS_CLOUD', 'true');
      vi.stubEnv(variable, 'true');

      expect(createGlobalValues().isSsrfProtectionEnabled).toBe(true);
    });
  });

  describe('ssrfAllowedAddresses', () => {
    it('parses comma-separated entries with trimming in self-hosted deployments', () => {
      unsetEnvironmentVariable('IS_CLOUD');
      vi.stubEnv('SSRF_ALLOWED_ADDRESSES', ' 127.0.0.1, 10.0.0.0/8 , ::1 ');

      expect(createGlobalValues().ssrfAllowedAddresses).toEqual(['127.0.0.1', '10.0.0.0/8', '::1']);
    });

    it('always returns an empty array in Cloud', () => {
      vi.stubEnv('IS_CLOUD', 'true');
      vi.stubEnv('SSRF_ALLOWED_ADDRESSES', '127.0.0.1,10.0.0.0/8');

      expect(createGlobalValues().ssrfAllowedAddresses).toEqual([]);
    });
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
