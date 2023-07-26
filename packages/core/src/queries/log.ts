import type { HookExecutionStats, Log } from '@logto/schemas';
import { token, hook, Logs } from '@logto/schemas';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { conditional, conditionalArray } from '@silverhand/essentials';
import { subDays } from 'date-fns';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

const { table, fields } = convertToIdentifiers(Logs);

type AuditLogCondition = {
  logKey?: string;
  applicationId?: string;
  userId?: string;
};

type WebhookLogCondition = {
  logKey?: string;
  hookId?: string;
  startTimeExclusive?: number;
};

const buildAuditLogConditionSql = (logCondition: AuditLogCondition) =>
  conditionalSql(logCondition, ({ logKey, applicationId, userId }) => {
    const subConditions = conditionalArray(
      sql`${fields.key} not like ${`${hook.Type.TriggerHook}.%`}`,
      conditional(
        logKey && !logKey.startsWith(`${hook.Type.TriggerHook}.`) && sql`${fields.key}=${logKey}`
      ),
      conditionalSql(userId, (userId) => sql`${fields.payload}->>'userId'=${userId}`),
      conditionalSql(
        applicationId,
        (applicationId) => sql`${fields.payload}->>'applicationId'=${applicationId}`
      )
    ).filter(({ sql }) => sql);

    return subConditions.length > 0 ? sql`where ${sql.join(subConditions, sql` and `)}` : sql``;
  });

const buildWebhookLogConditionSql = (logCondition: WebhookLogCondition) =>
  conditionalSql(logCondition, ({ logKey, hookId, startTimeExclusive }) => {
    const subConditions = conditionalArray(
      sql`${fields.key} like ${`${hook.Type.TriggerHook}.%`}`,
      conditional(logKey?.startsWith(`${hook.Type.TriggerHook}.`) && sql`${fields.key}=${logKey}`),
      conditionalSql(hookId, (hookId) => sql`${fields.payload}->>'hookId'=${hookId}`),
      conditionalSql(
        startTimeExclusive,
        (startTimeExclusive) =>
          sql`${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)`
      )
    ).filter(({ sql }) => sql);

    return subConditions.length > 0 ? sql`where ${sql.join(subConditions, sql` and `)}` : sql``;
  });

export const createLogQueries = (pool: CommonQueryMethods) => {
  const insertLog = buildInsertIntoWithPool(pool)(Logs);

  const countAuditLogs = async (condition: AuditLogCondition) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      ${buildAuditLogConditionSql(condition)}
    `);

  const findAuditLogs = async (limit: number, offset: number, logCondition: AuditLogCondition) =>
    pool.any<Log>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${buildAuditLogConditionSql(logCondition)}
      order by ${fields.createdAt} desc
      limit ${limit}
      offset ${offset}
    `);

  const countWebhookLogs = async (condition: WebhookLogCondition) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      ${buildWebhookLogConditionSql(condition)}
    `);

  const findWebhookLogs = async (
    limit: number,
    offset: number,
    logCondition: WebhookLogCondition
  ) =>
    pool.any<Log>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${buildWebhookLogConditionSql(logCondition)}
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
    countAuditLogs,
    findAuditLogs,
    countWebhookLogs,
    findWebhookLogs,
    findLogById,
    getDailyActiveUserCountsByTimeInterval,
    countActiveUsersByTimeInterval,
    getHookExecutionStatsByHookId,
  };
};
