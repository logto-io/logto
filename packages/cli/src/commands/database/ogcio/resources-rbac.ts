/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */
import { sql, type DatabaseTransactionConnection } from 'slonik';

import { createItem } from './queries.js';

const createResourceScope = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  scopeToSeed: SeedingScope
) =>
  createItem({
    transaction,
    tenantId,
    toInsert: scopeToSeed,
    toLogFieldName: 'name',
    itemTypeName: 'Resource Scope',
    whereClauses: [sql`name = ${scopeToSeed.name}`],
    tableName: 'scopes',
  });

type SeedingScope = {
  name: string;
  resource_id: string;
  id: string | undefined;
  description: string;
};

type ScopesLists = {
  scopesList: SeedingScope[];
  scopesByResource: Record<string, SeedingScope[]>;
  scopesByAction: Record<string, SeedingScope[]>;
};

const fillScopes = (resourceId: string) => {
  const resources = ['payments', 'payments-requests'];
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
        resource_id: resourceId,
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
    resource_id: resourceId,
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
  element = await createResourceScope(transaction, tenantId, element);
};

const createScopesPerResource = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  resourceId: string
): Promise<{
  scopesList: SeedingScope[];
  scopesByResource: Record<string, SeedingScope[]>;
  scopesByAction: Record<string, SeedingScope[]>;
}> => {
  const scopesToCreate = fillScopes(resourceId);
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
    name: 'Payments Employee',
    scopes: scopesLists.scopesByAction.read!,
    description: 'Only read permissions',
    id: undefined,
  };
  const manager: SeedingRole = {
    name: 'Payments Manager',
    scopes: scopesLists.scopesByAction.read!,
    description: 'Read write delete permissions',
    id: undefined,
  };
  // Don't ask me why, linter don't like spread operator, so I add to write multiple lines
  manager.scopes = manager.scopes.concat(scopesLists.scopesByAction.write!);
  manager.scopes = manager.scopes.concat(scopesLists.scopesByAction.delete!);
  const admin: SeedingRole = {
    name: 'Payments Admin',
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
    tableName: 'roles',
    tenantId,
    toLogFieldName: 'name',
    whereClauses: [sql`name = ${roleToSeed.name}`],
    toInsert: { name: roleToSeed.name, description: roleToSeed.description },
    itemTypeName: 'Resource Role',
  });

  roleToSeed.id = created.id;

  return roleToSeed;
};

type SeedingRelation = { role_id: string; scope_id: string; id?: string };

const createRoleScopeRelation = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  relation: SeedingRelation
) =>
  createItem({
    transaction,
    tableName: 'roles_scopes',
    tenantId,
    toLogFieldName: 'role_id',
    whereClauses: [sql`role_id = ${relation.role_id}`, sql`scope_id = ${relation.scope_id}`],
    toInsert: relation,
    itemTypeName: 'Scope-Role relation',
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
          role_id: role.id!,
          scope_id: scope.id!,
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

const seedRbacPerResource = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  resourceId: string
): Promise<{
  scopes: ScopesLists;
  roles: Record<string, SeedingRole>;
  relations: SeedingRelation[];
}> => {
  const createdScopes = await createScopesPerResource(transaction, tenantId, resourceId);
  const createdRoles = await createRoles(transaction, tenantId, createdScopes);
  const createdRelations = await createRelations(transaction, tenantId, createdRoles);

  return { scopes: createdScopes, roles: createdRoles, relations: createdRelations };
};

export const seedResourceRbacData = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  resources: Record<string, { id: string }>
): Promise<
  Record<
    string,
    { scopes: ScopesLists; roles: Record<string, SeedingRole>; relations: SeedingRelation[] }
  >
> => {
  const payments = await seedRbacPerResource(transaction, tenantId, resources.payments!.id);

  return { payments };
};
