import { ReservedPlanId, ConnectorType } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import assertThat from '#src/utils/assert-that.js';
import {
  reportSubscriptionUpdates,
  isReportSubscriptionUpdatesUsageKey,
  getTenantUsageData as getTenantUsageFromCloud,
} from '#src/utils/subscription/index.js';
import { type SubscriptionQuota, type SubscriptionUsage } from '#src/utils/subscription/types.js';

import {
  isBooleanFeatureKey,
  isNumericLimitKey,
  type AllLimitKey,
  type EntityBasedUsageKey,
  type NumericLimitKey,
} from '../queries/tenant-usage/types.js';
import type Queries from '../tenants/Queries.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';
import { type ConnectorLibrary } from './connector.js';

const paidReservedPlans = new Set<string>([
  ReservedPlanId.Pro,
  ReservedPlanId.Pro202411,
  ReservedPlanId.Pro202509,
]);

type GuardTenantUsageByKeyFunction = {
  (key: Exclude<AllLimitKey, EntityBasedUsageKey>, context?: { entityId: string }): Promise<void>;
  (key: EntityBasedUsageKey, context: { entityId: string }): Promise<void>;
};

export class QuotaLibrary {
  constructor(
    public readonly tenantId: string,
    public readonly queries: Queries,
    public readonly connectorLibrary: ConnectorLibrary,
    private readonly cloudConnection: CloudConnectionLibrary,
    private readonly subscription: SubscriptionLibrary
  ) {}

  guardTenantUsageByKey: GuardTenantUsageByKeyFunction = async (key, context) => {
    const { isCloud } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    const {
      planId,
      isEnterprisePlan,
      quota: fullQuota,
    } = await this.subscription.getSubscriptionData();

    // Do not block Pro/Enterprise plan from adding add-on resources.
    if (this.shouldReportSubscriptionUpdates(planId, isEnterprisePlan, key)) {
      return;
    }

    const { [key]: limit } = fullQuota;

    if (limit === null) {
      // Skip unlimited quotas
      return;
    }

    // Boolean features: enforce directly by plan quota configuration (true = allowed, false = blocked)
    if (isBooleanFeatureKey(key)) {
      assertThat(
        typeof limit === 'boolean',
        new TypeError('Feature availability settings must be boolean type.')
      );
      assertThat(
        limit,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: {
            key,
          },
        })
      );
      return;
    }

    // Number-based limits: query current usage and compare with limit
    if (isNumericLimitKey(key)) {
      // See the definition of `SubscriptionQuota` and `SubscriptionUsage` in `types.ts`, this should never happen.
      assertThat(
        typeof limit === 'number',
        new TypeError('Usage limit must be number type for numeric limits.')
      );

      const usage = await this.getTenantUsageByKey(key, context);

      assertThat(
        usage < limit,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: {
            key,
            limit,
            usage,
          },
        })
      );
      return;
    }

    throw new TypeError('Unsupported subscription quota type');
  };

  reportSubscriptionUpdatesUsage = async (key: keyof SubscriptionUsage) => {
    const { isCloud, isIntegrationTest } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    // Disable in integration tests
    if (isIntegrationTest) {
      return;
    }

    const { planId, isEnterprisePlan } = await this.subscription.getSubscriptionData();

    if (this.shouldReportSubscriptionUpdates(planId, isEnterprisePlan, key)) {
      await reportSubscriptionUpdates(this.cloudConnection, key);
    }
  };

  private readonly getTenantUsageByKey = async (
    key: NumericLimitKey,
    context?: { entityId: string }
  ) => {
    if (key === 'tenantMembersLimit') {
      const {
        usage: { tenantMembersLimit },
      } = await getTenantUsageFromCloud(this.cloudConnection);

      return tenantMembersLimit;
    }

    if (key === 'socialConnectorsLimit') {
      const connectors = await this.connectorLibrary.getLogtoConnectors();

      return connectors.filter((connector) => connector.type === ConnectorType.Social).length;
    }

    return this.queries.tenantUsage.getSelfComputedUsageByKey(this.tenantId, key, context);
  };

  /**
   * @remarks
   * Should report usage changes to the Cloud only when the following conditions are met:
   * 1. The tenant is either on Pro plan or Enterprise plan.
   * 2. The usage key is add-on related usage key.
   */
  private readonly shouldReportSubscriptionUpdates = (
    planId: string,
    isEnterprisePlan: boolean,
    key: keyof SubscriptionQuota
  ) =>
    (paidReservedPlans.has(planId) || isEnterprisePlan) && isReportSubscriptionUpdatesUsageKey(key);
}
