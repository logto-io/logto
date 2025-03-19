import { trySafe } from '@silverhand/essentials';

import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';

import {
  type SubscriptionQuota,
  type SubscriptionUsage,
  type Subscription,
  type ReportSubscriptionUpdatesUsageKey,
  allReportSubscriptionUpdatesUsageKeys,
} from './types.js';

export const getTenantSubscription = async (
  cloudConnection: CloudConnectionLibrary
): Promise<Subscription> => {
  const client = await cloudConnection.getClient();
  const subscription = await client.get('/api/tenants/my/subscription');

  // All the dates will be converted to the ISO 8601 format after json serialization.
  // Convert the dates to ISO 8601 format to match the exact type of the response.
  const { currentPeriodStart, currentPeriodEnd, ...rest } = subscription;

  return {
    ...rest,
    currentPeriodStart: new Date(currentPeriodStart).toISOString(),
    currentPeriodEnd: new Date(currentPeriodEnd).toISOString(),
  };
};

/**
 * Get real-time subscription data from Logto Cloud service, including quota, usage, resources, and roles.
 * Since the core service computing resources may locate in another region other than the Cloud service, the response could take few seconds.
 */
export const getTenantUsageData = async (
  cloudConnection: CloudConnectionLibrary
): Promise<{
  quota: SubscriptionQuota;
  usage: SubscriptionUsage;
  resources: Record<string, number>;
  roles: Record<string, number>;
}> => {
  const client = await cloudConnection.getClient();
  const { quota, usage, resources, roles } = await client.get('/api/tenants/my/subscription-usage');

  return { quota, usage, resources, roles };
};

export const reportSubscriptionUpdates = async (
  cloudConnection: CloudConnectionLibrary,
  usageKey: keyof SubscriptionQuota
): Promise<void> => {
  if (!isReportSubscriptionUpdatesUsageKey(usageKey)) {
    return;
  }

  const client = await cloudConnection.getClient();
  // We only report to the Cloud to notify the resource usage updates, and do not care the response. We will see error logs on the Cloud side if there is any issue.
  await trySafe(
    client.post('/api/tenants/my/subscription/item-updates', {
      body: {
        usageKey,
      },
    })
  );
};

/**
 * @remarks
 * Check whether the provided usage key is add-on related usage key.
 */
export const isReportSubscriptionUpdatesUsageKey = (
  value: string
): value is ReportSubscriptionUpdatesUsageKey => {
  // eslint-disable-next-line no-restricted-syntax
  return allReportSubscriptionUpdatesUsageKeys.includes(value as ReportSubscriptionUpdatesUsageKey);
};
