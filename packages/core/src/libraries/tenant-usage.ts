import { ConnectorType } from '@logto/schemas';
import { sql } from '@silverhand/slonik';
import type { CommonQueryMethods } from '@silverhand/slonik';

import type { ConnectorLibrary } from '#src/libraries/connector.js';

import TenantUsageQuery from '../queries/tenant-usage/index.js';
import {
  tenantUsageGuard,
  selfComputedSubscriptionUsageGuard,
  type SelfComputedTenantUsage,
} from '../queries/tenant-usage/types.js';

export class SelfComputedUsage {
  private readonly sqlBuilder: TenantUsageQuery;

  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly connectorLibrary: ConnectorLibrary,
    public readonly tenantId: string
  ) {
    this.sqlBuilder = new TenantUsageQuery(tenantId);
  }

  public async getTenantUsage(): Promise<{ usage: SelfComputedTenantUsage }> {
    const rawUsage = await this.getRawTenantUsage();

    const connectors = await this.connectorLibrary.getLogtoConnectors();
    const socialConnectors = connectors.filter(
      (connector) => connector.type === ConnectorType.Social
    );

    const unparsedUsage: SelfComputedTenantUsage = {
      applicationsLimit: Number(rawUsage.applicationsLimit),
      thirdPartyApplicationsLimit: Number(rawUsage.thirdPartyApplicationsLimit),
      scopesPerResourceLimit: Number(rawUsage.scopesPerResourceLimit), // Max scopes per resource
      // socialConnectorsLimit: z.number(),
      userRolesLimit: Number(rawUsage.userRolesLimit),
      machineToMachineRolesLimit: Number(rawUsage.machineToMachineRolesLimit),
      scopesPerRoleLimit: Number(rawUsage.scopesPerRoleLimit), // Max scopes per role
      hooksLimit: Number(rawUsage.hooksLimit),
      customJwtEnabled: rawUsage.customJwtEnabled,
      // SubjectTokenEnabled: z.boolean(),
      bringYourUiEnabled: rawUsage.bringYourUiEnabled,
      /** Add-on quotas start */
      machineToMachineLimit: Number(rawUsage.machineToMachineLimit),
      resourcesLimit: Number(rawUsage.resourcesLimit),
      enterpriseSsoLimit: Number(rawUsage.enterpriseSsoLimit),
      // TenantMembersLimit: z.number(),
      mfaEnabled: rawUsage.mfaEnabled,
      // OrganizationsLimit: z.number(),
      /** Enterprise only add-on quotas */
      idpInitiatedSsoEnabled: rawUsage.idpInitiatedSsoEnabled,
      samlApplicationsLimit: Number(rawUsage.samlApplicationsLimit),
      socialConnectorsLimit: socialConnectors.length,
      organizationsLimit: Number(rawUsage.organizationsLimit),
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
    const usage = await this.pool.one(sql`
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
        ].map(([query, key]) => sql`(${query}) as '${key}'`),
        sql`, `
      )}
    `);

    return tenantUsageGuard.parse(usage);
  }
}
