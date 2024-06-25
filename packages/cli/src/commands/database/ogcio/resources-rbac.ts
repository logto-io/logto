/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-let */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */
import { RolesScopes } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import {
  type ResourceSeedingRole,
  type ResourceSeedingScope,
  type ResourceScopesLists,
  createScopes,
  createRoles,
  fillScopesGroup,
  getScopesPerRole,
  ensureRoleHasAtLeastOneScope,
  type ScopesLists,
} from './common-rbac.js';
import { type ResourceRoleSeeder, type ResourcePermissionSeeder } from './ogcio-seeder.js';
import { createItem } from './queries.js';
import { type SeedingResource } from './resources.js';

const getFullListOfScopesPerRole = (
  roleToSeed: ResourceRoleSeeder,
  scopesLists: ResourceScopesLists
): ResourceSeedingScope[] => {
  ensureRoleHasAtLeastOneScope(roleToSeed.name, roleToSeed.permissions);
  let fullList: ResourceSeedingScope[] = [];
  for (const permissionsGroup of roleToSeed.permissions) {
    for (const resource of permissionsGroup.for_resource_ids) {
      fullList = [
        ...fullList,
        ...getScopesPerRole({ name: roleToSeed.name, ...permissionsGroup }, scopesLists[resource]!),
      ];
    }
  }
  ensureRoleHasAtLeastOneScope(roleToSeed.name, fullList);

  return fullList;
};

const fillRole = (
  roleToSeed: ResourceRoleSeeder,
  scopesLists: ResourceScopesLists
): ResourceSeedingRole => ({
  name: roleToSeed.name,
  description: roleToSeed.description,
  scopes: getFullListOfScopesPerRole(roleToSeed, scopesLists),
});

const fillRoles = (rolesToSeed: ResourceRoleSeeder[], scopesLists: ResourceScopesLists) =>
  rolesToSeed.map((role) => fillRole(role, scopesLists));

type SeedingRelation = { role_id: string; scope_id: string; id?: string };

const createRoleScopeRelation = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  relation: SeedingRelation
) =>
  createItem({
    transaction,
    tableName: RolesScopes.table,
    tenantId,
    toLogFieldName: 'role_id',
    whereClauses: [sql`role_id = ${relation.role_id}`, sql`scope_id = ${relation.scope_id}`],
    toInsert: relation,
  });

const createRelations = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  roles: Record<string, ResourceSeedingRole>;
}) => {
  const queries: Array<Promise<SeedingRelation>> = [];
  for (const role of Object.values(params.roles)) {
    for (const scope of role.scopes) {
      queries.push(
        createRoleScopeRelation(params.transaction, params.tenantId, {
          role_id: role.id!,
          scope_id: scope.id!,
        })
      );
    }
  }
  return Promise.all(queries);
};

const replaceWithResourceIdFromDatabase = (
  seededResources: Record<string, SeedingResource>,
  toSeed: {
    resource_permissions?: ResourcePermissionSeeder[];
    resource_roles?: ResourceRoleSeeder[];
  }
): {
  resource_permissions?: ResourcePermissionSeeder[];
  resource_roles?: ResourceRoleSeeder[];
} => {
  if (toSeed.resource_permissions?.length) {
    for (const permission of toSeed.resource_permissions) {
      const toSetResourceIds = [];
      for (const resourceId of permission.for_resource_ids) {
        if (!seededResources[resourceId]) {
          throw new Error(
            `Resource scopes. Referring to a not existent resource id: ${resourceId}!`
          );
        }
        toSetResourceIds.push(seededResources[resourceId]!.id!);
      }
      permission.for_resource_ids = toSetResourceIds;
    }
  }

  if (toSeed.resource_roles?.length) {
    for (const roles of toSeed.resource_roles) {
      const toSetResourceIds = [];
      for (const permissionGroup of roles.permissions) {
        for (const resourceId of permissionGroup.for_resource_ids) {
          if (!seededResources[resourceId]) {
            throw new Error(
              `Resource roles. Referring to a not existent resource id: ${resourceId}!`
            );
          }
          toSetResourceIds.push(seededResources[resourceId]!.id!);
        }
        permissionGroup.for_resource_ids = toSetResourceIds;
      }
    }
  }

  return toSeed;
};

export const seedResourceRbacData = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  seededResources: Record<string, SeedingResource>;
  toSeed: {
    resource_permissions?: ResourcePermissionSeeder[];
    resource_roles?: ResourceRoleSeeder[];
  };
}): Promise<{
  scopes: ResourceScopesLists;
  roles: Record<string, ResourceSeedingRole>;
  relations: SeedingRelation[];
}> => {
  params.toSeed = replaceWithResourceIdFromDatabase(params.seededResources, params.toSeed);
  if (params.toSeed.resource_permissions?.length && params.toSeed.resource_roles?.length) {
    const createdScopes = await createScopes({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopesToSeed: params.toSeed.resource_permissions,
      fillScopesMethod: fillScopes,
    });
    const createdRoles = await createRoles({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopesLists: createdScopes,
      rolesToSeed: params.toSeed.resource_roles,
      fillRolesMethod: fillRoles,
    });
    const createdRelations = await createRelations({
      transaction: params.transaction,
      tenantId: params.tenantId,
      roles: createdRoles,
    });

    return { scopes: createdScopes, roles: createdRoles, relations: createdRelations };
  }

  return { scopes: {}, roles: {}, relations: [] };
};

const getEmptyList = (): ScopesLists<ResourceSeedingScope> => ({
  scopesList: [],
  scopesByEntity: {},
  scopesByAction: {},
  scopesByFullName: {},
});

const fillScopes = (scopesToSeed: ResourcePermissionSeeder[]): ResourceScopesLists => {
  const fullLists: ResourceScopesLists = {};
  for (const singleSeeder of scopesToSeed) {
    for (const resource of singleSeeder.for_resource_ids) {
      fullLists[resource] = getEmptyList();
      fillScopesGroup(singleSeeder, fullLists[resource]!, resource);
    }
  }

  return fullLists;
};
