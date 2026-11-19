import {
  type ClaimDueInput,
  type ClaimedJobRow,
  type JobQueueQueries,
  type ReleaseClaimedInput,
  type SettleJobInput,
  type SettleOutcome,
} from '@logto/job-queue';
import { type Job } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

export type JobQueueGauges = {
  /** Rows in `jobs`, waiting or claimed. */
  depth: number;
  /**
   * How long in milliseconds the longest-waiting due row has been due, counting expired leases
   * and not rows still under a lease or backoff. `0` when no row is due.
   */
  oldestWaitingAgeMs: number;
  /** Claimed rows whose lease ran out before their worker settled them. */
  expiredLeases: number;
};

/**
 * How many of the oldest due rows a claim considers per free slot. Fairness caps apply only
 * within this window, so a group's backlog older than the window can hold back newer groups
 * until the group saturates, which takes it out of the window on the next claim.
 */
const claimWindowRowsPerSlot = 20;

const toTimestamp = (epochMs: number) => sql`to_timestamp(${epochMs}::double precision / 1000)`;

/** Only the claimed attempt of a row held by this worker may be settled or released. */
const fenceClaimedJob = (job: ClaimedJobRow, workerId: string) => sql`
  id = ${job.id}
  and tenant_id = ${job.tenantId ?? null}
  and claimed_by = ${workerId}
  and attempts = ${job.attempts}
`;

/**
 * Queue operations on the `jobs` table across all tenants. Run on `EnvSet.sharedPool`, which
 * bypasses row-level security. Every statement is a single short query, so no connection or
 * transaction is held while a handler runs.
 */
export const createJobQueueQueries = (
  pool: CommonQueryMethods
): Required<Pick<JobQueueQueries, 'claimDue' | 'settle' | 'releaseClaimed'>> & {
  getGauges: () => Promise<JobQueueGauges>;
} => {
  /**
   * Claim up to `limit` due rows, oldest first. Rows of saturated tenants and groups are skipped,
   * and within the batch each `(tenant, type, group)` and `(tenant, type)` gets at most its
   * remaining slots, so one backlog cannot take the whole batch. The caps apply to a window of
   * the oldest due rows rather than all of them, which keeps a claim short under a large backlog.
   * The outer `for update skip locked` re-checks `next_attempt_at` so a row another worker
   * claimed meanwhile is not claimed twice.
   */
  const claimDue = async ({
    workerId,
    limit,
    types,
    saturatedTenants,
    saturatedGroups,
    tenantRemainingSlots,
    groupRemainingSlots,
  }: ClaimDueInput): Promise<readonly ClaimedJobRow[]> => {
    if (types.length === 0 || limit <= 0) {
      return [];
    }

    return pool.any<Job>(sql`
      with type_configs as (
        select * from unnest(
          ${sql.array(
            types.map(({ type }) => type),
            'varchar'
          )},
          ${sql.array(
            types.map(({ leaseMs }) => leaseMs),
            'int8'
          )},
          ${sql.array(
            types.map(({ perGroupConcurrency }) => perGroupConcurrency ?? null),
            'int4'
          )},
          ${sql.array(
            types.map(({ perTenantConcurrency }) => perTenantConcurrency ?? null),
            'int4'
          )}
        ) as t(type, lease_ms, group_limit, tenant_limit)
      ),
      tenant_slots as (
        select * from unnest(
          ${sql.array(
            tenantRemainingSlots.map(({ tenantId }) => tenantId),
            'varchar'
          )},
          ${sql.array(
            tenantRemainingSlots.map(({ type }) => type),
            'varchar'
          )},
          ${sql.array(
            tenantRemainingSlots.map(({ remainingSlots }) => remainingSlots),
            'int4'
          )}
        ) as s(tenant_id, type, remaining_slots)
      ),
      group_slots as (
        select * from unnest(
          ${sql.array(
            groupRemainingSlots.map(({ tenantId }) => tenantId ?? null),
            'varchar'
          )},
          ${sql.array(
            groupRemainingSlots.map(({ type }) => type),
            'varchar'
          )},
          ${sql.array(
            groupRemainingSlots.map(({ groupKey }) => groupKey),
            'varchar'
          )},
          ${sql.array(
            groupRemainingSlots.map(({ remainingSlots }) => remainingSlots),
            'int4'
          )}
        ) as g(tenant_id, type, group_key, remaining_slots)
      ),
      due_window as (
        select j.id, j.tenant_id, j.type, j.group_key, j.next_attempt_at
        from jobs j
        where j.next_attempt_at <= now()
          and j.type = any(${sql.array(
            types.map(({ type }) => type),
            'varchar'
          )})
          and j.tenant_id <> all(${sql.array(saturatedTenants, 'varchar')})
          and jsonb_build_array(j.tenant_id, j.type) <> all(${sql.array(
            tenantRemainingSlots
              .filter(({ remainingSlots }) => remainingSlots <= 0)
              .map(({ tenantId, type }) => JSON.stringify([tenantId, type])),
            'jsonb'
          )})
          and jsonb_build_array(j.tenant_id, j.type, j.group_key) <> all(${sql.array(
            saturatedGroups.map(({ tenantId, type, groupKey }) =>
              JSON.stringify([tenantId ?? null, type, groupKey])
            ),
            'jsonb'
          )})
        order by j.next_attempt_at asc
        limit ${limit * claimWindowRowsPerSlot}
      ),
      candidates as (
        select
          j.id,
          j.tenant_id,
          j.type,
          j.next_attempt_at,
          tc.lease_ms,
          coalesce(ts.remaining_slots, tc.tenant_limit) as remaining_tenant_slots,
          coalesce(gs.remaining_slots, tc.group_limit) as remaining_group_slots,
          row_number() over (
            partition by j.tenant_id, j.type, j.group_key
            order by j.next_attempt_at asc, j.id asc
          ) as group_rn
        from due_window j
        join type_configs tc on tc.type = j.type
        left join tenant_slots ts on ts.tenant_id = j.tenant_id and ts.type = j.type
        left join group_slots gs
          on gs.tenant_id = j.tenant_id and gs.type = j.type and gs.group_key = j.group_key
      ),
      group_capped as (
        select
          id,
          next_attempt_at,
          lease_ms,
          remaining_tenant_slots,
          row_number() over (
            partition by tenant_id, type
            order by next_attempt_at asc, id asc
          ) as tenant_rn
        from candidates
        where remaining_group_slots is null or group_rn <= remaining_group_slots
      ),
      due as (
        select j.id, gc.lease_ms
        from jobs j
        join group_capped gc on gc.id = j.id
        where (gc.remaining_tenant_slots is null or gc.tenant_rn <= gc.remaining_tenant_slots)
          and j.next_attempt_at <= now()
        order by gc.next_attempt_at asc, gc.id asc
        limit ${limit}
        for update of j skip locked
      )
      update jobs j
      set claimed_by = ${workerId},
        attempts = j.attempts + 1,
        next_attempt_at = now() + due.lease_ms * interval '1 millisecond'
      from due
      where j.id = due.id
      returning j.*
    `);
  };

  /**
   * Delete the row when the job ends, or hand it back with its next due time on retry. Returns
   * `stale` when the lease was lost, so a slow worker never touches a reclaimed row.
   */
  const settle = async ({ job, workerId, resolution }: SettleJobInput): Promise<SettleOutcome> => {
    const { rowCount } =
      resolution.status === 'retry'
        ? await pool.query(sql`
            update jobs
            set claimed_by = null, next_attempt_at = ${toTimestamp(resolution.nextAttemptAt)}
            where ${fenceClaimedJob(job, workerId)}
          `)
        : await pool.query(sql`
            delete from jobs
            where ${fenceClaimedJob(job, workerId)}
          `);

    return rowCount > 0 ? 'settled' : 'stale';
  };

  /** Hand claimed rows back as due now in one statement, such as when the worker shuts down. */
  const releaseClaimed = async ({ workerId, jobs }: ReleaseClaimedInput): Promise<number> => {
    if (jobs.length === 0) {
      return 0;
    }

    const { rowCount } = await pool.query(sql`
      update jobs
      set claimed_by = null, next_attempt_at = now()
      from unnest(
        ${sql.array(
          jobs.map(({ id }) => id),
          'varchar'
        )},
        ${sql.array(
          jobs.map(({ tenantId }) => tenantId ?? null),
          'varchar'
        )},
        ${sql.array(
          jobs.map(({ attempts }) => attempts),
          'int2'
        )}
      ) as released(id, tenant_id, attempts)
      where jobs.id = released.id
        and jobs.tenant_id = released.tenant_id
        and jobs.attempts = released.attempts
        and jobs.claimed_by = ${workerId}
    `);

    return rowCount;
  };

  const getGauges = async () =>
    pool.one<JobQueueGauges>(sql`
      select
        count(*)::int4 as depth,
        greatest(
          coalesce(floor(extract(epoch from now() - min(next_attempt_at)) * 1000), 0),
          0
        )::int8 as oldest_waiting_age_ms,
        (count(*) filter (where claimed_by is not null and next_attempt_at <= now()))::int4
          as expired_leases
      from jobs
    `);

  return { claimDue, settle, releaseClaimed, getGauges };
};
