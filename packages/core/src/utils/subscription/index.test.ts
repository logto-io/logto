import { mockSubscriptionData } from '#src/__mocks__/cloud-connection.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';

import { getTenantSubscription } from './index.js';

const { jest } = import.meta;

const createCloudConnection = (subscription: unknown) =>
  ({
    getClient: jest.fn(async () => ({
      get: jest.fn(async () => subscription),
    })),
  }) as unknown as CloudConnectionLibrary;

describe('getTenantSubscription', () => {
  it('rejects a Cloud response without the Actions quota key', async () => {
    const { actionsEnabled: _, ...quota } = mockSubscriptionData.quota;

    await expect(
      getTenantSubscription(
        createCloudConnection({
          ...mockSubscriptionData,
          quota: {
            ...quota,
            inlineHooksEnabled: true,
          },
        })
      )
    ).rejects.toThrow('Cloud subscription response is missing the Actions quota.');
  });

  it('uses the Actions quota key and omits the legacy key', async () => {
    const subscription = await getTenantSubscription(
      createCloudConnection({
        ...mockSubscriptionData,
        quota: {
          ...mockSubscriptionData.quota,
          actionsEnabled: false,
          inlineHooksEnabled: true,
        },
      })
    );

    expect(subscription.quota.actionsEnabled).toBe(false);
    expect(subscription.quota).not.toHaveProperty('inlineHooksEnabled');
  });
});
