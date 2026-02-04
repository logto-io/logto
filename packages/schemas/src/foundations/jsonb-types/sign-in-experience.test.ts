import { describe, expect, it } from 'vitest';

import { adaptiveMfaGuard } from './sign-in-experience.js';

describe('adaptiveMfaGuard', () => {
  it('accepts thresholds within range', () => {
    const result = adaptiveMfaGuard.safeParse({
      enabled: true,
      thresholds: {
        minBotScore: 20,
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects minBotScore above 99', () => {
    const result = adaptiveMfaGuard.safeParse({
      enabled: true,
      thresholds: {
        minBotScore: 100,
      },
    });

    expect(result.success).toBe(false);
  });
});
