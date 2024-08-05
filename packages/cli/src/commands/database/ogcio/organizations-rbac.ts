/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import {
  OrganizationApplicationRelations,
  OrganizationRoleApplicationRelations,
  OrganizationRoles,
  OrganizationRoleScopeRelations,
  OrganizationScopes,
} from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { type OrganizationPermissionSeeder, type OrganizationRoleSeeder } from './ogcio-seeder.js';
import { createOrUpdateItem, createOrUpdateItemWithoutId, deleteQuery } from './queries.js';

type SeedingScope = {
  name: string;
  id?: string;
  description: string;
};
type ScopesByName = Record<string, SeedingScope>;

type SeedingRole = {
  name: string;
  id: string;
  description: string;
  scopes: string[];
};

type SeedingRelation = { organization_role_id: string; organization_scope_id: string };

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
    tableName: OrganizationScopes.table,
    whereClauses: [sql`tenant_id = ${params.tenantId}`, sql`name = ${params.scopeToSeed.name}`],
  });

const buildScopes = (scopes: string[]): ScopesByName => {
  return scopes.reduce<ScopesByName>((accumulator, scopeName) => {
    accumulator[scopeName] = {
      name: scopeName,
      description: scopeName,
    };
    return accumulator;
  }, {});
};

export const createScopes = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopesToSeed: OrganizationPermissionSeeder;
}) => {
  const scopesToCreate = buildScopes(params.scopesToSeed.specific_permissions);

  const queries = Object.values(scopesToCreate).map(async (scope) =>
    createScope({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopeToSeed: scope,
    })
  );

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
    type: string;
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
      type: params.roleToSeed.type,
    },
    tableName: OrganizationRoles.table,
  });

  return params.roleToSeed;
};

const createRoles = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopes: ScopesByName;
  rolesToSeed: OrganizationRoleSeeder[];
}) => {
  const rolesToCreate = params.rolesToSeed.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    scopes: role.specific_permissions,
    type: role.type ?? 'User',
    related_applications: role.related_applications ?? [],
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
  createOrUpdateItemWithoutId({
    transaction,
    tableName: OrganizationRoleScopeRelations.table,
    tenantId,
    toLogFieldName: 'organization_role_id',
    whereClauses: [
      sql`tenant_id = ${tenantId}`,
      sql`organization_role_id = ${relation.organization_role_id}`,
      sql`organization_scope_id = ${relation.organization_scope_id}`,
    ],
    toInsert: relation,
    columnToGet: 'organization_role_id',
  });

const createRelations = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  scopes: ScopesByName,
  roles: SeedingRole[]
) => {
  const queries = roles.flatMap((role) =>
    role.scopes.map(async (scope) =>
      createRoleScopeRelation(transaction, tenantId, {
        organization_role_id: role.id,
        organization_scope_id: scopes[scope]?.id!,
      })
    )
  );

  return Promise.all(queries);
};

export const cleanScopes = async (transaction: DatabaseTransactionConnection, tenantId: string) => {
  await cleanScopeRelations(transaction, tenantId);
  const deleteQueryString = deleteQuery([sql`tenant_id = ${tenantId}`], OrganizationScopes.table);
  return transaction.query(deleteQueryString);
};

export const cleanScopeRelations = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string
) => {
  const deleteQueryString = deleteQuery(
    [sql`tenant_id = ${tenantId}`],
    OrganizationRoleScopeRelations.table
  );
  return transaction.query(deleteQueryString);
};

export const seedOrganizationRbacData = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  toSeed: {
    organization_permissions?: OrganizationPermissionSeeder;
    organization_roles?: OrganizationRoleSeeder[];
  };
}) => {
  if (params.toSeed.organization_permissions && params.toSeed.organization_roles?.length) {
    await cleanScopes(params.transaction, params.tenantId);

    const createdScopes = await createScopes({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopesToSeed: params.toSeed.organization_permissions,
    });

    const createdRoles = await createRoles({
      transaction: params.transaction,
      tenantId: params.tenantId,
      scopes: createdScopes,
      rolesToSeed: params.toSeed.organization_roles,
    });

    await createRelations(params.transaction, params.tenantId, createdScopes, createdRoles);

    await assignOrganizationsToM2MApplications(params.transaction, params.tenantId, createdRoles);
  }
};

const assignOrganizationsToM2MApplications = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  roles: Array<{
    id: string;
    related_applications: Array<{ application_id: string; organization_id: string }>;
    type: string;
  }>
) => {
  const addedRoles: Array<
    Promise<{ organization_role_id: string; application_id: string; organization_id: string }>
  > = [];
  for (const role of roles) {
    if (role.type === 'MachineToMachine' && role.related_applications.length > 0) {
      addedRoles.push(
        ...role.related_applications.map(
          async (relation: { application_id: string; organization_id: string }) =>
            assignOrganizationToM2MApplication(transaction, tenantId, {
              organization_role_id: role.id,
              application_id: relation.application_id,
              organization_id: relation.organization_id,
            })
        )
      );
    }
  }

  await Promise.all(addedRoles);
};

const assignOrganizationToM2MApplication = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  relation: {
    organization_role_id: string;
    application_id: string;
    organization_id: string;
  }
) => {
  await createOrUpdateItemWithoutId({
    transaction,
    tableName: OrganizationApplicationRelations.table,
    tenantId,
    toLogFieldName: 'organization_id',
    whereClauses: [
      sql`tenant_id = ${tenantId}`,
      sql`application_id = ${relation.application_id}`,
      sql`organization_id = ${relation.organization_id}`,
    ],
    toInsert: {
      organization_id: relation.organization_id,
      application_id: relation.application_id,
    },
    columnToGet: 'organization_id',
  });

  return createOrUpdateItemWithoutId({
    transaction,
    tableName: OrganizationRoleApplicationRelations.table,
    tenantId,
    toLogFieldName: 'organization_role_id',
    whereClauses: [
      sql`tenant_id = ${tenantId}`,
      sql`organization_role_id = ${relation.organization_role_id}`,
      sql`application_id = ${relation.application_id}`,
      sql`organization_id = ${relation.organization_id}`,
    ],
    toInsert: relation,
    columnToGet: 'organization_role_id',
  });
};
