import { CreateLog, Log, Logs } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { conditionalSql, convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(Logs);

export const insertLog = buildInsertInto<CreateLog>(Logs);

export interface UserLogCondition {
  userId: string;
  applicationId?: string;
  logType?: string;
}

export const countUserLogs = async ({ userId, applicationId, logType }: UserLogCondition) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    where ${fields.payload}->>'userId'=${userId}
    ${conditionalSql(
      applicationId,
      (applicationId) => sql`and ${fields.payload}->>'applicationId'=${applicationId}`
    )}
    ${conditionalSql(logType, (logType) => sql`and ${fields.type}=${logType}`)}
  `);

export const findUserLogs = async (
  limit: number,
  offset: number,
  { userId, applicationId, logType }: UserLogCondition
) =>
  envSet.pool.any<Log>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.payload}->>'userId'=${userId}
    ${conditionalSql(
      applicationId,
      (applicationId) => sql`and ${fields.payload}->>'applicationId'=${applicationId}`
    )}
    ${conditionalSql(logType, (logType) => sql`and ${fields.type}=${logType}`)}
    limit ${limit}
    offset ${offset}
  `);
