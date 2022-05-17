import { CreateLog, Log, Logs, registerLogTypes } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { conditionalSql, convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(Logs);

export const insertLog = buildInsertInto<CreateLog>(Logs);

export interface LogCondition {
  logType?: string;
  applicationId?: string;
  userId?: string;
}

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

    return sql`where ${sql.join(subConditions, sql` and `)}`;
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
    limit ${limit}
    offset ${offset}
  `);

// DNU: Daily New User
export const getDnuCountsByTimeInterval = async (
  startTimeInclusive: number,
  endTimeExclusive: number
) =>
  envSet.pool.any<{ date: string; count: number }>(sql`
    select date(${fields.createdAt}), count(*)
    from ${table}
    where ${fields.createdAt} >= to_timestamp(${startTimeInclusive}::double precision / 1000)
    and ${fields.createdAt} < to_timestamp(${endTimeExclusive}::double precision / 1000)
    and ${fields.type} in (${sql.join(registerLogTypes, sql`,`)})
    and ${fields.payload}->>'result' = 'Success'
    group by date(${fields.createdAt})
  `);
