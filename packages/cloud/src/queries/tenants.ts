import assert from 'node:assert';

import {
  adminConsoleApplicationId,
  adminTenantId,
  getManagementApiResourceIndicator,
  getManagementApiAdminName,
  PredefinedScope,
  ApplicationType,
  type AdminData,
  type CreateRolesScope,
} from '@logto/schemas';
import type { TenantModel } from '@logto/schemas/models';
import { generateStandardId } from '@logto/shared';
import {
  type PostgreSql,
  jsonb,
  dangerousRaw,
  id,
  sql,
  jsonIfNeeded,
  jsonbIfNeeded,
} from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';

import { insertInto } from '#src/utils/query.js';

export type TenantsQueries = ReturnType<typeof createTenantsQueries>;

export const createTenantsQueries = (client: Queryable<PostgreSql>) => {
  const getManagementApiLikeIndicatorsForUser = async (userId: string) =>
    client.query<{ indicator: string }>(sql`
      select resources.indicator from roles
        join users_roles
          on users_roles.role_id = roles.id
          and users_roles.user_id = ${userId}
        join roles_scopes 
          on roles.id = roles_scopes.role_id
        join scopes
          on roles_scopes.scope_id = scopes.id
          and scopes.name = ${PredefinedScope.All}
        join resources
          on scopes.resource_id = resources.id
          and resources.indicator like ${getManagementApiResourceIndicator('%')}
        where roles.tenant_id = ${adminTenantId};
    `);

  const insertTenant = async (
    tenant: Pick<TenantModel, 'id' | 'dbUser' | 'dbUserPassword'> &
      Partial<Pick<TenantModel, 'name' | 'tag'>>
  ) => client.query(insertInto(tenant, 'tenants'));

  const updateTenantById = async (
    tenantId: string,
    payload: Partial<Pick<TenantModel, 'name' | 'tag'>>
  ) => {
    const tenant = await client.maybeOne<TenantModel>(sql`
      update tenants
      set ${Object.entries(payload).map(([key, value]) => sql`${id(key)}=${jsonIfNeeded(value)}`)}
      where id = ${tenantId}
      returning *;
    `);

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found.`);
    }

    return tenant;
  };

  const createTenantRole = async (parentRole: string, role: string, password: string) =>
    client.query(sql`
      create role ${id(role)} with inherit login
        password '${dangerousRaw(password)}'
        in role ${id(parentRole)};
    `);

  const deleteDatabaseRoleForTenant = async (role: string) =>
    client.query(sql`drop role ${id(role)};`);

  const insertAdminData = async (data: AdminData) => {
    const { resource, scopes, role } = data;

    assert(
      resource.tenantId && scopes.every(({ tenantId }) => tenantId) && role.tenantId,
      new Error('Tenant ID cannot be empty.')
    );

    assert(
      scopes.every(
        (scope) => resource.tenantId === scope.tenantId && scope.tenantId === role.tenantId
      ),
      new Error('All data should have the same tenant ID.')
    );

    await client.query(insertInto(resource, 'resources'));
    await Promise.all(scopes.map(async (scope) => client.query(insertInto(scope, 'scopes'))));
    await client.query(insertInto(role, 'roles'));

    const { tenantId } = resource;
    await Promise.all(
      scopes.map(async ({ id }) =>
        client.query(
          insertInto(
            {
              id: generateStandardId(),
              roleId: role.id,
              scopeId: id,
              tenantId,
            } satisfies CreateRolesScope,
            'roles_scopes'
          )
        )
      )
    );
  };

  const getTenantById = async (
    id: string
  ): Promise<Pick<TenantModel, 'dbUser' | 'name' | 'tag'>> => {
    return client.one<Pick<TenantModel, 'dbUser' | 'name' | 'tag'>>(sql`
      select db_user as "dbUser", name, tag from tenants
      where id = ${id}
    `);
  };

  const getTenantsByIds = async (
    tenantIds: string[]
  ): Promise<Array<Pick<TenantModel, 'id' | 'name' | 'tag'>>> => {
    const { rows } = await client.query<Pick<TenantModel, 'id' | 'name' | 'tag'>>(sql`
      select id, name, tag from tenants
      where id in (${tenantIds.map((tenantId) => jsonIfNeeded(tenantId))})
      order by created_at desc, name desc;
    `);

    return rows;
  };

  const deleteClientTenantManagementApplicationById = async (tenantId: string) => {
    await client.query(sql`
      delete from applications where custom_client_metadata->>'tenantId' = ${tenantId} and tenant_id = ${adminTenantId} and "type" = ${ApplicationType.MachineToMachine}
    `);
  };

  const deleteClientTenantManagementApiResourceByTenantId = async (tenantId: string) => {
    await client.query(sql`
      delete from resources
      where tenant_id = ${adminTenantId} and indicator = ${getManagementApiResourceIndicator(
      tenantId
    )}
    `);
  };

  const deleteClientTenantRoleById = async (tenantId: string) => {
    await client.query(sql`
      delete from roles
      where tenant_id = ${adminTenantId} and name = ${getManagementApiAdminName(tenantId)}
    `);
  };

  const deleteTenantById = async (id: string) => {
    await client.query(sql`
      delete from tenants
      where id = ${id}
    `);
  };

  const appendAdminConsoleRedirectUris = async (...urls: URL[]) => {
    const metadataKey = id('oidc_client_metadata');

    await client.query(sql`
      update applications
      set ${metadataKey} = jsonb_set(
        ${metadataKey},
        '{redirectUris}',
        (select jsonb_agg(distinct value) from jsonb_array_elements(
          ${metadataKey}->'redirectUris' || ${jsonb(urls.map(String))}
        ))
      )
      where id = ${adminConsoleApplicationId}
      and tenant_id = ${adminTenantId}
    `);
  };

  const removeUrisFromAdminConsoleRedirectUris = async (...urls: URL[]) => {
    const metadataKey = id('oidc_client_metadata');

    const { redirectUris } = await client.one<{ redirectUris: string[] }>(
      sql`select ${metadataKey}->'redirectUris' as "redirectUris" from applications where id = ${adminConsoleApplicationId} and tenant_id = ${adminTenantId}`
    );
    const restRedirectUris = redirectUris.filter(
      (redirectUri) => !urls.map(String).includes(redirectUri)
    );

    await client.query(sql`
      update applications
          set ${metadataKey} = jsonb_set(${metadataKey}, '{redirectUris}', ${jsonbIfNeeded(
      restRedirectUris
    )})
          where id = ${adminConsoleApplicationId} and tenant_id = ${adminTenantId};
    `);
  };

  return {
    getManagementApiLikeIndicatorsForUser,
    insertTenant,
    updateTenantById,
    createTenantRole,
    deleteDatabaseRoleForTenant,
    insertAdminData,
    getTenantById,
    getTenantsByIds,
    deleteClientTenantManagementApplicationById,
    deleteClientTenantManagementApiResourceByTenantId,
    deleteClientTenantRoleById,
    deleteTenantById,
    appendAdminConsoleRedirectUris,
    removeUrisFromAdminConsoleRedirectUris,
  };
};
