import type { Application, CreateApplication, CreateApplicationsRole } from '@logto/schemas';
import type { PostgreSql } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';

import { insertInto } from '#src/utils/query.js';

export type ApplicationsQuery = ReturnType<typeof createApplicationsQueries>;

export const createApplicationsQueries = (client: Queryable<PostgreSql>) => {
  const insertApplication = async (data: CreateApplication) =>
    client.query(insertInto(data, 'applications'));

  const assignRoleToApplication = async (data: CreateApplicationsRole) =>
    client.query(insertInto(data, 'applications_roles'));

  const findApplicationById = async (id: string, tenantId: string) => {
    // TODO implement "buildFindById" in withTyped
    const { rows } = await client.query<Application>(sql`
      select id, name, secret, description,
        custom_client_metadata as "customClientMetadata",
        created_at as "createdAt",
        oidc_client_metadata as "oidcClientMetadata"
      from applications
      where id=${id}
        and tenant_id=${tenantId}
    `);

    if (!rows[0]) {
      throw new Error(`Application ${id} not found.`);
    }

    return rows[0];
  };

  return { insertApplication, assignRoleToApplication, findApplicationById };
};
