import { describe, expect, it } from 'vitest';

import { defaultWafConfig, wafConfigGuard } from './index.js';

describe('WAF config', () => {
  it('defaults to report mode and an 8,192-character target limit', () => {
    expect(defaultWafConfig).toEqual({ mode: 'report', maxRequestTargetLength: 8192 });
  });

  it.each(['off', 'report', 'block'] as const)('accepts %s mode', (mode) => {
    expect(wafConfigGuard.parse({ mode, maxRequestTargetLength: 8192 })).toEqual({
      mode,
      maxRequestTargetLength: 8192,
    });
  });

  it.each([1024, 8192, 65_536])('accepts target limit %i', (maxRequestTargetLength) => {
    expect(wafConfigGuard.parse({ mode: 'report', maxRequestTargetLength })).toEqual({
      mode: 'report',
      maxRequestTargetLength,
    });
  });

  it.each([0, 1023, 65_537, 8192.5])('rejects unsafe target limit %s', (value) => {
    expect(() => wafConfigGuard.parse({ mode: 'report', maxRequestTargetLength: value })).toThrow();
  });
});
