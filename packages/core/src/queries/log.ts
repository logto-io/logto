import { CreateLog, Log, Logs } from '@logto/schemas';
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
