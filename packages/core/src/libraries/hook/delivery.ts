import { LogResult, type BetterOmit, type Hook, type HookEventPayload } from '@logto/schemas';
import { generateStandardId, normalizeError, type ConsoleLog } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import pMap from 'p-map';

import { EnvSet } from '#src/env-set/index.js';
import { type CoreJobQueue } from '#src/job-queue/index.js';
import { webhookJobType } from '#src/job-queue/webhook-handler.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';
import type Queries from '#src/tenants/Queries.js';

import { parseResponse, sendWebhookRequest } from './utils.js';

/** A payload before `sendWebhook` stamps it with the hook id and the delivery id. */
type HookEventPayloadWithoutHookId = BetterOmit<HookEventPayload, 'hookId' | 'deliveryId'>;

export type TenantRequestSlot = {
  retainRequestSlot: () => boolean;
  releaseRequestSlot: () => void;
};

type CreateWebhookDispatcherInput = {
  insertLog: Queries['logs']['insertLog'];
  enqueueJob: Queries['jobs']['enqueueJob'];
  queue: CoreJobQueue;
  requestSlot?: TenantRequestSlot;
};

/**
 * Create the webhook delivery and job-queue enqueue dispatcher used by {@link createHookLibrary}.
 */
export const createWebhookDispatcher = ({
  insertLog,
  enqueueJob,
  queue,
  requestSlot,
}: CreateWebhookDispatcherInput) => {
  const sendWebhook = async (
    hook: Hook,
    payload: HookEventPayloadWithoutHookId,
    consoleLog: ConsoleLog
  ) => {
    const { id, config, signingKey } = hook;
    consoleLog.info(`\tTriggering hook ${id} due to ${payload.event} event`);

    // One delivery = one request (ky retries included) = one audit log entry: the same id for both.
    const deliveryId = generateStandardId();
    const json: HookEventPayload = { ...payload, hookId: id, deliveryId };
    const logEntry = new LogEntry(`TriggerHook.${payload.event}`);

    logEntry.append({ hookId: id, hookRequest: { body: json } });

    try {
      const response = await sendWebhookRequest({
        hookConfig: config,
        payload: json,
        signingKey,
      });

      logEntry.append({
        response: await parseResponse(response),
      });
    } catch (error: unknown) {
      logEntry.append({
        result: LogResult.Error,
        response: conditional(error instanceof HTTPError && (await parseResponse(error.response))),
        error: String(normalizeError(error)),
      });
    }

    consoleLog.info(
      `\tHook ${id} ${logEntry.payload.result === LogResult.Success ? 'succeeded' : 'failed'}`
    );

    await insertLog({
      id: deliveryId,
      key: logEntry.key,
      payload: logEntry.payload,
    });
  };

  const enqueueWebhook = async (
    hook: Hook,
    payload: HookEventPayloadWithoutHookId,
    consoleLog: ConsoleLog
  ) => {
    const { id } = hook;
    consoleLog.info(`\tEnqueueing hook ${id} due to ${payload.event} event`);

    const deliveryId = generateStandardId();
    const json: HookEventPayload = { ...payload, hookId: id, deliveryId };
    // Pre-serialize once so `jobs.payload` preserves the exact JSON key order for HMAC signing.
    const serializedBody = JSON.stringify(json);

    await queue.enqueue(async () =>
      enqueueJob({
        id: deliveryId,
        type: webhookJobType,
        groupKey: id,
        dedupeKey: deliveryId,
        payload: serializedBody,
      })
    );
  };

  const dispatchWebhooks = async <T extends HookEventPayloadWithoutHookId>(
    webhooks: Array<{ hook: Hook; payload: T }>,
    consoleLog: ConsoleLog,
    useJobQueue: boolean
  ) => {
    if (webhooks.length === 0) {
      return;
    }

    await pMap(
      webhooks,
      async ({ hook, payload }) =>
        useJobQueue
          ? enqueueWebhook(hook, payload, consoleLog)
          : sendWebhook(hook, payload, consoleLog),
      { concurrency: 10 }
    );
  };

  /**
   * Hold a tenant request slot and register the full fire-and-forget enqueue workflow in
   * `CoreJobQueue` before any `await`, so tenant eviction and graceful shutdown wait for both
   * pre-insert lookups and `enqueueJob` calls.
   */
  const runWithTriggerLifecycle = async (task: (useJobQueue: boolean) => Promise<void>) => {
    // Durable job queue: enqueue webhook deliveries instead of sending inline when dev features are enabled.
    const useJobQueue = EnvSet.values.isDevFeaturesEnabled;

    if (!useJobQueue) {
      await task(false);
      return;
    }

    if (requestSlot && !requestSlot.retainRequestSlot()) {
      queue.recordFailedEnqueue(
        new Error('Skipped webhook enqueue because the tenant database pool is closing.')
      );
      return;
    }

    await queue.trackEnqueue(async () => {
      try {
        await task(true);
      } finally {
        requestSlot?.releaseRequestSlot();
      }
    });
  };

  return { dispatchWebhooks, runWithTriggerLifecycle };
};
