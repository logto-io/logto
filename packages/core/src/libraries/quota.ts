import { ReservedPlanId, ConnectorType } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import assertThat from '#src/utils/assert-that.js';
import {
  reportSubscriptionUpdates,
  isReportSubscriptionUpdatesUsageKey,
} from '#src/utils/subscription/index.js';
import {
  type Subscription,
  type SubscriptionQuota,
  type SubscriptionUsage,
} from '#src/utils/subscription/types.js';

import {
  isSystemUsageKey,
  type UsageKey,
  type EntityBasedUsageKey,
  type NumericUsageKey,
  isQuotaUsageKey,
  type SystemUsageKey,
  type QuotaUsageKey,
  isBooleanQuotaUsageKey,
  isNumericQuotaUsageKey,
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
  (key: Exclude<UsageKey, EntityBasedUsageKey>, entityId?: string): Promise<void>;
  (key: EntityBasedUsageKey, entityId: string): Promise<void>;
};
export class QuotaLibrary {
  constructor(
    public readonly tenantId: string,
    public readonly queries: Queries,
    public readonly connectorLibrary: ConnectorLibrary,
    private readonly cloudConnection: CloudConnectionLibrary,
    private readonly subscription: SubscriptionLibrary
  ) {}

  guardTenantUsageByKey: GuardTenantUsageByKeyFunction = async (key, entityId) => {
    const { isCloud } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    const subscriptionData = await this.subscription.getSubscriptionData();

    const tenantUsageQuery = new TenantUsageQuery(
      this.tenantId,
      this.queries,
      this.connectorLibrary
    );

    // Todo: @xiaoyijun: remove dev feature flag
    if (EnvSet.values.isDevFeaturesEnabled && isSystemUsageKey(key)) {
      await this.assertSystemLimit({ key, entityId, subscriptionData, tenantUsageQuery });
    }

    if (isQuotaUsageKey(key)) {
      await this.assertQuotaLimit({
        key,
        entityId,
        subscriptionData,
        tenantUsageQuery,
      });
    }
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

  private readonly assertSystemLimit = async ({
    key,
    entityId,
    subscriptionData,
    tenantUsageQuery,
  }: {
    key: SystemUsageKey;
    entityId?: string;
    subscriptionData: Subscription;
    tenantUsageQuery: TenantUsageQuery;
  }) => {
    const { systemLimit } = subscriptionData;

    if (!systemLimit) {
      return;
    }

    const limit = systemLimit[key];

    if (limit === undefined) {
      return;
    }

    const usage = await tenantUsageQuery.get(key, entityId);

    assertThat(
      usage < limit,
      new RequestError(
        {
          code: 'system_limit.limit_exceeded',
          status: 403,
        },
        { key, limit, usage }
      )
    );
  };

  private readonly assertQuotaLimit = async ({
    key,
    entityId,
    subscriptionData,
    tenantUsageQuery,
  }: {
    key: QuotaUsageKey;
    entityId?: string;
    subscriptionData: Subscription;
    tenantUsageQuery: TenantUsageQuery;
  }) => {
    const { planId, isEnterprisePlan, quota } = subscriptionData;

    // Do not block Pro/Enterprise plan from adding add-on resources.
    if (this.shouldReportSubscriptionUpdates(planId, isEnterprisePlan, key)) {
      return;
    }

    const { [key]: limit } = quota;

    if (limit === null) {
      // Skip unlimited quotas
      return;
    }

    // Boolean features: enforce directly by plan quota configuration (true = allowed, false = blocked)
    if (isBooleanQuotaUsageKey(key)) {
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
    if (isNumericQuotaUsageKey(key)) {
      // See the definition of `SubscriptionQuota` and `SubscriptionUsage` in `types.ts`, this should never happen.
      assertThat(
        typeof limit === 'number',
        new TypeError('Usage limit must be number type for numeric limits.')
      );

      const usage = await tenantUsageQuery.get(key, entityId);

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
    }
  };
}

type TenantUsageQueryFunction = (key: NumericUsageKey, entityId?: string) => Promise<number>;

/**
 * Provides memoized tenant usage queries to prevent duplicate getTenantUsageByKey calls
 * when both system limit and quota limit checks are performed on the same key.
 *
 * @remarks
 * This class caches query results based on key+context combination to ensure the underlying
 * getTenantUsageByKey method is called at most once per unique key+context pair.
 */
class TenantUsageQuery {
  private readonly cache = new Map<string, number>();

  constructor(
    private readonly tenantId: string,
    private readonly queries: Queries,
    private readonly connectorLibrary: ConnectorLibrary
  ) {}

  get: TenantUsageQueryFunction = async (key, entityId) => {
    // Construct a simple cache key: "key" or "key:entityId"
    const cacheKey = entityId ? `${key}:${entityId}` : key;

    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const usage = await this.getTenantUsage(key, entityId);

    this.cache.set(cacheKey, usage);
    return usage;
  };

  private readonly getTenantUsage: TenantUsageQueryFunction = async (key, entityId) => {
    if (key === 'socialConnectorsLimit') {
      const connectors = await this.connectorLibrary.getLogtoConnectors();

      return connectors.filter((connector) => connector.type === ConnectorType.Social).length;
    }

    return this.queries.tenantUsage.getSelfComputedUsageByKey(this.tenantId, key, entityId);
  };
}
