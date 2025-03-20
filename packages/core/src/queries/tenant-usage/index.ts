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

import { type TenantUsage } from './types.js';

const { table: applicationsTable, fields: applicationsFields } = convertToIdentifiers(Applications);
const { table: scopesTable, fields: scopesFields } = convertToIdentifiers(Scopes);
const { table: resourcesTable, fields: resourcesFields } = convertToIdentifiers(Resources);
const { table: rolesTable, fields: rolesFields } = convertToIdentifiers(Roles);
const { table: rolesScopesTable, fields: rolesScopesFields } = convertToIdentifiers(RolesScopes);
const { table: hooksTable } = convertToIdentifiers(Hooks);
const { table: logtoConfigsTable, fields: logtoConfigsFields } = convertToIdentifiers(LogtoConfigs);
const { table: signInExperiencesTable, fields: signInExperiencesFields } =
  convertToIdentifiers(SignInExperiences);
const { table: ssoConnectorsTable } = convertToIdentifiers(SsoConnectors);
const { table: organizationsTable } = convertToIdentifiers(Organizations);
const { table: ssoConnectorIdpInitiatedAuthConfigsTable } = convertToIdentifiers(
  SsoConnectorIdpInitiatedAuthConfigs
);

export default class TenantUsageQuery {
  constructor(public readonly tenantId: string) {}

  public readonly countAllApplications = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${applicationsTable}
      `,
      'applicationsLimit',
    ];
  };

  public readonly countThirdPartyApplications = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${applicationsTable}
        where ${applicationsFields.isThirdParty} = true
      `,
      'thirdPartyApplicationsLimit',
    ];
  };

  public readonly countMachineToMachineApplications = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${applicationsTable}
        where ${applicationsFields.type} = ${ApplicationType.MachineToMachine}
      `,
      'machineToMachineLimit',
    ];
  };

  public readonly countMaxScopesPerResource = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
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
      'scopesPerResourceLimit',
    ];
  };

  public readonly countUserRoles = (): [TaggedTemplateLiteralInvocation, keyof TenantUsage] => {
    return [
      sql`
        select
          count(*)
        from ${rolesTable}
        where ${rolesFields.type} = ${RoleType.User}
      `,
      'userRolesLimit',
    ];
  };

  public readonly countMachineToMachineRoles = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${rolesTable}
        where ${rolesFields.type} = ${RoleType.MachineToMachine}
        and ${rolesFields.name} != ${InternalRole.Admin}
      `,
      'machineToMachineRolesLimit',
    ];
  };

  public readonly countMaxScopesPerRole = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
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
      'scopesPerRoleLimit',
    ];
  };

  public readonly countHooks = (): [TaggedTemplateLiteralInvocation, keyof TenantUsage] => {
    return [
      sql`
        select
          count(*)
        from ${hooksTable}
      `,
      'hooksLimit',
    ];
  };

  public readonly isCustomJwtEnabled = (): [TaggedTemplateLiteralInvocation, keyof TenantUsage] => {
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
      'customJwtEnabled',
    ];
  };

  public readonly isBringYourUiEnabled = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
  ] => {
    return [
      sql`
        select exists (
          select * from ${signInExperiencesTable}
          where ${signInExperiencesFields.customUiAssets} is not null
        )
      `,
      'bringYourUiEnabled',
    ];
  };

  public readonly countResources = (): [TaggedTemplateLiteralInvocation, keyof TenantUsage] => {
    return [
      sql`
        select
          count(*)
        from ${resourcesTable}
        where ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(this.tenantId)}
      `,
      'resourcesLimit',
    ];
  };

  public readonly countEnterpriseSso = (): [TaggedTemplateLiteralInvocation, keyof TenantUsage] => {
    return [
      sql`
        select
          count(*)
        from ${ssoConnectorsTable}
      `,
      'enterpriseSsoLimit',
    ];
  };

  public readonly isMfaEnabled = (): [TaggedTemplateLiteralInvocation, keyof TenantUsage] => {
    return [
      sql`
        select exists (
          select * from ${signInExperiencesTable}
          where jsonb_array_length(${signInExperiencesFields.mfa}->'factors') > 0
        )
      `,
      'mfaEnabled',
    ];
  };

  public readonly countOrganizations = (): [TaggedTemplateLiteralInvocation, keyof TenantUsage] => {
    return [
      sql`
        select
          count(*)
        from ${organizationsTable}
      `,
      'organizationsLimit',
    ];
  };

  public readonly isIdpInitiatedSsoEnabled = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
  ] => {
    return [
      sql`
        select exists (
          select * from ${ssoConnectorIdpInitiatedAuthConfigsTable}
        )
    `,
      'idpInitiatedSsoEnabled',
    ];
  };

  public readonly countSamlApplications = (): [
    TaggedTemplateLiteralInvocation,
    keyof TenantUsage,
  ] => {
    return [
      sql`
        select
          count(*)
        from ${applicationsTable}
        where ${applicationsFields.type} = ${ApplicationType.SAML}
      `,
      'samlApplicationsLimit',
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
