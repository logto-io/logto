import { type CreateJob, Jobs } from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

type EnqueueJobData = Pick<CreateJob, 'id' | 'type' | 'groupKey' | 'dedupeKey' | 'payload'>;

const { table, fields } = convertToIdentifiers(Jobs);

/** Tenant-scoped `jobs` queries. Run on the tenant's restricted pool so row-level security applies. */
export const createJobQueries = (pool: CommonQueryMethods) => {
  const insertJob = buildInsertIntoWithPool(pool)(Jobs);

  /**
   * Insert a job that is due now. The database sets `tenant_id` from the tenant role. A
   * `dedupeKey` that matches an active row of the same type fails with a unique violation.
   */
  const enqueueJob = async (data: EnqueueJobData) => insertJob(data);

  /**
   * Count active jobs of the given `type` for the current tenant, bounded at `limit` via an
   * index-only scan on `jobs__type_group_key` (with the tenant predicate enforced by RLS).
   */
  const countJobsByType = async (type: string, limit: number): Promise<number> => {
    if (limit <= 0) {
      return 0;
    }

    return pool.oneFirst<number>(sql`
      select count(*)::int4
      from (
        select 1
        from ${table}
        where ${fields.type} = ${type}
        limit ${limit}
      ) as bounded
    `);
  };

  /**
   * Count active jobs for the given `(type, groupKey)` in the current tenant, bounded at `limit`
   * via an index-only scan on `jobs__type_group_key` (with the tenant predicate enforced by RLS).
   */
  const countJobsByGroup = async (
    type: string,
    groupKey: string,
    limit: number
  ): Promise<number> => {
    if (limit <= 0) {
      return 0;
    }

    return pool.oneFirst<number>(sql`
      select count(*)::int4
      from (
        select 1
        from ${table}
        where ${fields.type} = ${type}
          and ${fields.groupKey} = ${groupKey}
        limit ${limit}
      ) as bounded
    `);
  };

  return { enqueueJob, countJobsByType, countJobsByGroup };
};
