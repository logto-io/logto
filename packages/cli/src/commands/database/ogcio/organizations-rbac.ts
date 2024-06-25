/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */

import { OrganizationRoleScopeRelations } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import {
  type OrganizationSeedingRole,
  type OrganizationScopesLists,
  createScopes,
  fillScopesGroup,
  getScopesPerRole,
  createRoles,
} from './common-rbac.js';
import { type OrganizationPermissionSeeder, type OrganizationRoleSeeder } from './ogcio-seeder.js';
import { createItemWithoutId } from './queries.js';

type SeedingRelation = { organization_role_id: string; organization_scope_id: string };

const fillScopes = (scopesToSeed: OrganizationPermissionSeeder[]): OrganizationScopesLists => {
  const fullLists: OrganizationScopesLists = {
    scopesList: [],
    scopesByEntity: {},
    scopesByAction: {},
    scopesByFullName: {},
  };

  for (const singleSeeder of scopesToSeed) {
    fillScopesGroup(singleSeeder, fullLists);
  }

  return fullLists;
};

const fillRole = (
  roleToSeed: OrganizationRoleSeeder,
  scopesLists: OrganizationScopesLists
): OrganizationSeedingRole => ({
  name: roleToSeed.name,
  description: roleToSeed.description,
  scopes: getScopesPerRole(roleToSeed, scopesLists),
});

const fillRoles = (rolesToSeed: OrganizationRoleSeeder[], scopesLists: OrganizationScopesLists) =>
  rolesToSeed.map((role) => fillRole(role, scopesLists));

const createRoleScopeRelation = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  relation: SeedingRelation
) =>
  createItemWithoutId({
    transaction,
    tableName: OrganizationRoleScopeRelations.table,
    tenantId,
    toLogFieldName: 'organization_role_id',
    whereClauses: [
      sql`organization_role_id = ${relation.organization_role_id}`,
      sql`organization_scope_id = ${relation.organization_scope_id}`,
    ],
    toInsert: relation,
    columnToGet: 'organization_role_id',
  });

const createRelations = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  roles: Record<string, OrganizationSeedingRole>
) => {
  const queries: Array<Promise<SeedingRelation>> = [];
  for (const role of Object.values(roles)) {
    for (const scope of role.scopes) {
      queries.push(
        createRoleScopeRelation(transaction, tenantId, {
          organization_role_id: role.id!,
          organization_scope_id: scope.id!,
        })
      );
    }
  }
  return Promise.all(queries);
};

export const seedOrganizationRbacData = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  toSeed: {
    organization_permissions?: OrganizationPermissionSeeder[];
    organization_roles?: OrganizationRoleSeeder[];
  };
}): Promise<{
  scopes: OrganizationScopesLists;
  roles: Record<string, OrganizationSeedingRole>;
  relations: SeedingRelation[];
}> => {
  if (params.toSeed.organization_permissions?.length && params.toSeed.organization_roles?.length) {
    const createdScopes = await createScopes({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopesToSeed: params.toSeed.organization_permissions,
      fillScopesMethod: fillScopes,
    });

    const createdRoles = await createRoles({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopesLists: createdScopes,
      rolesToSeed: params.toSeed.organization_roles,
      fillRolesMethod: fillRoles,
    });
    const relations = await createRelations(params.transaction, params.tenantId, createdRoles);

    return { scopes: createdScopes, roles: createdRoles, relations };
  }

  return {
    scopes: {
      scopesList: [],
      scopesByEntity: {},
      scopesByAction: {},
      scopesByFullName: {},
    },
    roles: {},
    relations: [],
  };
};
