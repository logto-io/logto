import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';

import assertThat from '../assert-that.js';

import { type SubscriptionQuota, type SubscriptionUsage, type SubscriptionPlan } from './types.js';

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

export const getTenantSubscriptionQuotaAndUsage = async (
  cloudConnection: CloudConnectionLibrary
): Promise<{
  quota: SubscriptionQuota;
  usage: SubscriptionUsage;
}> => {
  const client = await cloudConnection.getClient();
  const [quota, usage] = await Promise.all([
    client.get('/api/tenants/my/subscription/quota'),
    client.get('/api/tenants/my/subscription/usage'),
  ]);

  return { quota, usage };
};

export const getTenantSubscriptionScopeUsage = async (
  cloudConnection: CloudConnectionLibrary,
  entityName: 'resources' | 'roles'
): Promise<Record<string, number>> => {
  const client = await cloudConnection.getClient();
  const scopeUsages = await client.get('/api/tenants/my/subscription/usage/:entityName/scopes', {
    params: { entityName },
    search: {},
  });

  return scopeUsages;
};
