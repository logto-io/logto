import { describe, expect, it } from 'vitest';

import { parseTimeoutEnv } from './GlobalValues.js';

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
