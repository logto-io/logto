import assert from 'node:assert';

import { generateStandardId } from '@logto/core-kit';
import type { AdminData, TenantModel } from '@logto/schemas';
import {
  adminTenantId,
  getManagementApiResourceIndicator,
  PredefinedScope,
  CreateRolesScope,
} from '@logto/schemas';
import type { PostgreSql } from '@withtyped/postgres';
import { dangerousRaw, id, sql } from '@withtyped/postgres';
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

  const insertTenant = async (tenant: TenantModel) => client.query(insertInto(tenant, 'tenants'));

  const createTenantRole = async (parentRole: string, role: string, password: string) =>
    client.query(sql`
      create role ${id(role)} with inherit login
        password '${dangerousRaw(password)}'
        in role ${id(parentRole)};
    `);

  const insertAdminData = async (data: AdminData) => {
    const { resource, scope, role } = data;

    assert(
      resource.tenantId && scope.tenantId && role.tenantId,
      new Error('Tenant ID cannot be empty.')
    );

    assert(
      resource.tenantId === scope.tenantId && scope.tenantId === role.tenantId,
      new Error('All data should have the same tenant ID.')
    );

    await client.query(insertInto(resource, 'resources'));
    await client.query(insertInto(scope, 'scopes'));
    await client.query(insertInto(role, 'roles'));
    await client.query(
      insertInto(
        {
          id: generateStandardId(),
          roleId: role.id,
          scopeId: scope.id,
          tenantId: resource.tenantId,
        } satisfies CreateRolesScope,
        'roles_scopes'
      )
    );
  };

  return { getManagementApiLikeIndicatorsForUser, insertTenant, createTenantRole, insertAdminData };
};
