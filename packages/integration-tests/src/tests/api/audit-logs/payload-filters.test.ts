import {
  type Hook,
  type HookResponse,
  type LogResponse,
  InteractionHookEvent,
  LogKeyUnknown,
  LogResult,
  defaultTenantId,
  hook,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { authedAdminApi } from '#src/api/api.js';
import { getAuditLogs, getAuditLogsResponse, getWebhookRecentLogs } from '#src/api/logs.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';

describe('log payload filters', () => {
  const userId = generateStandardId();
  const applicationId = generateStandardId();
  const userLogId = generateStandardId();
  const applicationLogId = generateStandardId();
  const hookLogId = generateStandardId();
  const otherHookLogId = generateStandardId();
  const hookLogKey = `${hook.Type.TriggerHook}.${InteractionHookEvent.PostRegister}`;

  /* eslint-disable @silverhand/fp/no-let -- Jest lifecycle initializes the pool and the hook */
  let pool: DatabasePool;
  let createdHook: Hook;
  /* eslint-enable @silverhand/fp/no-let */

  const insertLog = async (id: string, key: string, payload: Record<string, string>) =>
    pool.query(sql`
      insert into logs (tenant_id, id, key, payload)
      values (${defaultTenantId}, ${id}, ${key}, ${sql.jsonb({
        key,
        result: LogResult.Success,
        ...payload,
      })})
    `);

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation -- Jest lifecycle initializes the pool and the hook */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    createdHook = await authedAdminApi
      .post('hooks', { json: getHookCreationPayload(InteractionHookEvent.PostRegister) })
      .json<Hook>();
    /* eslint-enable @silverhand/fp/no-mutation */

    // The user and application rows each carry the other's key with a value that matches nothing.
    await insertLog(userLogId, LogKeyUnknown, { userId, applicationId: generateStandardId() });
    await insertLog(applicationLogId, LogKeyUnknown, {
      userId: generateStandardId(),
      applicationId,
    });
    await insertLog(hookLogId, hookLogKey, { hookId: createdHook.id });
    await insertLog(otherHookLogId, hookLogKey, { hookId: generateStandardId() });
  });

  afterAll(async () => {
    await pool.query(sql`
      delete from logs
      where id in (${userLogId}, ${applicationLogId}, ${hookLogId}, ${otherHookLogId})
    `);
    await pool.end();
    await authedAdminApi.delete(`hooks/${createdHook.id}`);
  });

  it('filters audit logs by user id', async () => {
    const response = await getAuditLogsResponse(new URLSearchParams({ userId }));
    const logs = await response.json<LogResponse[]>();

    expect(logs.map(({ id }) => id)).toEqual([userLogId]);
    expect(response.headers.get('total-number')).toBe('1');
  });

  it('filters audit logs by application id', async () => {
    const logs = await getAuditLogs(new URLSearchParams({ applicationId }));

    expect(logs.map(({ id }) => id)).toEqual([applicationLogId]);
  });

  it('returns only the recent logs of the hook', async () => {
    const logs = await getWebhookRecentLogs(createdHook.id);

    expect(logs.map(({ id }) => id)).toEqual([hookLogId]);
  });

  it('counts the hook executions by hook id', async () => {
    const { executionStats } = await authedAdminApi
      .get(`hooks/${createdHook.id}?includeExecutionStats=true`)
      .json<HookResponse>();

    expect(executionStats).toEqual({ requestCount: 1, successCount: 1 });
  });
});
