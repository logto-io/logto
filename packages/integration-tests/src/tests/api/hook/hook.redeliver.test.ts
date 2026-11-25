/* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods -- mock webhook fixture state is updated per request */
import { type HookResponse, LogResult, type LogResponse, defaultTenantId } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql } from '@silverhand/slonik';
import { HTTPError } from 'ky';
import { z } from 'zod';

import { authedAdminApi } from '#src/api/api.js';
import { getAuditLogs, getLog, getWebhookRecentLogs, redeliverWebhookLog } from '#src/api/logs.js';
import { createRole, deleteRole } from '#src/api/role.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureDisabledTest, devFeatureTest, waitFor } from '#src/utils.js';

import WebhookMockServer, { mockHookResponseGuard, verifySignature } from './WebhookMockServer.js';

const redeliverPort = 9981;
const hookName = 'webhookRedeliverHook';
const hookEvent = 'Role.Created';

type MockServerState = {
  requestCount: number;
  statusCode: number;
  succeedOnAttempt: number;
  retryAfter: string | undefined;
  receivedPayloads: Array<{ rawPayload: string; signature: string; deliveryId: unknown }>;
};

const state: MockServerState = {
  requestCount: 0,
  statusCode: 200,
  succeedOnAttempt: Number.POSITIVE_INFINITY,
  retryAfter: undefined,
  receivedPayloads: [],
};

const pollHookLog = async (
  hookId: string,
  predicate: (logs: LogResponse[]) => LogResponse | undefined,
  retriesLeft = 150
): Promise<LogResponse | undefined> => {
  const logs = await getWebhookRecentLogs(
    hookId,
    new URLSearchParams({ logKey: `TriggerHook.${hookEvent}`, page_size: '20' })
  );
  const matched = predicate(logs);

  if (matched) {
    return matched;
  }

  if (retriesLeft <= 1) {
    return undefined;
  }

  await waitFor(100);
  return pollHookLog(hookId, predicate, retriesLeft - 1);
};

const triggerRoleCreatedAndWaitForLog = async (hookId: string, description: string) => {
  const role = await createRole({ description });

  try {
    const log = await pollHookLog(hookId, (logs) => logs[0]);
    expect(log).toBeDefined();
    return log!;
  } finally {
    await deleteRole(role.id);
  }
};

const insertHistoricalHookLog = async ({
  hookId,
  hoursAgo,
  result = LogResult.Error,
}: {
  hookId: string;
  hoursAgo: number;
  result?: LogResult;
}) => {
  const pool = await createPool(assertEnv('DB_URL'), {
    interceptors: createInterceptorsPreset(),
  });
  const id = generateStandardId();
  const key = `TriggerHook.${hookEvent}`;

  try {
    await pool.query(sql`
      insert into logs (tenant_id, id, key, payload, created_at)
      values (
        ${defaultTenantId},
        ${id},
        ${key},
        ${sql.jsonb({
          key,
          result,
          hookId,
          attempts: 1,
          hookRequest: {
            body: {
              event: hookEvent,
              hookId,
              deliveryId: id,
              createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
            },
          },
          error: 'HTTP 500',
        })},
        now() - ${hoursAgo} * interval '1 hour'
      )
    `);
  } finally {
    await pool.end();
  }

  return id;
};

const cleanupLogsByIds = async (ids: string[]) => {
  if (ids.length === 0) {
    return;
  }

  const pool = await createPool(assertEnv('DB_URL'), {
    interceptors: createInterceptorsPreset(),
  });

  try {
    await pool.query(sql`
      delete from logs
      where tenant_id = ${defaultTenantId}
        and id = any(${sql.array(ids, 'varchar')})
    `);
  } finally {
    await pool.end();
  }
};

const webhookBodyWithDeliveryIdGuard = z.object({
  deliveryId: z.string().optional(),
});

describe('webhook manual redelivery and 48-hour recent-logs window', () => {
  const webHookApi = new WebHookApiTest();
  const webhookServer = new WebhookMockServer(redeliverPort, (body, _request, response) => {
    state.requestCount += 1;

    const parsedBody: unknown = JSON.parse(body);
    const parsed = mockHookResponseGuard.parse({ body: parsedBody });
    const { deliveryId } = webhookBodyWithDeliveryIdGuard.parse(parsed.body.payload);
    state.receivedPayloads.push({
      rawPayload: parsed.body.rawPayload,
      signature: parsed.body.signature,
      deliveryId,
    });

    const status = state.requestCount >= state.succeedOnAttempt ? 200 : state.statusCode;

    if (status >= 400) {
      if (state.retryAfter !== undefined) {
        response.setHeader('Retry-After', state.retryAfter);
      }
      response.statusCode = status;
      response.end();
    }
  });

  beforeAll(async () => {
    await webhookServer.listen();
  });

  afterAll(async () => {
    await webhookServer.close();
  });

  beforeEach(async () => {
    state.requestCount = 0;
    state.statusCode = 200;
    state.succeedOnAttempt = Number.POSITIVE_INFINITY;
    state.retryAfter = undefined;
    state.receivedPayloads = [];

    await webHookApi.create({
      name: hookName,
      events: [hookEvent],
      config: { url: webhookServer.endpoint },
    });
  });

  afterEach(async () => {
    await webHookApi.cleanUp();
  });

  devFeatureDisabledTest.it(
    'hides the redeliver route and keeps the 24-hour default recent-logs window when dev features are disabled',
    async () => {
      const hook = webHookApi.hooks.get(hookName)!;

      const responseError = await redeliverWebhookLog(hook.id, 'any-log-id').catch(
        (error: unknown) => error
      );
      expect(responseError instanceof HTTPError && responseError.response.status).toBe(404);

      const oldLogId = await insertHistoricalHookLog({ hookId: hook.id, hoursAgo: 36 });

      try {
        const logs = await getWebhookRecentLogs(hook.id, new URLSearchParams({ page_size: '50' }));
        expect(logs.some((entry) => entry.id === oldLogId)).toBe(false);
      } finally {
        await cleanupLogsByIds([oldLogId]);
      }
    }
  );

  devFeatureTest.it(
    'validates hook, ownership, key prefix, and terminal failure state',
    async () => {
      const primaryHook = webHookApi.hooks.get(hookName)!;
      const secondaryHook = await webHookApi.create({
        name: `${hookName}-secondary`,
        events: [hookEvent],
        config: { url: webhookServer.endpoint },
      });

      // Nonexistent hook -> 404
      await expectRejects(redeliverWebhookLog('nonexistent-hook', 'any-log-id'), {
        code: 'entity.not_exists_with_id',
        status: 404,
      });

      // Trigger a succeeded log on primaryHook
      const succeededLog = await triggerRoleCreatedAndWaitForLog(
        primaryHook.id,
        'redeliver-validate-success'
      );
      expect(succeededLog.payload.result).toBe(LogResult.Success);

      // Nonexistent log -> 404
      await expectRejects(redeliverWebhookLog(primaryHook.id, 'nonexistent-log'), {
        code: 'entity.not_exists_with_id',
        status: 404,
      });

      // Log belonging to another hook -> 404
      await expectRejects(redeliverWebhookLog(secondaryHook.id, succeededLog.id), {
        code: 'entity.not_exists_with_id',
        status: 404,
      });

      // Non-TriggerHook audit log -> 404
      const auditLogs = await getAuditLogs(new URLSearchParams({ page_size: '1' }));
      expect(auditLogs.length).toBeGreaterThan(0);
      await expectRejects(redeliverWebhookLog(primaryHook.id, auditLogs[0]!.id), {
        code: 'entity.not_exists_with_id',
        status: 404,
      });

      // Succeeded webhook log -> 422
      await expectRejects(redeliverWebhookLog(primaryHook.id, succeededLog.id), {
        code: 'hook.log_not_permanently_failed',
        status: 422,
      });

      // Disabled hook -> 422
      await authedAdminApi.patch(`hooks/${primaryHook.id}`, { json: { enabled: false } });
      await expectRejects(redeliverWebhookLog(primaryHook.id, succeededLog.id), {
        code: 'hook.disabled',
        status: 422,
      });
    }
  );

  devFeatureTest.it(
    'redelivers a failed delivery with rotated signing key, keeps deliveryId, and writes only to the new log row',
    async () => {
      const hook = webHookApi.hooks.get(hookName)!;
      state.statusCode = 400;

      const originalLog = await triggerRoleCreatedAndWaitForLog(hook.id, 'redeliver-happy-path');
      expect(originalLog.payload.result).toBe(LogResult.Error);
      expect(originalLog.payload.nextAttemptAt).toBeUndefined();

      const rotatedHook = await authedAdminApi
        .patch(`hooks/${hook.id}/signing-key`)
        .json<HookResponse>();

      state.statusCode = 200;
      state.receivedPayloads = [];

      const redeliverResponse = await redeliverWebhookLog(hook.id, originalLog.id);
      expect(redeliverResponse.status).toBe(202);
      const { logId: redeliveryLogId } = await redeliverResponse.json<{ logId: string }>();
      expect(redeliveryLogId).toBeTruthy();
      expect(redeliveryLogId).not.toBe(originalLog.id);

      const redeliveryLog = await pollHookLog(hook.id, (logs) =>
        logs.find(
          (entry) => entry.id === redeliveryLogId && entry.payload.result === LogResult.Success
        )
      );
      expect(redeliveryLog).toBeDefined();
      expect(redeliveryLog?.payload.attempts).toBe(1);
      expect(redeliveryLog?.payload.nextAttemptAt).toBeUndefined();
      expect(redeliveryLog?.payload.redeliveredFrom).toBe(originalLog.id);

      // Verify receiver saw the exact original deliveryId signed with the rotated key.
      expect(state.receivedPayloads).toHaveLength(1);
      const received = state.receivedPayloads[0]!;
      expect(received.deliveryId).toBe(originalLog.id);
      expect(verifySignature(received.rawPayload, rotatedHook.signingKey, received.signature)).toBe(
        true
      );

      // Original failed log remains untouched.
      const untouchedOriginal = await getLog(originalLog.id);
      expect(untouchedOriginal.payload.result).toBe(LogResult.Error);
      expect(untouchedOriginal.payload.redeliveredFrom).toBeUndefined();
    }
  );

  devFeatureTest.it(
    'retries a redelivery that receives 503 then 200 and updates only the new log entry',
    async () => {
      const hook = webHookApi.hooks.get(hookName)!;
      state.statusCode = 400;

      const originalLog = await triggerRoleCreatedAndWaitForLog(hook.id, 'redeliver-retry-200');
      expect(originalLog.payload.result).toBe(LogResult.Error);

      state.requestCount = 0;
      state.statusCode = 503;
      state.retryAfter = '0';
      state.succeedOnAttempt = 2;

      const redeliverResponse = await redeliverWebhookLog(hook.id, originalLog.id);
      expect(redeliverResponse.status).toBe(202);
      const { logId: redeliveryLogId } = await redeliverResponse.json<{ logId: string }>();

      const settledLog = await pollHookLog(hook.id, (logs) =>
        logs.find(
          (entry) => entry.id === redeliveryLogId && entry.payload.result === LogResult.Success
        )
      );
      expect(settledLog?.payload.attempts).toBe(2);
      expect(settledLog?.payload.nextAttemptAt).toBeUndefined();
      expect(settledLog?.payload.redeliveredFrom).toBe(originalLog.id);

      const untouchedOriginal = await getLog(originalLog.id);
      expect(untouchedOriginal.payload.result).toBe(LogResult.Error);
      expect(untouchedOriginal.payload.attempts).toBe(1);
      expect(untouchedOriginal.payload.redeliveredFrom).toBeUndefined();
    }
  );

  devFeatureTest.it(
    'rejects concurrent duplicate redeliveries with 409, rejects retrying logs with 422, and excludes retrying logs from executionStats',
    async () => {
      const hook = webHookApi.hooks.get(hookName)!;
      state.statusCode = 400;

      const originalLog = await triggerRoleCreatedAndWaitForLog(
        hook.id,
        'redeliver-conflict-and-stats'
      );
      expect(originalLog.payload.result).toBe(LogResult.Error);

      state.statusCode = 503;
      state.retryAfter = '3600';

      const redeliverResponse = await redeliverWebhookLog(hook.id, originalLog.id);
      expect(redeliverResponse.status).toBe(202);
      const { logId: retryingLogId } = await redeliverResponse.json<{ logId: string }>();

      const retryingLog = await pollHookLog(hook.id, (logs) =>
        logs.find(
          (entry) => entry.id === retryingLogId && typeof entry.payload.nextAttemptAt === 'number'
        )
      );
      expect(retryingLog).toBeDefined();

      // Same deliveryId is active in `jobs` -> 409 conflict.
      await expectRejects(redeliverWebhookLog(hook.id, originalLog.id), {
        code: 'hook.redelivery_in_progress',
        status: 409,
      });

      // Retrying log entry itself is not permanently failed -> 422.
      await expectRejects(redeliverWebhookLog(hook.id, retryingLogId), {
        code: 'hook.log_not_permanently_failed',
        status: 422,
      });

      // Only the permanently failed original log is counted in executionStats; the retrying row is excluded.
      const hookWithStats = await authedAdminApi
        .get(`hooks/${hook.id}?includeExecutionStats=true`)
        .json<HookResponse>();
      expect(hookWithStats.executionStats).toEqual({
        requestCount: 1,
        successCount: 0,
      });
    }
  );

  devFeatureTest.it(
    'uses a 48-hour default recent-logs window when neither start_time nor end_time is supplied',
    async () => {
      const hook = webHookApi.hooks.get(hookName)!;
      const withinWindowId = await insertHistoricalHookLog({ hookId: hook.id, hoursAgo: 36 });
      const outsideWindowId = await insertHistoricalHookLog({ hookId: hook.id, hoursAgo: 50 });

      try {
        const logs = await getWebhookRecentLogs(hook.id, new URLSearchParams({ page_size: '50' }));
        expect(logs.some((entry) => entry.id === withinWindowId)).toBe(true);
        expect(logs.some((entry) => entry.id === outsideWindowId)).toBe(false);
      } finally {
        await cleanupLogsByIds([withinWindowId, outsideWindowId]);
      }
    }
  );
});

/* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */
