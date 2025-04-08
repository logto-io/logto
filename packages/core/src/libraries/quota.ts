import { ReservedPlanId, ConnectorType } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import assertThat from '#src/utils/assert-that.js';
import {
  reportSubscriptionUpdates,
  isReportSubscriptionUpdatesUsageKey,
  getTenantUsageData,
} from '#src/utils/subscription/index.js';
import { type SubscriptionQuota, type SubscriptionUsage } from '#src/utils/subscription/types.js';

import TenantUsageQuery from '../queries/tenant-usage/index.js';
import {
  tenantUsageGuard,
  selfComputedSubscriptionUsageGuard,
  type SelfComputedTenantUsage,
} from '../queries/tenant-usage/types.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';
import { type ConnectorLibrary } from './connector.js';

const paidReservedPlans = new Set<string>([ReservedPlanId.Pro, ReservedPlanId.Pro202411]);

export class QuotaLibrary {
  private readonly sqlBuilder: TenantUsageQuery;

  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly connectorLibrary: ConnectorLibrary,
    public readonly tenantId: string,
    private readonly cloudConnection: CloudConnectionLibrary,
    private readonly subscription: SubscriptionLibrary
  ) {
    this.sqlBuilder = new TenantUsageQuery(tenantId);
  }

  guardTenantUsageByKey = async (key: keyof SubscriptionUsage) => {
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

    const { usage: fullUsage } =
      key === 'tenantMembersLimit'
        ? await getTenantUsageData(this.cloudConnection)
        : // `tenantMembersLimit` need to compute from admin tenant level
          await this.getTenantUsage();

    // Type `SubscriptionQuota` and type `SubscriptionUsage` are sharing keys, this design helps us to compare the usage with the quota limit in a easier way.
    const { [key]: limit } = fullQuota;
    /**
     * `tenantMembersLimit` need to compute from admin tenant level, in previous code, we use cloud API to request tenant members count when necessary,
     * otherwise, we use self computed usage.
     * Since self computed usage do not include `tenantMembersLimit`, we need to manually add it to the usage object.
     */
    const { [key]: usage } = { tenantMembersLimit: 0, ...fullUsage };

    if (limit === null) {
      return;
    }

    if (typeof limit === 'boolean') {
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

    if (typeof limit === 'number') {
      // See the definition of `SubscriptionQuota` and `SubscriptionUsage` in `types.ts`, this should never happen.
      assertThat(
        typeof usage === 'number',
        new TypeError('Usage must be with the same type as the limit.')
      );

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

  guardEntityScopesUsage = async (entityName: 'resources' | 'roles', entityId: string) => {
    const { isCloud } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    const {
      quota: { scopesPerResourceLimit, scopesPerRoleLimit },
    } = await this.subscription.getSubscriptionData();

    const { [entityName]: usage = 0 } =
      entityName === 'resources'
        ? await this.getScopesForResourcesTenantUsage()
        : await this.getScopesForRolesTenantUsage();

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
    const rawUsage = await this.getRawTenantUsage();

    const connectors = await this.connectorLibrary.getLogtoConnectors();
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
      /** Add-on quotas start */
      machineToMachineLimit: rawUsage.machineToMachineLimit,
      resourcesLimit: rawUsage.resourcesLimit,
      enterpriseSsoLimit: rawUsage.enterpriseSsoLimit,
      mfaEnabled: rawUsage.mfaEnabled,
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

  public async getScopesForRolesTenantUsage() {
    const records = await this.pool.any<{ roleId: string; count: string }>(
      this.sqlBuilder.countScopesForRoles()
    );

    return Object.fromEntries(records.map(({ roleId, count }) => [roleId, Number(count)]));
  }

  public async getScopesForResourcesTenantUsage() {
    const records = await this.pool.any<{ resourceId: string; count: string }>(
      this.sqlBuilder.countScopesForResources()
    );

    return Object.fromEntries(records.map(({ resourceId, count }) => [resourceId, Number(count)]));
  }

  private async getRawTenantUsage() {
    const sqlQuery = sql`
      select ${sql.join(
        [
          this.sqlBuilder.countAllApplications(),
          this.sqlBuilder.countThirdPartyApplications(),
          this.sqlBuilder.countMachineToMachineApplications(),
          this.sqlBuilder.countMaxScopesPerResource(),
          this.sqlBuilder.countUserRoles(),
          this.sqlBuilder.countMachineToMachineRoles(),
          this.sqlBuilder.countMaxScopesPerRole(),
          this.sqlBuilder.countHooks(),
          this.sqlBuilder.isCustomJwtEnabled(),
          this.sqlBuilder.isBringYourUiEnabled(),
          this.sqlBuilder.countResources(),
          this.sqlBuilder.countEnterpriseSso(),
          this.sqlBuilder.isMfaEnabled(),
          this.sqlBuilder.countOrganizations(),
          this.sqlBuilder.isIdpInitiatedSsoEnabled(),
          this.sqlBuilder.countSamlApplications(),
        ].map(([query, key]) => sql`(${query}) as "${key}"`),
        sql`, `
      )}
    `;
    const usage = await this.pool.one(sqlQuery);

    return tenantUsageGuard.parse(usage);
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
}
