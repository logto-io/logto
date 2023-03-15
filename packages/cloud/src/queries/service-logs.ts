import type { CreateServiceLog, ServiceLogType } from '@logto/schemas';
import type { PostgreSql } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';

import { insertInto } from '#src/utils/query.js';

export type ServiceLogsQueries = ReturnType<typeof createServiceLogsQueries>;

export const createServiceLogsQueries = (client: Queryable<PostgreSql>) => {
  const insertLog = async (data: Omit<CreateServiceLog, 'payload'>) =>
    client.query(insertInto(data, 'service_logs'));

  const countTenantLogs = async (tenantId: string, type: ServiceLogType) => {
    const { rows } = await client.query<{ count: number }>(sql`
      select count(id) as count
      from service_logs
      where tenant_id = ${tenantId}
        and type = ${type}
    `);

    return rows[0]?.count ?? 0;
  };

  return {
    insertLog,
    countTenantLogs,
  };
};
