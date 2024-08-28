import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';

import assertThat from '../assert-that.js';

import { type SubscriptionPlan } from './types.js';

export const getTenantSubscriptionPlan = async (
  cloudConnection: CloudConnectionLibrary
): Promise<SubscriptionPlan> => {
  const client = await cloudConnection.getClient();
  const [subscription, plans] = await Promise.all([
    client.get('/api/tenants/my/subscription'),
    client.get('/api/subscription-plans'),
  ]);
  const plan = plans.find(({ id }) => id === subscription.planId);

  assertThat(plan, 'subscription.get_plan_failed');

  return plan;
};
