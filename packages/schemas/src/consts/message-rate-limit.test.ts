import { describe, expect, it } from 'vitest';

import {
  defaultMessageRateLimitPolicy,
  messageRateLimitPolicyGuard,
} from './message-rate-limit.js';

describe('messageRateLimitPolicyGuard', () => {
  it('parses a valid policy', () => {
    expect(
      messageRateLimitPolicyGuard.parse({ sendWindow: 3600, maxSendsPerRecipient: 5 })
    ).toEqual({ sendWindow: 3600, maxSendsPerRecipient: 5 });
  });

  it('rejects a non-numeric value', () => {
    expect(
      messageRateLimitPolicyGuard.safeParse({ sendWindow: '3600', maxSendsPerRecipient: 5 }).success
    ).toBe(false);
  });

  it.each([
    { sendWindow: 0, maxSendsPerRecipient: 5 },
    { sendWindow: 3600, maxSendsPerRecipient: 0 },
    { sendWindow: 3600.5, maxSendsPerRecipient: 5 },
  ])('rejects out-of-range or fractional values %o', (policy) => {
    expect(messageRateLimitPolicyGuard.safeParse(policy).success).toBe(false);
  });

  it('accepts the default policy', () => {
    expect(messageRateLimitPolicyGuard.parse(defaultMessageRateLimitPolicy)).toEqual(
      defaultMessageRateLimitPolicy
    );
  });
});
