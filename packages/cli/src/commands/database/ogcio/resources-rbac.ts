/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-let */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */
import { Roles, RolesScopes, Scopes } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';
import { type ResourceRoleSeeder, type ResourcePermissionSeeder, ScopePerResourceRoleSeeder } from './ogcio-seeder.js';
import { createItem } from './queries.js';
import { type SeedingResource } from './resources.js';

type SeedingScope = {
  name: string;
  id?: string;
  resource_id: string;
  description: string;
};
type ScopesByName = Record<string, SeedingScope>;
type ScopesByResourceId = Record<string, ScopesByName>;
type SeededRole = {
  id?: string;
  name: string;
  description: string;
  scopes: ScopePerResourceRoleSeeder[]
}
type SeedingRelation = { role_id: string; scope_id: string; id?: string };

const createScope = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopeToSeed: SeedingScope;
}) =>
  createItem({
    transaction: params.transaction,
    tenantId: params.tenantId,
    toInsert: params.scopeToSeed,
    toLogFieldName: 'name',
    tableName: Scopes.table,
    whereClauses: [
      sql`name = ${params.scopeToSeed.name}`,
      sql`resource_id = ${params.scopeToSeed.resource_id}`
    ]
  });

const buildScopes = (
  resourceId: string,
  scopes: string[]
): ScopesByName => {
  return scopes.reduce<ScopesByName>((acc, scopeName) => {
    acc[scopeName] = {
      name: scopeName,
      description: scopeName,
      resource_id: resourceId
    };
    return acc;
  }, {});
};

export const createScopes = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopesToSeed: ResourcePermissionSeeder[];
}) => {
  if (params.scopesToSeed.length === 0) {
    return {};
  }

  const scopesToCreate: ScopesByResourceId = {};
  for (const singleSeeder of params.scopesToSeed) {
    scopesToCreate[singleSeeder.resource_id] = buildScopes(singleSeeder.resource_id, singleSeeder.specific_permissions);
  }

  const queries: Array<
    Promise<Omit<SeedingScope, 'id'> & { id: string }>
  > = [];
  

  Object.values(scopesToCreate).forEach((scopes) => {
    Object.values(scopes).forEach((scope) => {
      queries.push(
        createScope({
          scopeToSeed: scope,
          transaction: params.transaction,
          tenantId: params.tenantId,
        })
      );
    })
  });

  await Promise.all(queries);

  return scopesToCreate;
};

const createRole = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  roleToSeed: {
    name: string;
    description: string;
    id?: string;
  }
}) => {
  const created = await createItem({
    transaction: params.transaction,
    tenantId: params.tenantId,
    toLogFieldName: 'name',
    whereClauses: [sql`name = ${params.roleToSeed.name}`],
    toInsert: { name: params.roleToSeed.name, description: params.roleToSeed.description },
    tableName: Roles.table,
  });

  params.roleToSeed.id = created.id;

  return {
    ...params.roleToSeed,
    id: created.id,
  };
}

const createRoles = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopes: ScopesByResourceId,
  rolesToSeed: ResourceRoleSeeder[]
}) => {
  const rolesToCreate = params.rolesToSeed.map((role) =>({
    name: role.name,
    description: role.description,
    scopes: role.permissions
  }));

  const queries = rolesToCreate.map((role) => 
    createRole({
      transaction: params.transaction,
      tenantId: params.tenantId,
      roleToSeed: role
    })
  );

  await Promise.all(queries);

  return rolesToCreate;
}

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
  roles: SeededRole[];
  scopes: ScopesByResourceId;
}) => {
  const relationsToCrete: SeedingRelation[] = [];

  params.roles.forEach((role) => {
    role.scopes.forEach((scopeGroup) => {
      const relations = scopeGroup.specific_permissions.map((permission) => {
        // @ts-ignore @typescript-eslint/no-non-null-asserted-optional-chain
        if (params.scopes[scopeGroup.resource_id]?.[permission]?.id === undefined) {
          throw new Error("Requested permission does not exist.")
        }

        return {
          role_id: role.id!,
          // @ts-ignore @typescript-eslint/no-non-null-asserted-optional-chain
          scope_id: params.scopes[scopeGroup.resource_id]?.[permission]?.id!
        }
      });
      relationsToCrete.push(...relations);
    })
  });

  const queries = relationsToCrete.map((relation) =>
    createRoleScopeRelation(
      params.transaction,
      params.tenantId,
      relation
    )
  );

  await Promise.all(queries);

  return relationsToCrete;
}

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
      const seededResourceId = seededResources[permission.resource_id];
      if (!seededResourceId) {
        throw new Error(
          `Resource scopes. Referring to a not existent resource id: ${permission.resource_id}!`
        );
      }
      permission.resource_id = seededResourceId.id!;
    }
  }

  if (toSeed.resource_roles?.length) {
    for (const roles of toSeed.resource_roles) {
      for (const permissionGroup of roles.permissions) {
        const seededResourceId = seededResources[permissionGroup.resource_id];
        if (!seededResourceId) {
          throw new Error(
            `Resource roles. Referring to a not existent resource id: ${permissionGroup.resource_id}!`
          );
        }
        permissionGroup.resource_id = seededResourceId.id!;
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
}) => {
  params.toSeed = replaceWithResourceIdFromDatabase(params.seededResources, params.toSeed);
  if (params.toSeed.resource_permissions?.length && params.toSeed.resource_roles?.length) {
    const createdScopes = await createScopes({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopesToSeed: params.toSeed.resource_permissions
    });

    const createdRoles = await createRoles({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopes: createdScopes,
      rolesToSeed: params.toSeed.resource_roles,
    });

    await createRelations({
      transaction: params.transaction,
      tenantId: params.tenantId,
      roles: createdRoles,
      scopes: createdScopes
    });
  }
};
