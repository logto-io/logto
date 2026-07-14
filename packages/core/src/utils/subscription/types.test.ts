import { mockSubscriptionData } from '#src/__mocks__/cloud-connection.js';

import { subscriptionCacheGuard } from './types.js';

describe('subscriptionCacheGuard', () => {
  it('parses a cached subscription that carries isDevPlan', () => {
    const result = subscriptionCacheGuard.parse({ ...mockSubscriptionData, isDevPlan: true });

    expect(result.isDevPlan).toBe(true);
  });

  it('parses a cached subscription written before isDevPlan existed', () => {
    // Backward compatibility: entries cached before Cloud returned the field lack it and must still
    // parse, with `isDevPlan` resolving to `undefined` rather than throwing.
    const result = subscriptionCacheGuard.parse(mockSubscriptionData);

    expect(result.isDevPlan).toBeUndefined();
  });
});
