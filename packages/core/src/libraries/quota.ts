import { ReservedPlanId, ConnectorType } from '@logto/schemas';
import { cond } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import assertThat from '#src/utils/assert-that.js';
import {
  reportSubscriptionUpdates,
  isReportSubscriptionUpdatesUsageKey,
  getTenantUsageData,
} from '#src/utils/subscription/index.js';
import {
  type SystemLimit,
  type SubscriptionQuota,
  type SubscriptionUsage,
} from '#src/utils/subscription/types.js';

import {
  selfComputedSubscriptionUsageGuard,
  type SelfComputedTenantUsage,
} from '../queries/tenant-usage/types.js';
import type Queries from '../tenants/Queries.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';
import { type ConnectorLibrary } from './connector.js';

const paidReservedPlans = new Set<string>([
  ReservedPlanId.Pro,
  ReservedPlanId.Pro202411,
  ReservedPlanId.Pro202509,
]);

export class QuotaLibrary {
  constructor(
    public readonly tenantId: string,
    public readonly queries: Queries,
    public readonly connectorLibrary: ConnectorLibrary,
    private readonly cloudConnection: CloudConnectionLibrary,
    private readonly subscription: SubscriptionLibrary
  ) {}

  /**
   * Guard tenant usage by key.
   *
   * This method performs a two-tier check:
   * 1. System limit check (hard blocker)
   * 2. Quota limit check - based on subscription plan
   *
   * System limits are checked first as they are absolute constraints that cannot be exceeded
   * regardless of the subscription plan. Quota limits are then checked based on the specific
   * plan's allowances.
   *
   * @param key - The usage key to check
   */
  guardTenantUsageByKey = async (key: keyof SubscriptionUsage) => {
    const { isCloud } = EnvSet.values;

    if (!isCloud) {
      return;
    }

    const { planId, isEnterprisePlan, quota, systemLimit } =
      await this.subscription.getSubscriptionData();

    // Determine which checks are needed
    const systemLimitValue = cond(
      // eslint-disable-next-line no-restricted-syntax
      systemLimit && key in systemLimit && systemLimit[key as keyof typeof systemLimit]
    );
    const quotaLimitValue = quota[key];

    // TODO: @xiaoyijun remove dev feature flag
    const shouldCheckSystemLimit =
      systemLimitValue !== undefined && EnvSet.values.isDevFeaturesEnabled;
    const shouldCheckQuota =
      !this.shouldReportSubscriptionUpdates(planId, isEnterprisePlan, key) &&
      quotaLimitValue !== null;

    // Early return if no checks needed - avoids fetching usage
    if (!shouldCheckSystemLimit && !shouldCheckQuota) {
      return;
    }

    const usage = await this.fetchUsageByKey(key);

    // First priority: Check system limit (hard limit for all plans)
    // System limits are absolute constraints that must be enforced first
    if (shouldCheckSystemLimit) {
      this.assertSystemLimit(usage, systemLimitValue, key);
    }

    // Second priority: Check quota limit (subscription plan limit)
    // Only checked after system limit passes, enforces plan-specific restrictions
    if (shouldCheckQuota) {
      this.assertQuotaLimit(usage, quotaLimitValue, key);
    }
  };

  guardEntityScopesUsage = async (entityName: 'resources' | 'roles', entityId: string) => {
    const { isCloud } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    const {
      quota: { scopesPerResourceLimit, scopesPerRoleLimit },
    } = await this.subscription.getSubscriptionData();

    const { [entityId]: usage = 0 } =
      entityName === 'resources'
        ? await this.queries.tenantUsage.getScopesForResourcesTenantUsage(this.tenantId)
        : await this.queries.tenantUsage.getScopesForRolesTenantUsage();

    if (entityName === 'resources') {
      assertThat(
        scopesPerResourceLimit === null || scopesPerResourceLimit > usage,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: {
            key: 'scopesPerResourceLimit',
            limit: scopesPerResourceLimit,
            usage,
          },
        })
      );
      return;
    }

    assertThat(
      scopesPerRoleLimit === null || scopesPerRoleLimit > usage,
      new RequestError({
        code: 'subscription.limit_exceeded',
        status: 403,
        data: {
          key: 'scopesPerRoleLimit',
          limit: scopesPerRoleLimit,
          usage,
        },
      })
    );
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

  public async getTenantUsage(): Promise<{ usage: SelfComputedTenantUsage }> {
    const [rawUsage, connectors] = await Promise.all([
      this.queries.tenantUsage.getRawTenantUsage(this.tenantId),
      this.connectorLibrary.getLogtoConnectors(),
    ]);

    const socialConnectors = connectors.filter(
      (connector) => connector.type === ConnectorType.Social
    );

    const unparsedUsage: SelfComputedTenantUsage = {
      applicationsLimit: rawUsage.applicationsLimit,
      thirdPartyApplicationsLimit: rawUsage.thirdPartyApplicationsLimit,
      scopesPerResourceLimit: rawUsage.scopesPerResourceLimit, // Max scopes per resource
      userRolesLimit: rawUsage.userRolesLimit,
      machineToMachineRolesLimit: rawUsage.machineToMachineRolesLimit,
      scopesPerRoleLimit: rawUsage.scopesPerRoleLimit, // Max scopes per role
      hooksLimit: rawUsage.hooksLimit,
      customJwtEnabled: rawUsage.customJwtEnabled,
      bringYourUiEnabled: rawUsage.bringYourUiEnabled,
      collectUserProfileEnabled: rawUsage.collectUserProfileEnabled,
      /** Add-on quotas start */
      machineToMachineLimit: rawUsage.machineToMachineLimit,
      resourcesLimit: rawUsage.resourcesLimit,
      enterpriseSsoLimit: rawUsage.enterpriseSsoLimit,
      mfaEnabled: rawUsage.mfaEnabled,
      securityFeaturesEnabled: rawUsage.securityFeaturesEnabled,
      /** Enterprise only add-on quotas */
      idpInitiatedSsoEnabled: rawUsage.idpInitiatedSsoEnabled,
      samlApplicationsLimit: rawUsage.samlApplicationsLimit,
      socialConnectorsLimit: socialConnectors.length,
      organizationsLimit: rawUsage.organizationsLimit,
      /**
       * We can not calculate the quota usage since there is no related DB configuration for such feature.
       * Whether the feature is enabled depends on the `quota` defined for each plan/SKU.
       * If we mark this value as always `true`, it could block the subscription downgrade (to free plan) since in free plan we do not allow impersonation feature.
       */
      subjectTokenEnabled: false,
    };

    return { usage: selfComputedSubscriptionUsageGuard.parse(unparsedUsage) };
  }

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

  /**
   * Fetch usage by key
   */
  private async fetchUsageByKey(
    key: keyof SubscriptionUsage
  ): Promise<SubscriptionUsage[keyof SubscriptionUsage]> {
    const { usage: fullUsage } =
      key === 'tenantMembersLimit'
        ? await getTenantUsageData(this.cloudConnection)
        : await this.getTenantUsage();

    return { tenantMembersLimit: 0, ...fullUsage }[key];
  }

  /**
   * Assert system limit
   */
  private assertSystemLimit(
    usage: SubscriptionUsage[keyof SubscriptionUsage],
    limit: SystemLimit[keyof SystemLimit],
    key: string
  ) {
    assertThat(
      typeof usage === 'number',
      new TypeError('Usage must be a number when checking numeric limit.')
    );

    assertThat(typeof limit === 'number', new TypeError('System limit must be a number.'));

    assertThat(
      usage < limit,
      new RequestError({
        code: 'system_limit.limit_exceeded',
        status: 403,
        data: { key, limit, usage },
      })
    );
  }

  /**
   * Assert quota limit
   */
  private assertQuotaLimit(
    usage: SubscriptionUsage[keyof SubscriptionUsage],
    limit: SubscriptionQuota[keyof SubscriptionQuota],
    key: string
  ) {
    if (limit === null) {
      return;
    }

    if (typeof limit === 'boolean') {
      assertThat(
        limit,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: { key },
        })
      );
      return;
    }

    if (typeof limit === 'number') {
      assertThat(
        typeof usage === 'number',
        new TypeError('Usage must be a number when limit is a number.')
      );

      assertThat(
        usage < limit,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: { key, limit, usage },
        })
      );
      return;
    }

    throw new TypeError('Unsupported subscription quota type');
  }
}
