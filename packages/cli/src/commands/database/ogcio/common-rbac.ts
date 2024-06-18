/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @silverhand/fp/no-let */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-lines */
/* eslint-disable max-params */
import { OrganizationRoles, OrganizationScopes, Roles, Scopes } from '@logto/schemas';
import { sql, type ValueExpression, type DatabaseTransactionConnection } from '@silverhand/slonik';

import {
  type ResourcePermissionSeeder,
  type OrganizationPermissionSeeder,
  type OrganizationRoleSeeder,
  type ResourceRoleSeeder,
} from './ogcio-seeder.js';
import { createItem } from './queries.js';

type SeedingScope = {
  name: string;
  id?: string;
  description: string;
};

export type ResourceSeedingScope = SeedingScope & {
  resource_id: string;
};

export type OrganizationSeedingScope = SeedingScope;

type SeedingRole<T extends ResourceSeedingScope | OrganizationSeedingScope> = {
  name: string;
  description: string;
  id?: string;
  scopes: T[];
};

export type OrganizationSeedingRole = SeedingRole<OrganizationSeedingScope>;

export type ResourceSeedingRole = SeedingRole<ResourceSeedingScope>;

export type ScopesLists<T extends ResourceSeedingScope | OrganizationSeedingScope> = {
  scopesList: T[];
  scopesByEntity: Record<string, T[]>;
  scopesByAction: Record<string, T[]>;
  scopesByFullName: Record<string, T>;
};

export type OrganizationScopesLists = ScopesLists<OrganizationSeedingScope>;

export type ResourceScopesLists = Record<string, ScopesLists<ResourceSeedingScope>>;

export const buildScopeFullName = (entity: string, action: string, subject?: string): string =>
  [entity, action, subject].filter(Boolean).join(':');

export const ensureRoleHasAtLeastOneScope = <T>(roleName: string, scopes: T[]): void => {
  if (scopes.length === 0) {
    throw new Error(`${roleName}. You must assign at least one scope`);
  }
};

export const buildCrossScopes = <T extends ResourceSeedingScope | OrganizationSeedingScope>(
  actions: string[],
  entities: string[],
  specificPermissions: string[],
  scopesLists: ScopesLists<T>
): T[] => {
  if (actions.length === 0 && entities.length === 0) {
    return [];
  }
  const scopesByAction = actions.length > 0 ? actions : Object.keys(scopesLists.scopesByAction);
  const scopesByEntity = entities.length > 0 ? entities : Object.keys(scopesLists.scopesByEntity);
  const byFullname: T[] = [];
  for (const action of scopesByAction) {
    for (const entity of scopesByEntity) {
      const fullName = buildScopeFullName(entity, action);
      if (
        scopesLists.scopesByFullName[fullName] !== undefined &&
        !specificPermissions.includes(fullName)
      ) {
        byFullname.push(scopesLists.scopesByFullName[fullName]!);
      }
    }
  }

  return byFullname;
};

export const getScopesBySpecificPermissions = <
  T extends ResourceSeedingScope | OrganizationSeedingScope,
>(
  specificPerms: string[] | undefined,
  scopesLists: ScopesLists<T>
): T[] => {
  if (!specificPerms || specificPerms.length === 0) {
    return [];
  }
  const outputPerms: T[] = [];
  for (const scopeName of specificPerms) {
    if (!scopesLists.scopesByFullName[scopeName]) {
      throw new Error(`Specific permissions. The requested ${scopeName} scope does not exist!`);
    }
    outputPerms.push(scopesLists.scopesByFullName[scopeName]!);
  }

  return outputPerms;
};

const addScopeToLists = (
  lists: ScopesLists<OrganizationSeedingScope | ResourceSeedingScope>,
  resource: string,
  action: string,
  resourceId?: string,
  subject?: string
) => {
  const { scopesByEntity, scopesList, scopesByAction, scopesByFullName } = lists;

  const scope: { name: string; description: string; resource_id?: string } = {
    name: buildScopeFullName(resource, action, subject),
    description: `${action} ${resource} ${subject}`,
  };
  if (resourceId) {
    scope.resource_id = resourceId;
  }
  scopesList.push(scope);
  if (scopesByEntity[resource] === undefined) {
    scopesByEntity[resource] = [];
  }
  scopesByEntity[resource]!.push(scope);
  if (scopesByAction[action] === undefined) {
    scopesByAction[action] = [];
  }
  scopesByAction[action]!.push(scope);

  scopesByFullName[scope.name] = scope;
};

export const fillScopesGroup = <
  T extends OrganizationPermissionSeeder | ResourcePermissionSeeder,
  U extends ScopesLists<OrganizationSeedingScope | ResourceSeedingScope>,
>(
  seeder: T,
  fullLists: U,
  resourceId?: string
) => {
  for (const permission of seeder.specific_permissions ?? []) {
    const [resource, action, subject] = permission.split(':');
    if (!resource || !action) {
      continue;
    }

    addScopeToLists(fullLists, resource, action, resourceId, subject);
  }

  for (const resource of seeder.entities ?? []) {
    for (const action of seeder.actions ?? []) {
      addScopeToLists(fullLists, resource, action, resourceId);
    }
  }

  return fullLists;
};

const isResourceScope = (
  scopeToSeed: ResourceSeedingScope | OrganizationSeedingScope
): scopeToSeed is ResourceSeedingScope => 'resource_id' in scopeToSeed;

const getScopeConfigByType = <T extends ResourceSeedingScope | OrganizationSeedingScope>(
  scopeToSeed: T
): { tableName: string; whereClauses: ValueExpression[] } => {
  if (isResourceScope(scopeToSeed)) {
    return {
      tableName: Scopes.table,
      whereClauses: [
        sql`name = ${scopeToSeed.name}`,
        sql`resource_id = ${scopeToSeed.resource_id}`,
      ],
    };
  }

  return {
    tableName: OrganizationScopes.table,
    whereClauses: [sql`name = ${scopeToSeed.name}`],
  };
};

const createScope = async <T extends ResourceSeedingScope | OrganizationSeedingScope>(params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopeToSeed: T;
}) =>
  createItem({
    transaction: params.transaction,
    tenantId: params.tenantId,
    toInsert: params.scopeToSeed,
    toLogFieldName: 'name',
    ...getScopeConfigByType(params.scopeToSeed),
  });

const isResourceRole = (
  roleToSeed: ResourceSeedingRole | OrganizationSeedingRole
): roleToSeed is ResourceSeedingRole => {
  if (roleToSeed.scopes.length === 0) {
    throw new Error('You must assign at least one scope to a role!');
  }

  return isResourceScope(roleToSeed.scopes[0]!);
};

const isResourceScopeLists = (
  input: OrganizationScopesLists | ResourceScopesLists
): input is ResourceScopesLists => {
  if (typeof input !== 'object') {
    return false;
  }
  const resourceKeys = Object.keys(input);
  if (resourceKeys.length === 0) {
    throw new Error('You must create scopes for at least one resource');
  }

  return true;
};

const getListOfScopesToSeed = (
  input: OrganizationScopesLists | ResourceScopesLists
): SeedingScope[] => {
  if ('scopesList' in input && Array.isArray(input.scopesList)) {
    return input.scopesList;
  }
  if (isResourceScopeLists(input)) {
    const resourceScopesList: ResourceScopesLists = input;
    let outputScopes: SeedingScope[] = [];

    for (const scopesGroup of Object.values(resourceScopesList)) {
      outputScopes = [...outputScopes, ...scopesGroup.scopesList];
    }

    return outputScopes;
  }
  throw new Error('List of scopes is not valid');
};

export const getScopesPerRole = <U extends OrganizationSeedingScope | ResourceSeedingScope>(
  roleToSeed: {
    name: string;
    specific_permissions?: string[];
    actions?: string[];
    entities?: string[];
  },
  scopesLists: ScopesLists<U>
): U[] => {
  const inputSpecific = roleToSeed.specific_permissions ?? [];
  const specificScopes = getScopesBySpecificPermissions(inputSpecific, scopesLists);
  const byAction = roleToSeed.actions ?? [];
  const byEntity = roleToSeed.entities ?? [];
  ensureRoleHasAtLeastOneScope(roleToSeed.name, [...specificScopes, ...byAction, ...byEntity]);

  const fullList = [
    ...buildCrossScopes(byAction, byEntity, inputSpecific, scopesLists),
    ...specificScopes,
  ];

  ensureRoleHasAtLeastOneScope(roleToSeed.name, fullList);

  return fullList;
};

export const createScopes = async <
  T extends OrganizationPermissionSeeder | ResourcePermissionSeeder,
  O extends OrganizationScopesLists | ResourceScopesLists,
>(params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopesToSeed: T[];
  fillScopesMethod: (scopesToSeed: T[]) => O;
}): Promise<O> => {
  const scopesToCreate = params.fillScopesMethod(params.scopesToSeed);
  const queries: Array<
    Promise<Omit<OrganizationSeedingScope | ResourceSeedingScope, 'id'> & { id: string }>
  > = [];
  for (const element of getListOfScopesToSeed(scopesToCreate)) {
    queries.push(
      createScope({
        scopeToSeed: element,
        transaction: params.transaction,
        tenantId: params.tenantId,
      })
    );
  }

  await Promise.all(queries);

  return scopesToCreate;
};

const getRoleConfigByType = <T extends ResourceSeedingRole | OrganizationSeedingRole>(
  roleToSeed: T
): { tableName: string } => {
  if (isResourceRole(roleToSeed)) {
    return {
      tableName: Roles.table,
    };
  }

  return {
    tableName: OrganizationRoles.table,
  };
};

const createRole = async <T extends OrganizationSeedingRole | ResourceSeedingRole>(params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  roleToSeed: T;
}) => {
  const created = await createItem({
    transaction: params.transaction,
    tenantId: params.tenantId,
    toLogFieldName: 'name',
    whereClauses: [sql`name = ${params.roleToSeed.name}`],
    toInsert: { name: params.roleToSeed.name, description: params.roleToSeed.description },
    ...getRoleConfigByType(params.roleToSeed),
  });

  params.roleToSeed.id = created.id;

  return {
    ...params.roleToSeed,
    id: created.id,
  };
};

export const addRole = async <T extends OrganizationSeedingRole | ResourceSeedingRole>(params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  role: T;
  toFill: Record<string, T>;
}) => {
  params.toFill[params.role.name] = await createRole({
    transaction: params.transaction,
    tenantId: params.tenantId,
    roleToSeed: params.role,
  });
};

export const createRoles = async <
  R extends OrganizationRoleSeeder | ResourceRoleSeeder,
  T extends OrganizationScopesLists | ResourceScopesLists,
  O extends OrganizationSeedingRole | ResourceSeedingRole,
>(params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  scopesLists: T;
  rolesToSeed: R[];
  fillRolesMethod: (rolesToSeed: R[], seededScopes: T) => O[];
}): Promise<Record<string, O>> => {
  const rolesToCreate = params.fillRolesMethod(params.rolesToSeed, params.scopesLists);
  const queries: Array<Promise<void>> = [];
  const outputList: Record<string, O> = {};
  for (const role of rolesToCreate) {
    queries.push(
      addRole({
        transaction: params.transaction,
        tenantId: params.tenantId,
        role,
        toFill: outputList,
      })
    );
  }

  await Promise.all(queries);

  return outputList;
};
