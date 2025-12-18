import { ConnectorType } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import assertThat from '#src/utils/assert-that.js';
import {
  reportSubscriptionUpdates,
  isReportSubscriptionUpdatesUsageKey,
  isReportablePlan,
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

/**
 * Options for quota guard operations.
 */
type GuardTenantUsageOptions = {
  /**
   * Entity ID for entity-based quota limits.
   *
   * @remarks
   * Required for entity-based quotas like `scopesPerRoleLimit`, `scopesPerResourceLimit`, etc.
   * Optional for tenant-level quotas like `applicationsLimit`, `resourcesLimit`, etc.
   *
   * @example
   * ```ts
   * // Entity-based quota: entityId is required
   * await quota.guardTenantUsageByKey('scopesPerRoleLimit', { entityId: roleId });
   *
   * // Tenant-level quota: entityId not needed
   * await quota.guardTenantUsageByKey('applicationsLimit');
   * ```
   */
  entityId?: string;

  /**
   * The number of resources to consume in this operation.
   *
   * @remarks
   * This is used to validate batch operations where multiple resources are added at once.
   * For example, when assigning 10 scopes to a role in a single request, set this to 10.
   *
   * The guard will check: `currentUsage + consumeUsageCount <= limit`
   *
   * @default 1 - Assumes single resource consumption if not specified
   *
   * @example
   * ```ts
   * // Adding a single application (default behavior)
   * await quota.guardTenantUsageByKey('applicationsLimit');
   *
   * // Adding 5 scopes to a role at once
   * await quota.guardTenantUsageByKey('scopesPerRoleLimit', {
   *   entityId: roleId,
   *   consumeUsageCount: 5,
   * });
   * ```
   */
  consumeUsageCount?: number;
};

/**
 * Function type for guarding tenant usage against quota limits.
 * Provides type-safe overloads for tenant-level and entity-based quotas.
 */
type GuardTenantUsageByKeyFunction = {
  /**
   * Guard tenant-level quota (e.g., applicationsLimit, resourcesLimit)
   * @param key - Tenant-level quota key
   * @param options - Optional guard options
   */
  (key: Exclude<UsageKey, EntityBasedUsageKey>, options?: GuardTenantUsageOptions): Promise<void>;

  /**
   * Guard entity-based quota (e.g., scopesPerRoleLimit, scopesPerResourceLimit)
   * @param key - Entity-based quota key
   * @param options - Guard options with required entityId
   */
  (
    key: EntityBasedUsageKey,
    options: GuardTenantUsageOptions & { entityId: string }
  ): Promise<void>;
};

export class QuotaLibrary {
  constructor(
    public readonly tenantId: string,
    public readonly queries: Queries,
    public readonly connectorLibrary: ConnectorLibrary,
    private readonly cloudConnection: CloudConnectionLibrary,
    private readonly subscription: SubscriptionLibrary
  ) {}

  /**
   * Guards tenant usage against quota and system limits before performing an operation.
   *
   * @remarks
   * This method checks if the current usage plus the resources to be consumed would exceed
   * the configured limits. It validates against both system limits (hard caps) and
   * subscription quota limits.
   *
   * The check formula is: `currentUsage + consumeUsageCount <= limit`
   *
   * If the limit would be exceeded, this method throws a RequestError. Otherwise, it
   * returns silently, allowing the operation to proceed.
   *
   * @param key - The quota key to check (e.g., 'applicationsLimit', 'scopesPerRoleLimit')
   * @param options - Optional configuration for the guard operation
   * @param options.entityId - Entity ID for entity-based quotas (required for entity-based keys)
   * @param options.consumeUsageCount - Number of resources to consume (default: 1)
   *
   * @throws {RequestError} With code 'system_limit.limit_exceeded' if system limit is exceeded
   * @throws {RequestError} With code 'subscription.limit_exceeded' if quota limit is exceeded
   *
   * @example
   * ```ts
   * // Guard before adding a single application
   * await quota.guardTenantUsageByKey('applicationsLimit');
   *
   * // Guard before adding multiple scopes to a role
   * const scopeIds = ['scope1', 'scope2', 'scope3'];
   * await quota.guardTenantUsageByKey('scopesPerRoleLimit', {
   *   entityId: 'role_id',
   *   consumeUsageCount: scopeIds.length,
   * });
   * ```
   */
  guardTenantUsageByKey: GuardTenantUsageByKeyFunction = async (
    key,
    { entityId, consumeUsageCount = 1 } = {}
  ) => {
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

    if (isSystemUsageKey(key)) {
      await this.assertSystemLimit({
        key,
        entityId,
        subscriptionData,
        tenantUsageQuery,
        consumeUsageCount,
      });
    }

    if (isQuotaUsageKey(key)) {
      await this.assertQuotaLimit({
        key,
        entityId,
        subscriptionData,
        tenantUsageQuery,
        consumeUsageCount,
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
  ) => isReportablePlan(planId, isEnterprisePlan) && isReportSubscriptionUpdatesUsageKey(key);

  private readonly assertSystemLimit = async ({
    key,
    entityId,
    subscriptionData,
    tenantUsageQuery,
    consumeUsageCount,
  }: {
    key: SystemUsageKey;
    entityId?: string;
    subscriptionData: Subscription;
    tenantUsageQuery: TenantUsageQuery;
    consumeUsageCount: number;
  }) => {
    const { systemLimit } = subscriptionData;

    const limit = systemLimit[key];

    if (limit === undefined) {
      return;
    }

    const usage = await tenantUsageQuery.get(key, entityId);

    assertThat(
      usage + consumeUsageCount <= limit,
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
    consumeUsageCount,
  }: {
    key: QuotaUsageKey;
    entityId?: string;
    subscriptionData: Subscription;
    tenantUsageQuery: TenantUsageQuery;
    consumeUsageCount: number;
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
        usage + consumeUsageCount <= limit,
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
