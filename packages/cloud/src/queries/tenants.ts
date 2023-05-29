import assert from 'node:assert';

import {
  adminConsoleApplicationId,
  adminTenantId,
  getManagementApiResourceIndicator,
  PredefinedScope,
  type AdminData,
  type CreateTenant,
  type CreateRolesScope,
  type TenantInfo,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { PostgreSql } from '@withtyped/postgres';
import { jsonb, dangerousRaw, id, sql, jsonIfNeeded } from '@withtyped/postgres';
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

  const insertTenant = async (tenant: CreateTenant) =>
    client.query(
      insertInto(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        Object.fromEntries(Object.entries(tenant).filter(([_, value]) => value !== undefined)),
        'tenants'
      )
    );

  const createTenantRole = async (parentRole: string, role: string, password: string) =>
    client.query(sql`
      create role ${id(role)} with inherit login
        password '${dangerousRaw(password)}'
        in role ${id(parentRole)};
    `);

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

  const getTenantById = async (id: string): Promise<Pick<TenantInfo, 'name' | 'tag'>> => {
    return client.one<Pick<TenantInfo, 'name' | 'tag'>>(sql`
      select name, tag from tenants
      where id = ${id}
    `);
  };

  const getTenantsByIds = async (
    tenantIds: string[]
  ): Promise<Array<Pick<TenantInfo, 'id' | 'name' | 'tag'>>> => {
    const { rows } = await client.query<Pick<TenantInfo, 'id' | 'name' | 'tag'>>(sql`
      select id, name, tag from tenants
      where id in (${tenantIds.map((tenantId) => jsonIfNeeded(tenantId))})
      order by created_at desc, name desc;
    `);

    return rows;
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

  return {
    getManagementApiLikeIndicatorsForUser,
    insertTenant,
    createTenantRole,
    insertAdminData,
    getTenantById,
    getTenantsByIds,
    appendAdminConsoleRedirectUris,
  };
};
