import { type ConsoleLog } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';

import { type GroupCircuitBreakerTracker } from './circuit-breaker.js';
import { type ConcurrencyHandlerInfo } from './concurrency-tracker.js';
import { resolveRetryDecision } from './job-state.js';
import {
  type ClaimedJob,
  type ClaimedJobRow,
  type JobHandler,
  type JobQueueQueries,
  type JobRetryPolicy,
  type SettleResolution,
} from './types.js';

export type ExecutionOutcome<SettlementMeta> = {
  resolution: SettleResolution;
  meta?: SettlementMeta;
  parseFailed?: boolean;
  retryAfterMs?: number;
  onExhausted?: (error?: unknown) => void | Promise<void>;
};

export type RegisteredJobHandler<SettlementMeta> = ConcurrencyHandlerInfo & {
  retry: JobRetryPolicy;
  execute: (row: ClaimedJobRow, getNow: () => number) => Promise<ExecutionOutcome<SettlementMeta>>;
};

const tryParseJobPayload = <Payload>(
  parsePayload: (raw: string) => Payload,
  raw: string
): { ok: true; value: Payload } | { ok: false; error: unknown } => {
  try {
    return { ok: true, value: parsePayload(raw) };
  } catch (error: unknown) {
    return { ok: false, error };
  }
};

const buildRetryOutcome = <SettlementMeta>({
  row,
  retry,
  now,
  retryAfterMs,
  error,
  meta,
  onExhausted,
}: {
  row: ClaimedJobRow;
  retry: JobRetryPolicy;
  now: number;
  retryAfterMs?: number;
  error?: unknown;
  meta?: SettlementMeta;
  onExhausted?: (error?: unknown) => void | Promise<void>;
}): ExecutionOutcome<SettlementMeta> => {
  const decision = resolveRetryDecision({
    attempt: row.attempts,
    createdAt: row.createdAt,
    now,
    retry,
    retryAfterMs,
  });

  if (decision.status === 'exhausted') {
    return {
      resolution: { status: 'exhausted', error },
      meta,
      retryAfterMs,
      onExhausted,
    };
  }

  return {
    resolution: {
      status: 'retry',
      delayMs: decision.delayMs,
      nextAttemptAt: decision.nextAttemptAt,
      error,
    },
    meta,
    retryAfterMs,
  };
};

export const executeRegisteredHandler = async <Payload, SettlementMeta>(
  handler: JobHandler<Payload, SettlementMeta>,
  row: ClaimedJobRow,
  getNow: () => number
): Promise<ExecutionOutcome<SettlementMeta>> => {
  const parsed = tryParseJobPayload(handler.parsePayload, row.payload);

  if (!parsed.ok) {
    return {
      resolution: { status: 'fail', error: parsed.error },
      parseFailed: true,
    };
  }

  const claimedJob: ClaimedJob<Payload> = {
    tenantId: row.tenantId,
    id: row.id,
    type: row.type,
    groupKey: row.groupKey,
    dedupeKey: row.dedupeKey,
    rawPayload: row.payload,
    payload: parsed.value,
    attempts: row.attempts,
    nextAttemptAt: row.nextAttemptAt,
    claimedBy: row.claimedBy,
    createdAt: row.createdAt,
  };

  const onExhausted =
    handler.onExhausted &&
    (async (error?: unknown) => {
      await handler.onExhausted?.(claimedJob, error);
    });

  try {
    const result = await handler.handle(claimedJob);

    if (result.status === 'done') {
      return { resolution: { status: 'done' }, meta: result.meta };
    }

    if (result.status === 'fail') {
      return { resolution: { status: 'fail' }, meta: result.meta };
    }

    return buildRetryOutcome({
      row,
      retry: handler.retry,
      now: getNow(),
      retryAfterMs: result.retryAfterMs,
      meta: result.meta,
      onExhausted,
    });
  } catch (error: unknown) {
    return buildRetryOutcome({
      row,
      retry: handler.retry,
      now: getNow(),
      error,
      onExhausted,
    });
  }
};

const updateCircuitBreakerAfterSettle = async <SettlementMeta>({
  row,
  handler,
  outcome,
  circuitBreaker,
  queries,
  log,
  now,
}: {
  row: ClaimedJobRow;
  handler: RegisteredJobHandler<SettlementMeta>;
  outcome: ExecutionOutcome<SettlementMeta>;
  circuitBreaker: GroupCircuitBreakerTracker;
  queries: JobQueueQueries<SettlementMeta>;
  log: Pick<ConsoleLog, 'error'>;
  now: number;
}): Promise<boolean> => {
  if (outcome.parseFailed === true || !handler.circuitBreaker) {
    return false;
  }

  if (outcome.resolution.status === 'done') {
    return circuitBreaker.recordSuccess(row);
  }

  const { shouldPark, nextAttemptAt } = circuitBreaker.recordFailure({
    job: row,
    threshold: handler.circuitBreaker.failureThreshold,
    backoffMs: handler.retry.backoffMs,
    maxAgeMs: handler.retry.maxAgeMs,
    retryAfterMs: outcome.retryAfterMs,
    now,
  });

  if (shouldPark && queries.parkDueGroup) {
    const { parkDueGroup } = queries;
    const minCreatedAt =
      handler.retry.maxAgeMs !== undefined && Number.isFinite(handler.retry.maxAgeMs)
        ? Math.max(0, now - handler.retry.maxAgeMs)
        : 0;

    await trySafe(
      async () =>
        parkDueGroup({
          tenantId: row.tenantId,
          type: row.type,
          groupKey: row.groupKey,
          nextAttemptAt,
          minCreatedAt,
        }),
      (error) => {
        log.error(
          `Failed to park due jobs for ${row.tenantId ?? '<global>'}/${row.type}/${row.groupKey}.`
        );
        log.error(error);
      }
    );
  }

  return false;
};

/** Run handler execution, fenced settlement, circuit-breaker updates, and exhaustion hooks. */
export const runAndSettleJob = async <SettlementMeta>({
  row,
  handler,
  workerId,
  queries,
  circuitBreaker,
  log,
  getNow,
}: {
  row: ClaimedJobRow;
  handler: RegisteredJobHandler<SettlementMeta>;
  workerId: string;
  queries: JobQueueQueries<SettlementMeta>;
  circuitBreaker: GroupCircuitBreakerTracker;
  log: Pick<ConsoleLog, 'warn' | 'error'>;
  getNow: () => number;
}): Promise<{ shouldWake: boolean }> => {
  try {
    const outcome = await handler.execute(row, getNow);

    if (outcome.parseFailed && outcome.resolution.status === 'fail') {
      log.error(`Failed to parse payload for job ${row.type}/${row.id}.`);
      log.error(outcome.resolution.error);
    }

    const settleOutcome = await trySafe(
      async () =>
        queries.settle({
          job: row,
          workerId,
          resolution: outcome.resolution,
          meta: outcome.meta,
        }),
      (databaseError) => {
        log.error(`Failed to settle job ${row.type}/${row.id}; lease will reclaim it.`);
        log.error(databaseError);
      }
    );

    if (settleOutcome === 'stale') {
      log.warn(`Lost lease while settling job ${row.type}/${row.id} (attempt ${row.attempts}).`);
      return { shouldWake: false };
    }

    const closedCircuit = await updateCircuitBreakerAfterSettle({
      row,
      handler,
      outcome,
      circuitBreaker,
      queries,
      log,
      now: getNow(),
    });

    if (settleOutcome === 'settled' && outcome.resolution.status === 'exhausted') {
      const { error } = outcome.resolution;
      await trySafe(
        async () => outcome.onExhausted?.(error),
        (hookError) => {
          log.error(`onExhausted hook threw for job ${row.type}/${row.id}.`);
          log.error(hookError);
        }
      );
    }

    return { shouldWake: closedCircuit || settleOutcome === 'rearmed' };
  } catch (error: unknown) {
    log.error(`Unexpected error executing job ${row.type}/${row.id}.`);
    log.error(error);
    return { shouldWake: false };
  }
};
