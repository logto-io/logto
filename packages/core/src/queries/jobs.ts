import { type CreateJob, Jobs } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

type EnqueueJobData = Pick<CreateJob, 'id' | 'type' | 'groupKey' | 'dedupeKey' | 'payload'>;

/** Tenant-scoped `jobs` queries. Run on the tenant's restricted pool so row-level security applies. */
export const createJobQueries = (pool: CommonQueryMethods) => {
  const insertJob = buildInsertIntoWithPool(pool)(Jobs);

  /**
   * Insert a job that is due now. The database sets `tenant_id` from the tenant role. A
   * `dedupeKey` that matches an active row of the same type fails with a unique violation.
   */
  const enqueueJob = async (data: EnqueueJobData) => insertJob(data);

  return { enqueueJob };
};
