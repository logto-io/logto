import { consoleLog } from '@logto/cli/lib/utils.js';
import phrases from '@logto/phrases';
import {
  type CreateUsersRole,
  type Role,
  type User,
  type Organization,
  type OrganizationRole,
  adminTenantId,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { deduplicate } from '@silverhand/essentials';
import { type QueryResult, type QueryResultRow } from '@silverhand/slonik';

import { EnvSet } from '#src/env-set/index.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import assertThat from '#src/utils/assert-that.js';

import { OGCIO_ORGANIZATION_ROLES, OGCIO_ORGANIZATIONS, OGCIO_ROLES } from './ogcio-constants.js';

const getDefaultOrganizationsForUser = async (organizationQueries: OrganizationQueries) => {
  const organizationNames: string[] = deduplicate(EnvSet.values.userDefaultOrganizationNames);
  consoleLog.info('DEFUALT ORG NAMES', organizationNames);
  if (organizationNames.length === 0) {
    return [];
  }
  const lowerOrganizationNames = new Set(organizationNames.map((name) => name.toLowerCase()));
  const allOrganizations = await organizationQueries.findAll();

  const outputOrgs = allOrganizations[1].filter((fromDatabaseOrg: Organization) =>
    lowerOrganizationNames.has(fromDatabaseOrg.name.toLowerCase())
  );

  assertThat(
    outputOrgs.length === organizationNames.length,
    'organization.default_organization_missing'
  );

  return outputOrgs;
};

const getDefaultOrganizationRolesForUser = async (organizationQueries: OrganizationQueries) => {
  const roleNames: string[] = deduplicate(EnvSet.values.userDefaultOrganizationRoleNames);
  consoleLog.info('DEFUALT ORG ROLE NAMES', roleNames);
  if (roleNames.length === 0) {
    return [];
  }
  const lowerRoleNames = new Set(roleNames.map((name) => name.toLowerCase()));
  const limit = 200;
  const offset = 0;
  // eslint-disable-next-line @silverhand/fp/no-let
  let outputRoleNames: OrganizationRole[] = [];
  // eslint-disable-next-line @silverhand/fp/no-let
  let foundCount = 1;
  while (outputRoleNames.length < lowerRoleNames.size && foundCount > 0) {
    // eslint-disable-next-line no-await-in-loop
    const allOrganizations = await organizationQueries.roles.findAll(limit, offset);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    foundCount = allOrganizations[0];
    // eslint-disable-next-line @silverhand/fp/no-mutation
    outputRoleNames = [
      ...outputRoleNames,
      ...allOrganizations[1].filter((fromDatabaseOrg: OrganizationRole) =>
        lowerRoleNames.has(fromDatabaseOrg.name.toLowerCase())
      ),
    ];
  }

  assertThat(
    outputRoleNames.length === lowerRoleNames.size,
    'organization.default_organization_role_missing'
  );

  return outputRoleNames;
};

const getOrganizationRelationsForUser = async (organizationQueries: OrganizationQueries) => {
  return {
    organizations: await getDefaultOrganizationsForUser(organizationQueries),
    roles: await getDefaultOrganizationRolesForUser(organizationQueries),
  };
};

const insertOrganizationRelationsForUser = async (params: {
  userId: string;
  organizationQueries: OrganizationQueries;
  organizations: Organization[];
  roles: OrganizationRole[];
}) => {
  if (params.organizations.length === 0) {
    return;
  }

  await Promise.all(
    params.organizations.map(async (org) =>
      params.organizationQueries.relations.users.insert({
        organizationId: org.id,
        userId: params.userId,
      })
    )
  );

  if (params.roles.length > 0) {
    const rolesMappings: Array<{
      organizationId: string;
      organizationRoleId: string;
      userId: string;
    }> = [];
    for (const role of params.roles) {
      for (const org of params.organizations) {
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        rolesMappings.push({
          organizationId: org.id,
          organizationRoleId: role.id,
          userId: params.userId,
        });
      }
    }

    await Promise.all(
      rolesMappings.map(async (roleMap) =>
        params.organizationQueries.relations.usersRoles.insert(roleMap)
      )
    );
  }
};

export const manageDefaultOrganizations = async (params: {
  userId: string;
  organizationQueries: OrganizationQueries;
}) => {
  const orgRelations = await getOrganizationRelationsForUser(params.organizationQueries);
  await insertOrganizationRelationsForUser({
    userId: params.userId,
    ...orgRelations,
    organizationQueries: params.organizationQueries,
  });
};

const PUBLIC_SERVANT_DOMAINS = new Set(['gov.ie']);

const getDomainFromEmail = (email: string): string | undefined => {
  return email.split('@')[1];
};

const assignCitizenRole = async (
  user: User,
  getRoles: (id: string) => Promise<Role>,
  insertUsersRoles: (usersRoles: CreateUsersRole[]) => Promise<QueryResult<QueryResultRow>>
) => {
  const userRole = await getRoles(OGCIO_ROLES.BB_CITIZEN);

  return insertUsersRoles([
    {
      tenantId: user.tenantId,
      id: generateStandardId(),
      userId: user.id,
      roleId: userRole.id,
    },
  ]);
};

const assignUserToOrganization = async (user: User, organizationQueries: OrganizationQueries) => {
  try {
    const organization = await organizationQueries.findById(OGCIO_ORGANIZATIONS.OGCIO);
    await organizationQueries.relations.users.insert({
      organizationId: organization.id,
      userId: user.id,
    });
    return organization;
  } catch {
    consoleLog.error(phrases.en.errors.entity.not_exists_with_id);
  }
};

const assignOrganizationRoleToUser = async (
  user: User,
  organization: Organization,
  organizationQueries: OrganizationQueries
) => {
  const publicServantRole = await organizationQueries.roles.findById(
    OGCIO_ORGANIZATION_ROLES.BB_PUBLIC_SERVANT
  );

  await organizationQueries.relations.usersRoles.insert({
    organizationId: organization.id,
    organizationRoleId: publicServantRole.id,
    userId: user.id,
  });
};

const assignPublicServantRole = async (user: User, organizationQueries: OrganizationQueries) => {
  const organization = await assignUserToOrganization(user, organizationQueries);

  if (!organization) {
    return;
  }

  await assignOrganizationRoleToUser(user, organization, organizationQueries);
};

export const manageDefaultUserRole = async (
  user: User,
  getRoles: (id: string) => Promise<Role>,
  insertUsersRoles: (usersRoles: CreateUsersRole[]) => Promise<QueryResult<QueryResultRow>>,
  organizationQueries: OrganizationQueries
) => {
  if (user.tenantId === adminTenantId) {
    return;
  }

  if (user.primaryEmail === null) {
    consoleLog.error(phrases.en.errors.user.email_not_exist);
    return;
  }

  const domain = getDomainFromEmail(user.primaryEmail);

  if (domain === undefined) {
    consoleLog.error(phrases.en.errors.user.invalid_email);
    return;
  }

  if (PUBLIC_SERVANT_DOMAINS.has(domain)) {
    return assignPublicServantRole(user, organizationQueries);
  }

  return assignCitizenRole(user, getRoles, insertUsersRoles);
};
