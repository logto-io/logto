import { consoleLog } from '@logto/cli/lib/utils.js';
import { type Organization, type OrganizationRole } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import assertThat from '#src/utils/assert-that.js';

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

  const orgMappings = params.organizations.map((organization: Organization): [string, string] => [
    organization.id,
    params.userId,
  ]);

  await Promise.all(
    orgMappings.map(async (org) => params.organizationQueries.relations.users.insert(org))
  );

  if (params.roles.length > 0) {
    // Org id, role id, user id
    const rolesMappings: Array<[string, string, string]> = [];
    for (const role of params.roles) {
      for (const orgMap of orgMappings) {
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        rolesMappings.push([orgMap[0], role.id, orgMap[1]]);
      }
    }

    await Promise.all(
      rolesMappings.map(async (roleMap) =>
        params.organizationQueries.relations.rolesUsers.insert(roleMap)
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