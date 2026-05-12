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
  startTimeExclusive?: number;
  includeKeyPrefix?: AllowedKeyPrefix[];
};

/**
 * Bounds the rows counted to avoid a full `count(*)` traversal on tenants with
 * very large `logs` tables. When the inner row count reaches `LOGS_COUNT_CAP + 1`,
 * the outer aggregate stops and reports the sentinel value, sharply reducing the
 * chance of hitting `statement_timeout`.
 */
const LOGS_COUNT_CAP = 10_000;

type CountLogsResult = {
  count: number;
  isCapped?: boolean;
};

const buildLogConditionSql = (logCondition: LogCondition) =>
  conditionalSql(logCondition, ({ logKey, payload, startTimeExclusive, includeKeyPrefix = [] }) => {
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
      conditionalSql(
        startTimeExclusive,
        (startTimeExclusive) =>
          sql`${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)`
      ),
    ].filter(({ sql }) => sql);

    return subConditions.length > 0 ? sql`where ${sql.join(subConditions, sql` and `)}` : sql``;
  });

export const createLogQueries = (pool: CommonQueryMethods) => {
  const insertLog = buildInsertIntoWithPool(pool)(Logs);

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
    countLogs,
    findLogs,
    findLogById,
    getHookExecutionStatsByHookId,
  };
};
