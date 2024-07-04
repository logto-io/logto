/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { Roles, RolesScopes, Scopes } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import {
  type ResourceRoleSeeder,
  type ResourcePermissionSeeder,
  type ScopePerResourceRoleSeeder,
} from './ogcio-seeder.js';
import { createOrUpdateItem, deleteQuery } from './queries.js';
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
  id: string;
  name: string;
  description: string;
  scopes: ScopePerResourceRoleSeeder[];
};
type SeedingRelation = { role_id: string; scope_id: string; id?: string };

const createScope = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopeToSeed: SeedingScope;
}) =>
  createOrUpdateItem({
    transaction: params.transaction,
    tenantId: params.tenantId,
    toInsert: params.scopeToSeed,
    toLogFieldName: 'name',
    tableName: Scopes.table,
    whereClauses: [
      sql`tenant_id = ${params.tenantId}`,
      sql`name = ${params.scopeToSeed.name}`,
      sql`resource_id = ${params.scopeToSeed.resource_id}`,
    ],
  });

const buildScopes = (resourceId: string, scopes: string[]): ScopesByName => {
  return scopes.reduce<ScopesByName>((accumulator, scopeName) => {
    accumulator[scopeName] = {
      name: scopeName,
      description: scopeName,
      resource_id: resourceId,
    };
    return accumulator;
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
    scopesToCreate[singleSeeder.resource_id] = buildScopes(
      singleSeeder.resource_id,
      singleSeeder.specific_permissions
    );
  }

  const queries: Array<Promise<Omit<SeedingScope, 'id'> & { id: string }>> = [];

  for (const scopes of Object.values(scopesToCreate)) {
    for (const scope of Object.values(scopes)) {
      queries.push(
        createScope({
          scopeToSeed: scope,
          transaction: params.transaction,
          tenantId: params.tenantId,
        })
      );
    }
  }

  await Promise.all(queries);

  return scopesToCreate;
};

const createRole = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  roleToSeed: {
    name: string;
    description: string;
    id: string;
  };
}) => {
  await createOrUpdateItem({
    transaction: params.transaction,
    tenantId: params.tenantId,
    toLogFieldName: 'name',
    whereClauses: [sql`tenant_id = ${params.tenantId}`, sql`id = ${params.roleToSeed.id}`],
    toInsert: {
      id: params.roleToSeed.id,
      name: params.roleToSeed.name,
      description: params.roleToSeed.description,
    },
    tableName: Roles.table,
  });

  return params.roleToSeed;
};

const createRoles = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopes: ScopesByResourceId;
  rolesToSeed: ResourceRoleSeeder[];
}) => {
  const rolesToCreate = params.rolesToSeed.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    scopes: role.permissions,
  }));

  const queries = rolesToCreate.map(async (role) =>
    createRole({
      transaction: params.transaction,
      tenantId: params.tenantId,
      roleToSeed: role,
    })
  );

  await Promise.all(queries);

  return rolesToCreate;
};

const createRoleScopeRelation = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  relation: SeedingRelation
) =>
  createOrUpdateItem({
    transaction,
    tableName: RolesScopes.table,
    tenantId,
    toLogFieldName: 'role_id',
    whereClauses: [
      sql`tenant_id = ${tenantId}`,
      sql`role_id = ${relation.role_id}`,
      sql`scope_id = ${relation.scope_id}`,
    ],
    toInsert: relation,
  });

const createRelations = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  roles: SeededRole[];
  scopes: ScopesByResourceId;
}) => {
  const relationsToCrete: SeedingRelation[] = [];

  for (const role of params.roles) {
    for (const scopeGroup of role.scopes) {
      const relations = scopeGroup.specific_permissions.map((permission) => {
        if (params.scopes[scopeGroup.resource_id]?.[permission]?.id === undefined) {
          throw new Error('Requested permission does not exist.');
        }

        return {
          role_id: role.id,
          scope_id: params.scopes[scopeGroup.resource_id]?.[permission]?.id!,
        };
      });
      relationsToCrete.push(...relations);
    }
  }

  const queries = relationsToCrete.map(async (relation) =>
    createRoleScopeRelation(params.transaction, params.tenantId, relation)
  );

  await Promise.all(queries);

  return relationsToCrete;
};

export const cleanScopes = async (transaction: DatabaseTransactionConnection, tenantId: string) => {
  await cleanScopeRelations(transaction, tenantId);
  const deleteQueryString = deleteQuery([sql`tenant_id = ${tenantId}`], Scopes.table);
  return transaction.query(deleteQueryString);
};

export const cleanScopeRelations = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string
) => {
  const deleteQueryString = deleteQuery([sql`tenant_id = ${tenantId}`], RolesScopes.table);
  return transaction.query(deleteQueryString);
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
  if (params.toSeed.resource_permissions?.length && params.toSeed.resource_roles?.length) {
    await cleanScopes(params.transaction, params.tenantId);

    const createdScopes = await createScopes({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopesToSeed: params.toSeed.resource_permissions,
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
      scopes: createdScopes,
    });
  }
};
