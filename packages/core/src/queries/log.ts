import { CreateLog, Log, Logs, LogType } from '@logto/schemas';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import { buildFindEntityById } from '@/database/find-entity-by-id';
import { buildInsertInto } from '@/database/insert-into';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(Logs);

export const insertLog = buildInsertInto<CreateLog>(Logs);

export type LogCondition = {
  logType?: string;
  applicationId?: string;
  userId?: string;
};

const buildLogConditionSql = (logCondition: LogCondition) =>
  conditionalSql(logCondition, ({ logType, applicationId, userId }) => {
    const subConditions = [
      conditionalSql(logType, (logType) => sql`${fields.type}=${logType}`),
      conditionalSql(userId, (userId) => sql`${fields.payload}->>'userId'=${userId}`),
      conditionalSql(
        applicationId,
        (applicationId) => sql`${fields.payload}->>'applicationId'=${applicationId}`
      ),
    ].filter(({ sql }) => sql);

    return subConditions.length > 0 ? sql`where ${sql.join(subConditions, sql` and `)}` : sql``;
  });

export const countLogs = async (condition: LogCondition) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    ${buildLogConditionSql(condition)}
  `);

export const findLogs = async (limit: number, offset: number, logCondition: LogCondition) =>
  envSet.pool.any<Log>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    ${buildLogConditionSql(logCondition)}
    order by ${fields.createdAt} desc
    limit ${limit}
    offset ${offset}
  `);

export const findLogById = buildFindEntityById<CreateLog, Log>(Logs);

// The active user should exchange the tokens by the authorization code (i.e. sign-in)
// or exchange the access token, which will expire in 2 hours, by the refresh token.
const activeUserLogTypes: LogType[] = ['CodeExchangeToken', 'RefreshTokenExchangeToken'];

export const getDailyActiveUserCountsByTimeInterval = async (
  startTimeExclusive: number,
  endTimeInclusive: number
) =>
  envSet.pool.any<{ date: string; count: number }>(sql`
    select date(${fields.createdAt}), count(distinct(${fields.payload}->>'userId'))
    from ${table}
    where ${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)
    and ${fields.createdAt} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
    and ${fields.type} in (${sql.join(activeUserLogTypes, sql`, `)})
    and ${fields.payload}->>'result' = 'Success'
    group by date(${fields.createdAt})
  `);

export const countActiveUsersByTimeInterval = async (
  startTimeExclusive: number,
  endTimeInclusive: number
) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(distinct(${fields.payload}->>'userId'))
    from ${table}
    where ${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)
    and ${fields.createdAt} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
    and ${fields.type} in (${sql.join(activeUserLogTypes, sql`, `)})
    and ${fields.payload}->>'result' = 'Success'
  `);
