import { createExponentialBackoff, defineJobHandler } from '@logto/job-queue';
import { hookEventGuard, LogResult, type HookEvent } from '@logto/schemas';
import { ConsoleLog, normalizeError } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';
import chalk from 'chalk';
import { HTTPError } from 'ky';
import { z } from 'zod';

import { parseResponse, sendWebhookRequest } from '#src/libraries/hook/utils.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';
import { type CoreJobSettlementMeta, type createJobQueueQueries } from '#src/queries/job-queue.js';

export const webhookJobType = 'webhook';
export const webhookJobLeaseMs = 60_000;
export const webhookPerTenantConcurrency = 20;
export const webhookPerHookConcurrency = 5;

const consoleLog = new ConsoleLog(chalk.magenta('webhook-job'));

export type WebhookJobPayload = {
  event: HookEvent;
  body: Record<string, unknown>;
};

const webhookJobBodyGuard = z
  .object({
    event: hookEventGuard,
  })
  .passthrough();

/** Parse the pre-serialized webhook request body stored in `jobs.payload`. */
export const parseWebhookJobPayload = (raw: string): WebhookJobPayload => {
  const parsed: unknown = JSON.parse(raw);
  const body = webhookJobBodyGuard.parse(parsed);
  return { event: body.event, body };
};

/**
 * Create the `webhook` job handler for Core's worker.
 *
 * Reads hook configuration and signing key at execution time via explicit-tenant queries on
 * `EnvSet.sharedPool` so secrets never sit in `jobs.payload` and disabled/deleted hooks stop
 * pending deliveries. M1 keeps the existing in-call 5xx retry behavior and settles in one attempt.
 */
export const createWebhookJobHandler = (
  queries: Pick<ReturnType<typeof createJobQueueQueries>, 'findHookForDelivery'>
) =>
  defineJobHandler<WebhookJobPayload, CoreJobSettlementMeta>({
    type: webhookJobType,
    parsePayload: parseWebhookJobPayload,
    leaseMs: webhookJobLeaseMs,
    limits: {
      perTenantConcurrency: webhookPerTenantConcurrency,
      perGroupConcurrency: webhookPerHookConcurrency,
    },
    retry: {
      backoffMs: createExponentialBackoff({
        baseMs: 10_000,
        maxMs: 4 * 60 * 60 * 1000,
      }),
      // Do not set `maxAttempts: 1` here: reclaimed rows (after lease expiry or shutdown hand-back)
      // arrive with `attempts >= 2` and would be dropped before `handle()` runs.
      maxAgeMs: 24 * 60 * 60 * 1000,
    },
    handle: async (job) => {
      if (!job.tenantId) {
        consoleLog.error(`Webhook job ${job.id} is missing tenantId.`);
        return { status: 'fail' };
      }

      const hook = await queries.findHookForDelivery(job.tenantId, job.groupKey);

      if (!hook?.enabled) {
        return { status: 'done' };
      }

      consoleLog.info(`\tTriggering hook ${job.groupKey} due to ${job.payload.event} event`);

      const logEntry = new LogEntry(`TriggerHook.${job.payload.event}`);
      logEntry.append({ hookId: job.groupKey, hookRequest: { body: job.payload.body } });

      try {
        const response = await sendWebhookRequest({
          hookConfig: hook.config,
          body: job.rawPayload,
          signingKey: hook.signingKey,
        });

        logEntry.append({
          response: await parseResponse(response),
        });
        consoleLog.info(`\tHook ${job.groupKey} succeeded`);

        return {
          status: 'done',
          meta: { log: { key: logEntry.key, payload: logEntry.payload } },
        };
      } catch (error: unknown) {
        logEntry.append({
          result: LogResult.Error,
          response: conditional(
            error instanceof HTTPError && (await trySafe(parseResponse(error.response)))
          ),
          error: String(normalizeError(error)),
        });
        consoleLog.info(`\tHook ${job.groupKey} failed`);

        return {
          status: 'fail',
          meta: { log: { key: logEntry.key, payload: logEntry.payload } },
        };
      }
    },
  });
