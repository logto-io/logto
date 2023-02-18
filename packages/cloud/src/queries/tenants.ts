import { adminTenantId, getManagementApiResourceIndicator, PredefinedScope } from '@logto/schemas';
import type { PostgresQueryClient } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';

export const createTenantsQueries = (client: PostgresQueryClient) => {
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

  return { getManagementApiLikeIndicatorsForUser };
};
