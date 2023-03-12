import type { PostgreSql } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';

export type RolesQuery = ReturnType<typeof createRolesQuery>;

export const createRolesQuery = (client: Queryable<PostgreSql>) => {
  const findRoleIdByName = async (roleName: string, tenantId: string) => {
    const { rows } = await client.query<{ id: string }>(sql`
      select id from roles
      where name=${roleName}
      and tenant_id=${tenantId}
    `);

    if (!rows[0]) {
      throw new Error(`Role ${roleName} not found.`);
    }

    return rows[0].id;
  };

  return { findRoleIdByName };
};
