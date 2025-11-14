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
  SsoConnectors,
  Organizations,
  InternalRole,
  OrganizationUserRelations,
  OrganizationRoles,
  OrganizationScopes,
  Domains,
} from '@logto/schemas';
import { sql } from '@silverhand/slonik';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

import {
  type TenantBasedUsageKey,
  type EntityBasedUsageKey,
  type SelfComputedUsageKey,
} from './types.js';

type UsageQuery = (tenantId: string) => Promise<number>;
type UsageQueryWithEntityId = (tenantId: string, entityId: string) => Promise<number>;

type UsageQueryRegistery = { [key in TenantBasedUsageKey]: UsageQuery } & {
  [key in EntityBasedUsageKey]: UsageQueryWithEntityId;
};

type GetSelfComputedUsageByKey<K extends SelfComputedUsageKey> = (
  tenantId: string,
  key: K,
  entityId: K extends EntityBasedUsageKey ? string : undefined
) => Promise<number>;

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
const { table: ssoConnectorsTable } = convertToIdentifiers(SsoConnectors, true);
const { table: organizationsTable } = convertToIdentifiers(Organizations, true);
const { table: organizationUserRelationsTable, fields: organizationUserRelationsFields } =
  convertToIdentifiers(OrganizationUserRelations, true);
const { table: organizationRolesTable, fields: organizationRolesFields } = convertToIdentifiers(
  OrganizationRoles,
  true
);
const { table: organizationScopesTable } = convertToIdentifiers(OrganizationScopes, true);
const { table: domainsTable } = convertToIdentifiers(Domains, true);

export default class TenantUsageQuery {
  constructor(private readonly pool: CommonQueryMethods) {}

  private get selfComputedUsageQueryRegistery(): UsageQueryRegistery {
    return {
      applicationsLimit: this.countAllApplications,
      thirdPartyApplicationsLimit: this.countThirdPartyApplications,
      machineToMachineLimit: this.countMachineToMachineApplications,
      userRolesLimit: this.countUserRoles,
      machineToMachineRolesLimit: this.countMachineToMachineRoles,
      scopesPerRoleLimit: this.countScopesForRole,
      scopesPerResourceLimit: this.countScopesForResource,
      hooksLimit: this.countHooks,
      resourcesLimit: this.countResources,
      enterpriseSsoLimit: this.countEnterpriseSso,
      organizationsLimit: this.countOrganizations,
      samlApplicationsLimit: this.countSamlApplications,
      usersPerOrganizationLimit: this.countUsersForOrganization,
      organizationUserRolesLimit: this.countOrganizationUserRoles,
      organizationMachineToMachineRolesLimit: this.countOrganizationMachineToMachineRoles,
      organizationScopesLimit: this.countOrganizationScopes,
      customDomainsLimit: this.countCustomDomains,
    };
  }

  public getSelfComputedUsageByKey: GetSelfComputedUsageByKey<SelfComputedUsageKey> = async (
    tenantId,
    key,
    entityId
  ) => {
    const query = this.selfComputedUsageQueryRegistery[key];
    // @ts-expect-error -- TypeScript cannot infer the correct type here due to conditional type complexity
    return query(tenantId, entityId);
  };

  private readonly countAllApplications: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${applicationsTable}
    `);

    return Number(result.count);
  };

  private readonly countThirdPartyApplications: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${applicationsTable}
      where ${applicationsFields.isThirdParty} = true
    `);

    return Number(result.count);
  };

  private readonly countMachineToMachineApplications: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${applicationsTable}
      where ${applicationsFields.type} = ${ApplicationType.MachineToMachine}
    `);

    return Number(result.count);
  };

  private readonly countScopesForResource: UsageQueryWithEntityId = async (
    tenantId: string,
    entityId: string
  ): Promise<number> => {
    const result = await this.pool.one<{ count: string }>(sql`
      select count(*) as count
      from ${scopesTable}
      join ${resourcesTable} on ${scopesFields.resourceId} = ${resourcesFields.id}
      where ${scopesFields.resourceId} = ${entityId}
      and ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(tenantId)}
    `);
    return Number(result.count);
  };

  private readonly countUserRoles: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${rolesTable}
      where ${rolesFields.type} = ${RoleType.User}
    `);

    return Number(result.count);
  };

  private readonly countMachineToMachineRoles: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${rolesTable}
      where ${rolesFields.type} = ${RoleType.MachineToMachine}
      and ${rolesFields.name} != ${InternalRole.Admin}
    `);

    return Number(result.count);
  };

  private readonly countScopesForRole: UsageQueryWithEntityId = async (
    _: string,
    entityId: string
  ): Promise<number> => {
    const result = await this.pool.one<{ count: string }>(sql`
    select count(*) as count
    from ${rolesScopesTable}
    where ${rolesScopesFields.roleId} = ${entityId}
  `);

    return Number(result.count);
  };

  private readonly countHooks: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${hooksTable}
    `);

    return Number(result.count);
  };

  private readonly countResources: UsageQuery = async (tenantId) => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${resourcesTable}
      where ${resourcesFields.indicator} != ${getManagementApiResourceIndicator(tenantId)}
    `);

    return Number(result.count);
  };

  private readonly countEnterpriseSso: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${ssoConnectorsTable}
    `);

    return Number(result.count);
  };

  private readonly countOrganizations: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${organizationsTable}
    `);

    return Number(result.count);
  };

  private readonly countUsersForOrganization: UsageQueryWithEntityId = async (
    _: string,
    entityId: string
  ): Promise<number> => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${organizationUserRelationsTable}
      where ${organizationUserRelationsFields.organizationId} = ${entityId}
    `);

    return Number(result.count);
  };

  private readonly countOrganizationUserRoles: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${organizationRolesTable}
      where ${organizationRolesFields.type} = ${RoleType.User}
    `);

    return Number(result.count);
  };

  private readonly countOrganizationMachineToMachineRoles: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${organizationRolesTable}
      where ${organizationRolesFields.type} = ${RoleType.MachineToMachine}
    `);

    return Number(result.count);
  };

  private readonly countOrganizationScopes: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${organizationScopesTable}
    `);

    return Number(result.count);
  };

  private readonly countSamlApplications: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`
      select
        count(*)
      from ${applicationsTable}
      where ${applicationsFields.type} = ${ApplicationType.SAML}
    `);

    return Number(result.count);
  };

  private readonly countCustomDomains: UsageQuery = async () => {
    const result = await this.pool.one<{ count: string }>(sql`  
      select
        count(*)
      from ${domainsTable}
    `);

    return Number(result.count);
  };
}
