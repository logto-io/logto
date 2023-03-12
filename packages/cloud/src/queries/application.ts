import type { CreateApplication, CreateApplicationsRole } from '@logto/schemas';
import type { PostgreSql } from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';

import { insertInto } from '#src/utils/query.js';

export type ApplicationsQuery = ReturnType<typeof createApplicationsQueries>;

export const createApplicationsQueries = (client: Queryable<PostgreSql>) => {
  const insertApplication = async (data: CreateApplication) =>
    client.query(insertInto(data, 'applications'));

  const assignRoleToApplication = async (data: CreateApplicationsRole) =>
    client.query(insertInto(data, 'applications_roles'));

  return { insertApplication, assignRoleToApplication };
};
