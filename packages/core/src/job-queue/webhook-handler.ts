import { createExponentialBackoff, defineJobHandler } from '@logto/job-queue';
import { hookEventGuard, LogResult, type HookEvent } from '@logto/schemas';
import { ConsoleLog, normalizeError } from '@logto/shared';
import { conditional, type Nullable, trySafe } from '@silverhand/essentials';
import chalk from 'chalk';
import { HTTPError, type KyResponse } from 'ky';
import { z } from 'zod';

import { parseResponse, sendWebhookRequest } from '#src/libraries/hook/utils.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';
import {
  type CoreJobSettlementMeta,
  type ExpiredJobRow,
  type JobLogUpsert,
  type createJobQueueQueries,
} from '#src/queries/job-queue.js';
import { isRecord } from '#src/utils/type.js';

export const webhookJobType = 'webhook';
export const webhookJobLeaseMs = 60_000;
/** Wall-clock budget for a single delivery attempt (10 s request + 10 s body read), well below `webhookJobLeaseMs`. */
export const webhookDeliveryTimeoutMs = 20_000;
/** Cap on reading a single response body after headers arrive, clamped by remaining delivery time. */
export const webhookBodyReadTimeoutMs = 10_000;
export const webhookPerTenantConcurrency = 20;
export const webhookPerHookConcurrency = 5;
export const webhookRetryBaseMs = 10_000;
export const webhookRetryMaxMs = 4 * 60 * 60 * 1000;
export const webhookRetryMaxAgeMs = 24 * 60 * 60 * 1000;
export const webhookCircuitBreakerFailureThreshold = 5;

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

export const isRetryableWebhookStatus = (status: number): boolean =>
  status === 408 || status === 429 || (status >= 500 && status <= 599);

const getErrorCode = (value: unknown): string | undefined =>
  isRecord(value) && typeof value.code === 'string' ? value.code : undefined;

const isInvalidUrlError = (error: unknown): boolean => {
  if (getErrorCode(error) === 'ERR_INVALID_URL') {
    return true;
  }

  if (error instanceof Error && getErrorCode(error.cause) === 'ERR_INVALID_URL') {
    return true;
  }

  return error instanceof TypeError && error.message.startsWith('Failed to parse URL');
};

/** Classify delivery errors into queued retries vs. permanent failures. */
export const isRetryableWebhookError = (error: unknown): boolean => {
  if (error instanceof HTTPError) {
    return isRetryableWebhookStatus(error.response.status);
  }

  return !isInvalidUrlError(error);
};

/**
 * Parse an HTTP `Retry-After` header (non-negative integer seconds or HTTP-date) into a
 * non-negative delay in milliseconds, capped at {@link webhookRetryMaxMs}.
 */
export const parseRetryAfterMs = (
  headerValue?: Nullable<string>,
  now = Date.now()
): number | undefined => {
  if (!headerValue) {
    return undefined;
  }

  const trimmed = headerValue.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^\d+$/.test(trimmed)) {
    return Math.min(Number(trimmed) * 1000, webhookRetryMaxMs);
  }

  // Guard against V8 accepting non-standard numeric strings such as `-5` or `1.5` in `Date.parse`.
  if (!/[a-z]/i.test(trimmed)) {
    return undefined;
  }

  const parsedAt = Date.parse(trimmed);

  if (!Number.isFinite(parsedAt)) {
    return undefined;
  }

  return Math.min(Math.max(0, parsedAt - now), webhookRetryMaxMs);
};

/**
 * Build the fallback permanently-failed audit log for a queued webhook row that expired while
 * waiting behind an open circuit breaker without having completed a prior attempt.
 */
export const buildExpiredWebhookLog = (row: ExpiredJobRow): JobLogUpsert | undefined => {
  if (row.type !== webhookJobType) {
    return undefined;
  }

  const parsed = trySafe(() => parseWebhookJobPayload(row.payload));

  if (!parsed) {
    return undefined;
  }

  const logEntry = new LogEntry(`TriggerHook.${parsed.event}`);
  logEntry.append({
    hookId: row.groupKey,
    attempts: row.attempts,
    hookRequest: { body: parsed.body },
    result: LogResult.Error,
    error: 'Webhook delivery retry window expired while circuit breaker was open.',
  });

  return { key: logEntry.key, payload: logEntry.payload };
};

type CreateWebhookJobHandlerOptions = {
  deliveryTimeoutMs?: number;
  bodyReadTimeoutMs?: number;
  backoffMs?: (attempt: number) => number;
  maxAgeMs?: number;
  onExhausted?: () => void;
};

/**
 * Create the `webhook` job handler for Core's worker.
 *
 * Reads hook configuration and signing key at execution time via explicit-tenant queries on
 * `EnvSet.sharedPool` so secrets never sit in `jobs.payload` and disabled/deleted hooks stop
 * pending deliveries. Applies a 24-hour exponential retry policy (`10 s` up to `4 h`), honors
 * `Retry-After` up to `4 h`, and enables a 5-failure per-hook circuit breaker.
 */
export const createWebhookJobHandler = (
  queries: Pick<ReturnType<typeof createJobQueueQueries>, 'findHookForDelivery'>,
  options?: CreateWebhookJobHandlerOptions
) => {
  const {
    deliveryTimeoutMs = webhookDeliveryTimeoutMs,
    bodyReadTimeoutMs = webhookBodyReadTimeoutMs,
  } = options ?? {};

  return defineJobHandler<WebhookJobPayload, CoreJobSettlementMeta>({
    type: webhookJobType,
    parsePayload: parseWebhookJobPayload,
    leaseMs: webhookJobLeaseMs,
    limits: {
      perTenantConcurrency: webhookPerTenantConcurrency,
      perGroupConcurrency: webhookPerHookConcurrency,
    },
    circuitBreaker: {
      failureThreshold: webhookCircuitBreakerFailureThreshold,
    },
    retry: {
      backoffMs:
        options?.backoffMs ??
        createExponentialBackoff({
          baseMs: webhookRetryBaseMs,
          maxMs: webhookRetryMaxMs,
        }),
      // Do not set `maxAttempts: 1` here: reclaimed rows (after lease expiry or shutdown hand-back)
      // arrive with `attempts >= 2` and would be dropped before `handle()` runs.
      maxAgeMs: options?.maxAgeMs ?? webhookRetryMaxAgeMs,
    },
    ...conditional(
      options?.onExhausted && {
        onExhausted: () => {
          options.onExhausted?.();
        },
      }
    ),
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
      logEntry.append({
        hookId: job.groupKey,
        attempts: job.attempts,
        hookRequest: { body: job.payload.body },
      });

      const abortController = new AbortController();
      const deadlineAt = Date.now() + deliveryTimeoutMs;
      const deliveryTimer = setTimeout(() => {
        abortController.abort(new Error(`Webhook delivery timed out after ${deliveryTimeoutMs}ms`));
      }, deliveryTimeoutMs);

      const parseBoundedResponse = async (response: KyResponse) => {
        if (abortController.signal.aborted) {
          return parseResponse(response, abortController.signal);
        }

        const remainingMs = deadlineAt - Date.now();
        if (remainingMs <= 0) {
          abortController.abort(
            new Error(`Webhook delivery timed out after ${deliveryTimeoutMs}ms`)
          );
          return parseResponse(response, abortController.signal);
        }

        const bodyTimeoutMs = Math.min(remainingMs, bodyReadTimeoutMs);
        const bodyTimer = setTimeout(() => {
          abortController.abort(
            new Error(`Webhook response body read timed out after ${bodyTimeoutMs}ms`)
          );
        }, bodyTimeoutMs);

        try {
          return await parseResponse(response, abortController.signal);
        } finally {
          clearTimeout(bodyTimer);
        }
      };

      try {
        const response = await sendWebhookRequest({
          hookConfig: hook.config,
          body: job.rawPayload,
          signingKey: hook.signingKey,
          signal: abortController.signal,
          disableRetries: true,
        });

        logEntry.append({
          response: await parseBoundedResponse(response),
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
            error instanceof HTTPError && (await trySafe(parseBoundedResponse(error.response)))
          ),
          error: String(normalizeError(error)),
        });
        consoleLog.info(`\tHook ${job.groupKey} failed`);

        const meta = { log: { key: logEntry.key, payload: logEntry.payload } };

        if (isRetryableWebhookError(error)) {
          const retryAfterMs =
            error instanceof HTTPError
              ? parseRetryAfterMs(error.response.headers.get('retry-after'))
              : undefined;

          return {
            status: 'retry',
            ...conditional(retryAfterMs !== undefined && { retryAfterMs }),
            meta,
          };
        }

        return {
          status: 'fail',
          meta,
        };
      } finally {
        clearTimeout(deliveryTimer);
      }
    },
  });
};
