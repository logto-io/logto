import {
  type token,
  type hook,
  Logs,
  type HookExecutionStats,
  type Log,
  type interaction,
  type LogKeyUnknown,
} from '@logto/schemas';
import { conditional, conditionalArray } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { subDays } from 'date-fns';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Logs);

export type AllowedKeyPrefix = hook.Type | token.Type | interaction.Prefix | typeof LogKeyUnknown;

type LogCondition = {
  logKey?: string;
  payload?: { applicationId?: string; userId?: string; hookId?: string };
  startTimeExclusive?: number;
  includeKeyPrefix?: AllowedKeyPrefix[];
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

  const countLogs = async (condition: LogCondition) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      ${buildLogConditionSql(condition)}
    `);

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
