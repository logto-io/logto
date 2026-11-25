import { type ParkDueGroupInput } from '@logto/job-queue';
import { type Job, type LogContextPayload, type LogKey } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

export type JobLogUpsert = {
  key: LogKey;
  payload: LogContextPayload;
};

export type ExpiredJobRow = Pick<
  Job,
  'id' | 'tenantId' | 'type' | 'groupKey' | 'payload' | 'attempts'
>;

export type CreateJobQueueQueriesOptions = {
  /**
   * Build the fallback log entry written when `parkDueGroup` bulk-expires a waiting row that
   * has no `logs` row yet. Existing `logs` rows keep their previous payload and only have
   * `nextAttemptAt` cleared.
   */
  buildExpiredLog?: (row: ExpiredJobRow) => JobLogUpsert | undefined;
  /** Invoked after `parkDueGroup` commits a non-zero number of bulk-expired rows. */
  onBulkExpired?: (count: number) => void;
};

const toTimestamp = (epochMs: number) => sql`to_timestamp(${epochMs}::double precision / 1000)`;

/**
 * Create the `parkDueGroup` adapter query: bulk-expires the group's rows older than `minCreatedAt`
 * (keeping `logs` consistent and writing fallback failure logs for unattempted rows), then parks
 * the rest to `nextAttemptAt`. Both steps cover due rows and waiting rows due before
 * `nextAttemptAt`, such as the failed probe that was just handed back, and never touch a live
 * lease. Rows are locked in `id` order and rows locked by another transaction are skipped, so a
 * park neither waits on nor deadlocks with a concurrent claim, settlement, or park.
 */
export const createParkDueGroup =
  (pool: CommonQueryMethods, options?: CreateJobQueueQueriesOptions) =>
  async ({
    tenantId,
    type,
    groupKey,
    nextAttemptAt,
    minCreatedAt,
  }: ParkDueGroupInput): Promise<number> => {
    if (!tenantId) {
      return 0;
    }

    const isParkable = sql`
      tenant_id = ${tenantId}
      and type = ${type}
      and group_key = ${groupKey}
      and (
        next_attempt_at <= now()
        or (claimed_by is null and next_attempt_at < ${toTimestamp(nextAttemptAt)})
      )
    `;

    const { parkedCount, expiredCount } = await pool.transaction(async (connection) => {
      const expired =
        minCreatedAt > 0
          ? await connection.any<ExpiredJobRow>(sql`
              with targets as (
                select id
                from jobs
                where ${isParkable}
                  and created_at <= ${toTimestamp(minCreatedAt)}
                order by id asc
                for update skip locked
              )
              delete from jobs
              using targets
              where jobs.id = targets.id
              returning jobs.id, jobs.tenant_id, jobs.type, jobs.group_key, jobs.payload,
                jobs.attempts
            `)
          : [];

      if (expired.length > 0) {
        const expiredWithLogs = expired.map((row) => ({
          row,
          log: options?.buildExpiredLog?.(row),
        }));
        const withFallback = expiredWithLogs.filter(
          (item): item is { row: ExpiredJobRow; log: JobLogUpsert } => item.log !== undefined
        );
        const withoutFallback = expiredWithLogs
          .filter((item) => item.log === undefined)
          .map(({ row }) => row);

        if (withFallback.length > 0) {
          await connection.query(sql`
            insert into logs (tenant_id, id, key, payload)
            select v.tenant_id, v.id, v.key, v.payload
            from unnest(
              ${sql.array(
                withFallback.map(({ row }) => row.tenantId),
                'varchar'
              )},
              ${sql.array(
                withFallback.map(({ row }) => row.id),
                'varchar'
              )},
              ${sql.array(
                withFallback.map(({ log }) => log.key),
                'varchar'
              )},
              ${sql.array(
                withFallback.map(({ log }) => JSON.stringify(log.payload)),
                'jsonb'
              )}
            ) as v(tenant_id, id, key, payload)
            on conflict (id) do update
              set payload = logs.payload - 'nextAttemptAt'
              where logs.tenant_id = excluded.tenant_id
                and logs.payload ? 'nextAttemptAt'
          `);
        }

        if (withoutFallback.length > 0) {
          await connection.query(sql`
            update logs
            set payload = payload - 'nextAttemptAt'
            where tenant_id = ${tenantId}
              and id = any(${sql.array(
                withoutFallback.map(({ id }) => id),
                'varchar'
              )})
              and payload ? 'nextAttemptAt'
          `);
        }
      }

      const { count } = await connection.one<{ count: number }>(sql`
        with targets as (
          select id
          from jobs
          where ${isParkable}
          order by id asc
          for update skip locked
        ),
        parked as (
          update jobs
          set claimed_by = null,
              next_attempt_at = ${toTimestamp(nextAttemptAt)}
          from targets
          where jobs.id = targets.id
          returning jobs.id, jobs.tenant_id
        ),
        updated_logs as (
          update logs
          set payload = jsonb_set(
            payload,
            '{nextAttemptAt}',
            to_jsonb(${Math.trunc(nextAttemptAt)}::int8),
            true
          )
          from parked
          where logs.id = parked.id
            and logs.tenant_id = parked.tenant_id
            and logs.payload ? 'nextAttemptAt'
        )
        select count(*)::int4 as count from parked
      `);

      return { parkedCount: count, expiredCount: expired.length };
    });

    if (expiredCount > 0) {
      options?.onBulkExpired?.(expiredCount);
    }

    return parkedCount;
  };
