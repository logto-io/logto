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
import type { TaggedTemplateLiteralInvocation } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

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

export default class TenantUsageQuery {
  constructor(public readonly tenantId: string) {}

  public readonly countAllApplications = (): [
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

  public readonly countThirdPartyApplications = (): [
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

  public readonly countMachineToMachineApplications = (): [
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

  public readonly countMaxScopesPerResource = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        with cte as (
          select ${scopesFields.resourceId}, count(*) as count
          from ${scopesTable}
          join ${resourcesTable} on ${scopesFields.resourceId} = ${resourcesFields.id}
          where ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(this.tenantId)}
          group by ${scopesFields.resourceId}
        ) select coalesce(max(count), 0) from cte
      `,
      sql`scopesPerResourceLimit`,
    ];
  };

  public readonly countUserRoles = (): [
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

  public readonly countMachineToMachineRoles = (): [
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

  public readonly countMaxScopesPerRole = (): [
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

  public readonly countHooks = (): [
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

  public readonly isCustomJwtEnabled = (): [
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

  public readonly isBringYourUiEnabled = (): [
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

  public readonly countResources = (): [
    TaggedTemplateLiteralInvocation,
    TaggedTemplateLiteralInvocation,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${resourcesTable}
        where ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(this.tenantId)}
      `,
      sql`resourcesLimit`,
    ];
  };

  public readonly countEnterpriseSso = (): [
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

  public readonly isMfaEnabled = (): [
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

  public readonly countOrganizations = (): [
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

  public readonly isIdpInitiatedSsoEnabled = (): [
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

  public readonly countSamlApplications = (): [
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

  public readonly countScopesForResources = (): TaggedTemplateLiteralInvocation => {
    return sql`
      select ${scopesFields.resourceId}, count(*) as count
      from ${scopesTable}
      join ${resourcesTable} on ${scopesFields.resourceId} = ${resourcesFields.id}
      where ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(this.tenantId)}
      group by ${scopesFields.resourceId}
    `;
  };

  public readonly countScopesForRoles = (): TaggedTemplateLiteralInvocation => {
    return sql`
      select ${rolesScopesFields.roleId}, count(*) as count
      from ${rolesScopesTable}
      join ${rolesTable} on ${rolesScopesFields.roleId} = ${rolesFields.id}
      where ${rolesFields.name} != ${InternalRole.Admin}
      group by ${rolesScopesFields.roleId}
    `;
  };
}
