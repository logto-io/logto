import {
  type AuditLogPrefix,
  Logs,
  type HookExecutionStats,
  type Log,
  type WebhookLogPrefix,
} from '@logto/schemas';
import { conditional, conditionalArray } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { subDays } from 'date-fns';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Logs);

type AllowedKeyPrefix = AuditLogPrefix | WebhookLogPrefix;

type LogCondition = {
  logKey?: string;
  payload?: { applicationId?: string; userId?: string; hookId?: string };
  /** Inclusive lower bound on `createdAt`, in unix milliseconds. */
  startTime?: number;
  /**
   * Inclusive upper bound on `createdAt`, in unix milliseconds. Internally the
   * SQL adds 1ms so that rows with sub-millisecond precision (PostgreSQL stores
   * timestamps at microsecond granularity) whose displayed `createdAt` rounds
   * to this value are not excluded.
   */
  endTime?: number;
  includeKeyPrefix?: AllowedKeyPrefix[];
};

/**
 * Bounds the rows counted to avoid a full `count(*)` traversal on tenants with
 * very large `logs` tables. The inner subquery is capped at `LOGS_COUNT_CAP + 1`
 * rows via `LIMIT`, so the outer `count(*)` never scans beyond that; a result
 * exceeding `LOGS_COUNT_CAP` is then reported as capped. This sharply reduces the
 * chance of hitting `statement_timeout`.
 */
const LOGS_COUNT_CAP = 10_000;

type CountLogsResult = {
  count: number;
  isCapped?: boolean;
};

const buildLogConditionSql = (logCondition: LogCondition) =>
  conditionalSql(logCondition, ({ logKey, payload, startTime, endTime, includeKeyPrefix = [] }) => {
    const keyPrefixFilter = conditional(
      includeKeyPrefix.length > 0 &&
        includeKeyPrefix.map((prefix) => sql`${fields.key} like ${`${prefix}%`}`)
    );
    const subConditions = [
      conditionalSql(
        keyPrefixFilter,
        (keyPrefixFilter) => sql`(${sql.join(keyPrefixFilter, sql` or `)})`
      ),
      ...conditionalArray(
        payload &&
          Object.entries(payload).map(([key, value]) =>
            value ? sql`${fields.payload}->>${key}=${value}` : sql``
          )
      ),
      conditionalSql(logKey, (logKey) => sql`${fields.key}=${logKey}`),
      // Use `!== undefined` (not `conditionalSql`) so a legitimate `start_time=0`
      // or `end_time=0` window still applies — `conditionalSql` treats `0` as
      // falsy and would silently drop the filter.
      startTime === undefined
        ? sql``
        : sql`${fields.createdAt} >= to_timestamp(${startTime}::double precision / 1000)`,
      endTime === undefined
        ? sql``
        : sql`${fields.createdAt} < to_timestamp(${endTime}::double precision / 1000) + interval '1 millisecond'`,
    ].filter(({ sql }) => sql);

    return subConditions.length > 0 ? sql`where ${sql.join(subConditions, sql` and `)}` : sql``;
  });

export const createLogQueries = (pool: CommonQueryMethods) => {
  const insertLog = buildInsertIntoWithPool(pool)(Logs);
  const insertLogIfNotExists = buildInsertIntoWithPool(pool)(Logs, {
    onConflict: { ignore: true },
  });

  const countLogs = async (
    condition: LogCondition,
    options?: { capped?: boolean }
  ): Promise<CountLogsResult> => {
    if (!options?.capped) {
      // Postgres returns a bigint for count(*), which Slonik surfaces as a string.
      const { count } = await pool.one<{ count: string }>(sql`
        select count(*)
        from ${table}
        ${buildLogConditionSql(condition)}
      `);
      return { count: Number(count) };
    }

    const cappedLimit = LOGS_COUNT_CAP + 1;
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from (
        select 1
        from ${table}
        ${buildLogConditionSql(condition)}
        limit ${cappedLimit}
      ) s
    `);
    const numericCount = Number(count);
    return { count: numericCount, isCapped: numericCount > LOGS_COUNT_CAP };
  };

  const findLogs = async (limit: number, offset: number, logCondition: LogCondition) =>
    pool.any<Log>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${buildLogConditionSql(logCondition)}
      order by ${fields.createdAt} desc
      limit ${limit}
      offset ${offset}
    `);

  const findLogById = buildFindEntityByIdWithPool(pool)(Logs);

  const deleteLogsBefore = async (condition: {
    before: number;
    after?: number;
    limit: number;
  }): Promise<{ deletedCount: number; deletedRange?: { oldest: number; newest: number } }> => {
    const { before, after, limit } = condition;
    // Use `=== undefined` (not `conditionalSql`) so a legitimate `after: 0` still applies a
    // lower bound; `conditionalSql` treats `0` as falsy and would silently drop the filter.
    const afterCondition =
      after === undefined
        ? sql``
        : sql`and ${fields.createdAt} > to_timestamp(${after}::double precision / 1000)`;

    // Tenant isolation is enforced by RLS through the tenant-scoped pool.
    const rows = await pool.any<{ createdAt: number }>(sql`
      delete from ${table}
      where ${fields.id} in (
        select ${fields.id}
        from ${table}
        where ${fields.createdAt} < to_timestamp(${before}::double precision / 1000)
        ${afterCondition}
        order by ${fields.createdAt}, ${fields.id}
        limit ${limit}
      )
      returning ${fields.createdAt}
    `);

    // Nothing matched: report an empty batch and omit `deletedRange` entirely. Returning early is
    // also what keeps the `±Infinity` seeds below from ever reaching the response, where
    // `JSON.stringify` would render an infinite bound as `null`.
    if (rows.length === 0) {
      return { deletedCount: 0 };
    }

    // This repo's pools use slonik's default `createTypeParserPreset`, whose `timestamptz`
    // parser is `Date.parse(value)`, so the column arrives as a unix-millisecond number.
    const timestamps = rows.map(({ createdAt }) => createdAt);

    // Fold instead of spreading into `Math.min` / `Math.max`: the spread is limited by the
    // engine's maximum argument count, which `maxDeleteLimit` could exceed if it is raised.
    //
    // The seeds are the identity elements for min/max. `rows` is non-empty here (the empty case
    // returned above), so both are always replaced by real timestamps before this is returned.
    const deletedRange = timestamps.reduce(
      (range, timestamp) => ({
        oldest: Math.min(range.oldest, timestamp),
        newest: Math.max(range.newest, timestamp),
      }),
      { oldest: Number.POSITIVE_INFINITY, newest: Number.NEGATIVE_INFINITY }
    );

    return {
      deletedCount: timestamps.length,
      deletedRange,
    };
  };

  const getHookExecutionStatsByHookId = async (hookId: string) => {
    const startTimeExclusive = subDays(new Date(), 1).getTime();
    return pool.one<HookExecutionStats>(sql`
      select count(*) as request_count,
      count(case when ${fields.payload}->>'result' = 'Success' then 1 end) as success_count
      from ${table}
      where ${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)
      and ${fields.payload}->>'hookId' = ${hookId}
    `);
  };

  return {
    insertLog,
    insertLogIfNotExists,
    countLogs,
    findLogs,
    findLogById,
    deleteLogsBefore,
    getHookExecutionStatsByHookId,
  };
};
