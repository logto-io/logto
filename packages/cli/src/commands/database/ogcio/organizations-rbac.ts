/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */
import { OrganizationScopes, OrganizationRoles } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { createItem, createItemWithoutId } from './queries.js';

const createOrganizationScope = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  scopeToSeed: SeedingScope
) =>
  createItem({
    transaction,
    tenantId,
    toInsert: scopeToSeed,
    toLogFieldName: 'name',
    itemTypeName: 'Organization Scope',
    whereClauses: [sql`name = ${scopeToSeed.name}`],
    tableName: OrganizationScopes.table,
  });

type SeedingScope = {
  name: string;
  id: string | undefined;
  description: string;
};

type ScopesLists = {
  scopesList: SeedingScope[];
  scopesByResource: Record<string, SeedingScope[]>;
  scopesByAction: Record<string, SeedingScope[]>;
};

const fillScopes = () => {
  const resources = ['payments', 'messages', 'events'];
  const actions = ['read', 'write', 'create', 'delete'];
  const scopesList: SeedingScope[] = [];
  const scopesByResource: Record<string, SeedingScope[]> = {};
  const scopesByAction: Record<string, SeedingScope[]> = {};

  for (const resource of resources) {
    scopesByResource[resource] = [];
    for (const action of actions) {
      const scope: SeedingScope = {
        name: `${resource}:${action}`,
        description: `${action} ${resource}`,
        id: undefined,
      };
      scopesList.push(scope);
      if (scopesByResource[resource] === undefined) {
        scopesByResource[resource] = [scope];
      }
      scopesByResource[resource]!.push(scope);
      if (scopesByAction[action] === undefined) {
        scopesByAction[action] = [];
      }
      scopesByAction[action]!.push(scope);
    }
  }
  const superScope: SeedingScope = {
    name: 'ogcio:admin',
    description: 'OGCIO Admin',
    id: undefined,
  };

  scopesList.push(superScope);
  scopesByResource.ogcio = [superScope];
  scopesByAction.admin = [superScope];

  return {
    scopesList,
    scopesByResource,
    scopesByAction,
  };
};

const setScopeId = async (
  element: SeedingScope,
  transaction: DatabaseTransactionConnection,
  tenantId: string
) => {
  element = await createOrganizationScope(transaction, tenantId, element);
};

const createScopes = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string
): Promise<ScopesLists> => {
  const scopesToCreate = fillScopes();
  const queries: Array<Promise<void>> = [];
  for (const element of scopesToCreate.scopesList) {
    queries.push(setScopeId(element, transaction, tenantId));
  }

  await Promise.all(queries);

  return scopesToCreate;
};

type SeedingRole = {
  name: string;
  scopes: SeedingScope[];
  description: string;
  id: string | undefined;
};
const fillRoles = (scopesLists: ScopesLists) => {
  const employee: SeedingRole = {
    name: 'OGCIO Employee',
    scopes: scopesLists.scopesByAction.read!,
    description: 'Only read permissions',
    id: undefined,
  };
  const manager: SeedingRole = {
    name: 'OGCIO Manager',
    scopes: scopesLists.scopesByAction.read!,
    description: 'Read write delete permissions',
    id: undefined,
  };
  // Don't ask me why, linter don't like spread operator, so I add to write multiple lines
  manager.scopes = manager.scopes.concat(scopesLists.scopesByAction.write!);
  manager.scopes = manager.scopes.concat(scopesLists.scopesByAction.delete!);
  const admin: SeedingRole = {
    name: 'OGCIO Admin',
    scopes: scopesLists.scopesByAction.admin!,
    description: 'Read write delete and admin permissions',
    id: undefined,
  };
  admin.scopes = admin.scopes.concat(scopesLists.scopesByAction.write!);
  admin.scopes = admin.scopes.concat(scopesLists.scopesByAction.delete!);
  admin.scopes = admin.scopes.concat(scopesLists.scopesByAction.read!);

  return [admin, manager, employee];
};

const createRole = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  roleToSeed: SeedingRole
) => {
  const created = await createItem({
    transaction,
    tableName: OrganizationRoles.table,
    tenantId,
    toLogFieldName: 'name',
    whereClauses: [sql`name = ${roleToSeed.name}`],
    toInsert: { name: roleToSeed.name, description: roleToSeed.description },
    itemTypeName: 'Organization Role',
  });

  roleToSeed.id = created.id;

  return roleToSeed;
};

type SeedingRelation = { organization_role_id: string; organization_scope_id: string };

const createRoleScopeRelation = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  relation: SeedingRelation
) =>
  createItemWithoutId({
    transaction,
    tableName: 'organization_role_scope_relations',
    tenantId,
    toLogFieldName: 'organization_role_id',
    whereClauses: [
      sql`organization_role_id = ${relation.organization_role_id}`,
      sql`organization_scope_id = ${relation.organization_scope_id}`,
    ],
    toInsert: relation,
    itemTypeName: 'Organization Scope-Role relation',
    columnToGet: 'organization_role_id',
  });

const createRelations = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  roles: Record<string, SeedingRole>
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

const addRole = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  role: SeedingRole,
  toFill: Record<string, SeedingRole>
) => {
  toFill[role.name] = await createRole(transaction, tenantId, role);
};

const createRoles = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  scopesLists: ScopesLists
): Promise<Record<string, SeedingRole>> => {
  const rolesToCreate = fillRoles(scopesLists);
  const queries: Array<Promise<void>> = [];
  const outputList: Record<string, SeedingRole> = {};
  for (const role of rolesToCreate) {
    queries.push(addRole(transaction, tenantId, role, outputList));
  }

  await Promise.all(queries);

  return outputList;
};

export const seedOrganizationRbacData = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string
): Promise<{
  scopes: ScopesLists;
  roles: Record<string, SeedingRole>;
  relations: SeedingRelation[];
}> => {
  const createdScopes = await createScopes(transaction, tenantId);
  const createdRoles = await createRoles(transaction, tenantId, createdScopes);
  const relations = await createRelations(transaction, tenantId, createdRoles);

  return { scopes: createdScopes, roles: createdRoles, relations };
};
