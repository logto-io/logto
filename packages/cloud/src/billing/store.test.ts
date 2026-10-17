import { describe, expect, it } from 'vitest';

import { createInMemoryBillingStore } from './store.js';
import { type Subscription } from './subscription.js';

const subscription: Subscription = {
  planId: 'pro',
  currentPeriodStart: '2026-10-01T00:00:00.000Z',
  currentPeriodEnd: '2026-11-01T00:00:00.000Z',
  isEnterprisePlan: false,
  status: 'active',
  quota: {} as Subscription['quota'],
  systemLimit: {},
};

describe('createInMemoryBillingStore', () => {
  it('returns the subscription recorded for a tenant', async () => {
    const store = createInMemoryBillingStore({ subscriptions: { tenant1: subscription } });

    await expect(store.findSubscription('tenant1')).resolves.toEqual(subscription);
  });

  it('returns null for a tenant without a subscription', async () => {
    const store = createInMemoryBillingStore({ subscriptions: { tenant1: subscription } });

    await expect(store.findSubscription('unknown')).resolves.toBeNull();
  });
});
