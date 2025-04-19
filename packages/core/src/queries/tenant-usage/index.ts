/* eslint-disable max-lines */
import {
  Applications,
  ApplicationType,
  Scopes,
  Resources,
  getManagementApiResourceIndicator,
  Roles,
  RoleType,
  RolesScopes,
  Hooks,
  LogtoConfigs,
  LogtoJwtTokenKey,
  SignInExperiences,
  SsoConnectors,
  Organizations,
  SsoConnectorIdpInitiatedAuthConfigs,
  InternalRole,
} from '@logto/schemas';
import { sql } from '@silverhand/slonik';
import type { CommonQueryMethods, TaggedTemplateLiteralInvocation } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

import { tenantUsageGuard } from './types.js';

const { table: applicationsTable, fields: applicationsFields } = convertToIdentifiers(
  Applications,
  true
);
const { table: scopesTable, fields: scopesFields } = convertToIdentifiers(Scopes, true);
const { table: resourcesTable, fields: resourcesFields } = convertToIdentifiers(Resources, true);
const { table: rolesTable, fields: rolesFields } = convertToIdentifiers(Roles, true);
const { table: rolesScopesTable, fields: rolesScopesFields } = convertToIdentifiers(
  RolesScopes,
  true
);
const { table: hooksTable } = convertToIdentifiers(Hooks, true);
const { table: logtoConfigsTable, fields: logtoConfigsFields } = convertToIdentifiers(
  LogtoConfigs,
  true
);
const { table: signInExperiencesTable, fields: signInExperiencesFields } = convertToIdentifiers(
  SignInExperiences,
  true
);
const { table: ssoConnectorsTable } = convertToIdentifiers(SsoConnectors, true);
const { table: organizationsTable } = convertToIdentifiers(Organizations, true);
const { table: ssoConnectorIdpInitiatedAuthConfigsTable } = convertToIdentifiers(
  SsoConnectorIdpInitiatedAuthConfigs,
  true
);
const { table: signInExperienceTable, fields: signInExperienceFields } = convertToIdentifiers(
  SignInExperiences,
  true
);

export default class TenantUsageQuery {
  constructor(private readonly pool: CommonQueryMethods) {}

  public async getRawTenantUsage(tenantId: string) {
    const sqlQuery = sql`
      select ${sql.join(
        [
          this.countAllApplications(),
          this.countThirdPartyApplications(),
          this.countMachineToMachineApplications(),
          this.countMaxScopesPerResource(tenantId),
          this.countUserRoles(),
          this.countMachineToMachineRoles(),
          this.countMaxScopesPerRole(),
          this.countHooks(),
          this.isCustomJwtEnabled(),
          this.isBringYourUiEnabled(),
          this.countResources(tenantId),
          this.countEnterpriseSso(),
          this.isMfaEnabled(),
          this.countOrganizations(),
          this.isIdpInitiatedSsoEnabled(),
          this.countSamlApplications(),
          this.isSecurityFeaturesEnabled(),
        ].map(([query, key]) => sql`(${query}) as "${key}"`),
        sql`, `
      )}
    `;
    const usage = await this.pool.one(sqlQuery);

    return tenantUsageGuard.parse(usage);
  }

  public async getScopesForRolesTenantUsage() {
    const records = await this.pool.any<{ roleId: string; count: string }>(
      this.countScopesForRoles()
    );

    return Object.fromEntries(records.map(({ roleId, count }) => [roleId, Number(count)]));
  }

  public async getScopesForResourcesTenantUsage(tenantId: string) {
    const records = await this.pool.any<{ resourceId: string; count: string }>(
      this.countScopesForResources(tenantId)
    );

    return Object.fromEntries(records.map(({ resourceId, count }) => [resourceId, Number(count)]));
  }

  private readonly countAllApplications = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${applicationsTable}
      `,
      sql`applicationsLimit`,
    ];
  };

  private readonly countThirdPartyApplications = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${applicationsTable}
        where ${applicationsFields.isThirdParty} = true
      `,
      sql`thirdPartyApplicationsLimit`,
    ];
  };

  private readonly countMachineToMachineApplications = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${applicationsTable}
        where ${applicationsFields.type} = ${ApplicationType.MachineToMachine}
      `,
      sql`machineToMachineLimit`,
    ];
  };

  private readonly countMaxScopesPerResource = (
    tenantId: string
  ): [TaggedTemplateLiteralInvocation, TaggedTemplateLiteralInvocation] => {
    return [
      sql`
        with cte as (
          select ${scopesFields.resourceId}, count(*) as count
          from ${scopesTable}
          join ${resourcesTable} on ${scopesFields.resourceId} = ${resourcesFields.id}
          where ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(tenantId)}
          group by ${scopesFields.resourceId}
        ) select coalesce(max(count), 0) from cte
      `,
      sql`scopesPerResourceLimit`,
    ];
  };

  private readonly countUserRoles = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${rolesTable}
        where ${rolesFields.type} = ${RoleType.User}
      `,
      sql`userRolesLimit`,
    ];
  };

  private readonly countMachineToMachineRoles = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${rolesTable}
        where ${rolesFields.type} = ${RoleType.MachineToMachine}
        and ${rolesFields.name} != ${InternalRole.Admin}
      `,
      sql`machineToMachineRolesLimit`,
    ];
  };

  private readonly countMaxScopesPerRole = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        with cte as (
          select ${rolesFields.id}, count(*) as count
          from ${rolesTable}
          join ${rolesScopesTable} on ${rolesFields.id} = ${rolesScopesFields.roleId}
          group by ${rolesFields.id}
        ) select coalesce(max(count), 0) from cte
      `,
      sql`scopesPerRoleLimit`,
    ];
  };

  private readonly countHooks = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${hooksTable}
      `,
      sql`hooksLimit`,
    ];
  };

  private readonly isCustomJwtEnabled = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select exists (
          select * from ${logtoConfigsTable}
          where ${logtoConfigsFields.key} in (${sql.join(
            [LogtoJwtTokenKey.AccessToken, LogtoJwtTokenKey.ClientCredentials],
            sql`, `
          )})
        )
      `,
      sql`customJwtEnabled`,
    ];
  };

  private readonly isBringYourUiEnabled = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select exists (
          select * from ${signInExperiencesTable}
          where ${signInExperiencesFields.customUiAssets} is not null
        )
      `,
      sql`bringYourUiEnabled`,
    ];
  };

  private readonly countResources = (
    tenantId: string
  ): [TaggedTemplateLiteralInvocation, TaggedTemplateLiteralInvocation] => {
    return [
      sql`
        select
          count(*)
        from ${resourcesTable}
        where ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(tenantId)}
      `,
      sql`resourcesLimit`,
    ];
  };

  private readonly countEnterpriseSso = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${ssoConnectorsTable}
      `,
      sql`enterpriseSsoLimit`,
    ];
  };

  private readonly isMfaEnabled = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select exists (
          select * from ${signInExperiencesTable}
          where jsonb_array_length(${signInExperiencesFields.mfa}->'factors') > 0
        )
      `,
      sql`mfaEnabled`,
    ];
  };

  private readonly countOrganizations = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${organizationsTable}
      `,
      sql`organizationsLimit`,
    ];
  };

  private readonly isIdpInitiatedSsoEnabled = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select exists (
          select * from ${ssoConnectorIdpInitiatedAuthConfigsTable}
        )
    `,
      sql`idpInitiatedSsoEnabled`,
    ];
  };

  private readonly countSamlApplications = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${applicationsTable}
        where ${applicationsFields.type} = ${ApplicationType.SAML}
      `,
      sql`samlApplicationsLimit`,
    ];
  };

  private readonly countScopesForResources = (
    tenantId: string
  ): TaggedTemplateLiteralInvocation => {
    return sql`
      select ${scopesFields.resourceId}, count(*) as count
      from ${scopesTable}
      join ${resourcesTable} on ${scopesFields.resourceId} = ${resourcesFields.id}
      where ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(tenantId)}
      group by ${scopesFields.resourceId}
    `;
  };

  private readonly countScopesForRoles = (): TaggedTemplateLiteralInvocation => {
    return sql`
      select ${rolesScopesFields.roleId}, count(*) as count
      from ${rolesScopesTable}
      join ${rolesTable} on ${rolesScopesFields.roleId} = ${rolesFields.id}
      where ${rolesFields.name} != ${InternalRole.Admin}
      group by ${rolesScopesFields.roleId}
    `;
  };

  private readonly isSecurityFeaturesEnabled = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select exists (
          select * from ${signInExperienceTable}
          where ${signInExperienceFields.captchaPolicy}->>'enabled' = 'true'
          or ${signInExperienceFields.sentinelPolicy}->>'maxAttempts' is not null
          or ${signInExperienceFields.sentinelPolicy}->>'lockoutDuration' is not null
        )
    `,
      sql`securityFeaturesEnabled`,
    ];
  };
}
/* eslint-enable max-lines */
