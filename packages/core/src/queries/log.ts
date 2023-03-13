import type { Log } from '@logto/schemas';
import { token, Logs } from '@logto/schemas';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

const { table, fields } = convertToIdentifiers(Logs);

export type LogCondition = {
  logKey?: string;
  applicationId?: string;
  userId?: string;
};

const buildLogConditionSql = (logCondition: LogCondition) =>
  conditionalSql(logCondition, ({ logKey, applicationId, userId }) => {
    const subConditions = [
      conditionalSql(logKey, (logKey) => sql`${fields.key}=${logKey}`),
      conditionalSql(userId, (userId) => sql`${fields.payload}->>'userId'=${userId}`),
      conditionalSql(
        applicationId,
        (applicationId) => sql`${fields.payload}->>'applicationId'=${applicationId}`
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

  const getDailyActiveUserCountsByTimeInterval = async (
    startTimeExclusive: number,
    endTimeInclusive: number
  ) =>
    pool.any<{ date: string; count: number }>(sql`
      select date(${fields.createdAt}), count(distinct(${fields.payload}->>'userId'))
      from ${table}
      where ${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)
      and ${fields.createdAt} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
      and ${fields.key} like ${`${token.Type.ExchangeTokenBy}.%`}
      and ${fields.payload}->>'result' = 'Success'
      group by date(${fields.createdAt})
    `);

  const countActiveUsersByTimeInterval = async (
    startTimeExclusive: number,
    endTimeInclusive: number
  ) =>
    pool.one<{ count: number }>(sql`
      select count(distinct(${fields.payload}->>'userId'))
      from ${table}
      where ${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)
      and ${fields.createdAt} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
      and ${fields.key} like ${`${token.Type.ExchangeTokenBy}.%`}
      and ${fields.payload}->>'result' = 'Success'
    `);

  return {
    insertLog,
    countLogs,
    findLogs,
    findLogById,
    getDailyActiveUserCountsByTimeInterval,
    countActiveUsersByTimeInterval,
  };
};
