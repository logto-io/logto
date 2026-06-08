import { describe, expect, it } from 'vitest';

import { customUiCspGuard, passwordExpirationPolicyGuard } from './sign-in-experience.js';

describe('customUiCspGuard', () => {
  it.each([
    {},
    { scriptSrc: ['https://example.com'] },
    { connectSrc: ['https://api.example.com'] },
    {
      scriptSrc: ['https://example.com'],
      connectSrc: ['https://api.example.com'],
    },
  ])('accepts %p', (value) => {
    expect(customUiCspGuard.safeParse(value).success).toBe(true);
  });

  it('rejects unsupported directives', () => {
    expect(customUiCspGuard.safeParse({ imgSrc: ['https://example.com'] }).success).toBe(false);
  });
});

describe('passwordExpirationPolicyGuard', () => {
  it.each([
    [{}, {}],
    [{ enabled: false }, { enabled: false }],
  ])('accepts disabled policy %p', (value, expected) => {
    expect(passwordExpirationPolicyGuard.parse(value)).toEqual(expected);
  });

  it('accepts enabled policy with a valid period', () => {
    expect(
      passwordExpirationPolicyGuard.parse({
        enabled: true,
        validPeriodDays: 30,
      })
    ).toEqual({
      enabled: true,
      validPeriodDays: 30,
    });
  });

  it('strips unknown keys from legacy rows (e.g. the removed reminderPeriodDays)', () => {
    expect(
      passwordExpirationPolicyGuard.parse({
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      })
    ).toEqual({
      enabled: true,
      validPeriodDays: 30,
    });
  });

  it.each([
    { enabled: true },
    { enabled: true, validPeriodDays: 0 },
    { enabled: true, validPeriodDays: 1.5 },
    { enabled: true, reminderPeriodDays: 5 },
  ])('rejects invalid policy %p', (value) => {
    expect(passwordExpirationPolicyGuard.safeParse(value).success).toBe(false);
  });
});
