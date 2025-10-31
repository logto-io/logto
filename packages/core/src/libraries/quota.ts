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
import {
  type SystemLimit,
  type SystemLimitKey,
  type SubscriptionQuota,
  type SubscriptionUsage,
} from '#src/utils/subscription/types.js';

import {
  isBooleanFeatureKey,
  isNumericLimitKey,
  isQuotaLimitKey,
  isSystemLimitKey,
  type QuotaLimitKey,
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

type UsageFetcher = (key: NumericLimitKey, context?: { entityId: string }) => Promise<number>;

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
      systemLimit,
    } = await this.subscription.getSubscriptionData();

    /**
     * Create a memoized usage fetcher to prevent duplicate getTenantUsageByKey calls
     * when both system limit and quota limit checks are performed on the same key.
     * The fetcher caches results based on key+context combination.
     */
    const usageFetcher = this.createUsageFetcher();

    // Todo: @xiaoyijun: remove dev feature flag
    if (EnvSet.values.isDevFeaturesEnabled && isSystemLimitKey(key)) {
      await this.assertSystemLimit({ key, systemLimit, context, usageFetcher });
    }

    if (isQuotaLimitKey(key)) {
      await this.assertQuotaLimit({
        planId,
        isEnterprisePlan,
        key,
        quota: fullQuota,
        context,
        usageFetcher,
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
   * Creates a memoized usage fetcher function to avoid duplicate database/API calls.
   *
   * @remarks
   * When a limit key requires both system limit and quota limit checks (e.g., `applicationsLimit`),
   * both checks need the same usage value. This factory creates a fetcher that:
   * - Accepts `(key, context)` as parameters
   * - Caches results based on the key and context combination
   * - Ensures `getTenantUsageByKey` is called at most once per unique key+context pair
   *
   * @example
   * ```ts
   * const usageFetcher = this.createUsageFetcher();
   * await usageFetcher('applicationsLimit');        // Fetches usage (1st call)
   * await usageFetcher('applicationsLimit');        // Returns cached value
   * await usageFetcher('scopesPerRoleLimit', ctx);  // Fetches for different key
   * ```
   *
   * @returns A memoized async function that accepts key and context, returns usage value
   */
  private readonly createUsageFetcher = (): UsageFetcher => {
    const cache = new Map<string, number>();

    return async (key: NumericLimitKey, context?: { entityId: string }) => {
      // Construct a simple cache key: "key" or "key:entityId"
      const cacheKey = context?.entityId ? `${key}:${context.entityId}` : key;

      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const usage = await this.getTenantUsageByKey(key, context);

      cache.set(cacheKey, usage);
      return usage;
    };
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
    systemLimit,
    context,
    usageFetcher,
  }: {
    key: SystemLimitKey;
    // Todo: @xiaoyijun: LOG-12360 make SystemLimit non-optional after this feature is fully rolled out
    systemLimit?: SystemLimit;
    context?: { entityId: string };
    usageFetcher: UsageFetcher;
  }) => {
    if (!systemLimit) {
      return;
    }

    const limit = systemLimit[key];

    if (limit === undefined || limit === null) {
      // Not configured (`undefined`) or unlimited (`null`), skip checking
      return;
    }

    const usage = await usageFetcher(key, context);

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
    planId,
    isEnterprisePlan,
    key,
    quota,
    context,
    usageFetcher,
  }: {
    planId: string;
    isEnterprisePlan: boolean;
    key: QuotaLimitKey;
    quota: SubscriptionQuota;
    context?: { entityId: string };
    usageFetcher: UsageFetcher;
  }) => {
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

      const usage = await usageFetcher(key, context);

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
