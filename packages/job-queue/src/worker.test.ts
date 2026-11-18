import { noop } from '@silverhand/essentials';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createExponentialBackoff } from './job-state.js';
import {
  type ClaimedJobRow,
  defineJobHandler,
  type JobQueueQueries,
  type SafeJobPayload,
  type SettleJobInput,
} from './types.js';
import { defaultPollIntervalMs, JobQueueWorker } from './worker.js';

type LogMeta = { logKey: string; statusCode?: number };

const silentLog = { info: noop, warn: noop, error: noop };

const defaultLimits = {
  perGroupConcurrency: 5,
  perTenantConcurrency: 20,
  maxWaitingRowsPerGroup: 10_000,
};

const defaultRetry = {
  backoffMs: createExponentialBackoff({ baseMs: 10_000, maxMs: 60_000 }),
  maxAgeMs: 24 * 60 * 60 * 1000,
};

const buildRow = (overrides: Partial<ClaimedJobRow> = {}): ClaimedJobRow => ({
  tenantId: 't1',
  id: 'job_1',
  type: 'webhook',
  groupKey: 'hook_1',
  dedupeKey: null,
  payload: '{"body":"ok"}',
  attempts: 1,
  nextAttemptAt: 70_000,
  claimedBy: 'worker_1',
  createdAt: 1000,
  ...overrides,
});

const buildQueries = (overrides: Partial<JobQueueQueries<LogMeta>> = {}) => ({
  claimDue: vi.fn<JobQueueQueries<LogMeta>['claimDue']>(async () => []),
  settle: vi.fn<JobQueueQueries<LogMeta>['settle']>(async () => true),
  parkDueGroup: vi.fn<NonNullable<JobQueueQueries<LogMeta>['parkDueGroup']>>(async () => 0),
  releaseClaimed: vi.fn<NonNullable<JobQueueQueries<LogMeta>['releaseClaimed']>>(async () => 0),
  ...overrides,
});

describe('JobQueueWorker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates unique 21-char workerId values via generateStandardId and never uses process.pid', () => {
    const queries = buildQueries();
    const workerA = new JobQueueWorker(queries, { log: silentLog });
    const workerB = new JobQueueWorker(queries, { log: silentLog });

    expect(workerA.workerId).toMatch(/^[\da-z]{21}$/);
    expect(workerB.workerId).toMatch(/^[\da-z]{21}$/);
    expect(workerA.workerId).not.toBe(workerB.workerId);
    expect(workerA.workerId).not.toBe(String(process.pid));
  });

  it('enforces the handler contract rule against secret and mutable config fields in payloads', () => {
    const queries = buildQueries();
    const worker = new JobQueueWorker<LogMeta>(queries, { workerId: 'worker_1', log: silentLog });

    const cleanHandler = defineJobHandler<{ hookId: string; body: string }, LogMeta>({
      type: 'webhook',
      parsePayload: (raw) => JSON.parse(raw) as { hookId: string; body: string },
      leaseMs: 60_000,
      retry: defaultRetry,
      limits: defaultLimits,
      handle: async () => ({ status: 'done' }),
    });
    const stringPayloadHandler = defineJobHandler<string>({
      type: 'raw-string',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry: defaultRetry,
      limits: defaultLimits,
      handle: async () => ({ status: 'done' }),
    });
    const emptyPayloadHandler = defineJobHandler<void>({
      type: 'no-payload',
      parsePayload: noop,
      leaseMs: 60_000,
      retry: defaultRetry,
      limits: defaultLimits,
      handle: async () => ({ status: 'done' }),
    });

    worker.register(cleanHandler);
    worker.register(stringPayloadHandler);
    worker.register(emptyPayloadHandler);

    // @ts-expect-error -- SafeJobPayload evaluates to never when apiKey is present
    const badSafePayload: SafeJobPayload<{ hookId: string; apiKey: string }> = {
      hookId: 'h1',
      apiKey: 'k1',
    };
    const invalidSigningKeyHandler = defineJobHandler<{ hookId: string; signingKey: string }>(
      // @ts-expect-error -- signingKey is forbidden in jobs.payload by SafeJobPayload
      {
        type: 'bad-signing-key',
        parsePayload: () => ({ hookId: 'h1', signingKey: 'sec' }),
        leaseMs: 60_000,
        retry: defaultRetry,
        limits: defaultLimits,
        handle: async () => ({ status: 'done' }),
      }
    );
    const invalidHookConfigHandler = defineJobHandler<{
      hookId: string;
      hookConfig: { url: string };
    }>(
      // @ts-expect-error -- hookConfig is forbidden in jobs.payload by SafeJobPayload
      {
        type: 'bad-hook-config',
        parsePayload: () => ({ hookId: 'h1', hookConfig: { url: 'https://example.com' } }),
        leaseMs: 60_000,
        retry: defaultRetry,
        limits: defaultLimits,
        handle: async () => ({ status: 'done' }),
      }
    );
    const invalidHeadersHandler = defineJobHandler<{
      hookId: string;
      headers: Record<string, string>;
    }>(
      // @ts-expect-error -- headers is forbidden in jobs.payload by SafeJobPayload
      {
        type: 'bad-headers',
        parsePayload: () => ({ hookId: 'h1', headers: { authorization: 'Bearer x' } }),
        leaseMs: 60_000,
        retry: defaultRetry,
        limits: defaultLimits,
        handle: async () => ({ status: 'done' }),
      }
    );
    const invalidUnionHandler = defineJobHandler<{ kind: 'a' } | { kind: 'b'; secret: string }>(
      // @ts-expect-error -- union members containing secret are rejected by SafeJobPayload
      {
        type: 'bad-union',
        parsePayload: () => ({ kind: 'a' }),
        leaseMs: 60_000,
        retry: defaultRetry,
        limits: defaultLimits,
        handle: async () => ({ status: 'done' }),
      }
    );

    // @ts-expect-error -- register rejects inferred Payload containing privateKey
    worker.register({
      type: 'bad-private-key',
      parsePayload: () => ({ id: '1', privateKey: 'pem' }),
      leaseMs: 60_000,
      retry: defaultRetry,
      limits: defaultLimits,
      handle: async () => ({ status: 'done' }),
    });

    expect(badSafePayload).toBeDefined();
    expect(invalidSigningKeyHandler.type).toBe('bad-signing-key');
    expect(invalidHookConfigHandler.type).toBe('bad-hook-config');
    expect(invalidHeadersHandler.type).toBe('bad-headers');
    expect(invalidUnionHandler.type).toBe('bad-union');
  });

  it('skips claimDue when no handlers are registered', async () => {
    const queries = buildQueries();
    const worker = new JobQueueWorker(queries, { workerId: 'worker_1', log: silentLog });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);

    expect(queries.claimDue).not.toHaveBeenCalled();
    await worker.stop();
  });

  it('settles done, retry, fail, and exhausted outcomes with SettlementMeta and fencing', async () => {
    const rowDone = buildRow({ id: 'job_done', payload: '{"step":"done"}' });
    const rowRetry = buildRow({ id: 'job_retry', attempts: 2, payload: '{"step":"retry"}' });
    const rowFail = buildRow({ id: 'job_fail', payload: '{"step":"fail"}' });
    const rowExhausted = buildRow({
      id: 'job_exhausted',
      attempts: 3,
      createdAt: 1000,
      payload: '{"step":"throw"}',
    });
    const rowFenced = buildRow({
      id: 'job_fenced',
      attempts: 3,
      createdAt: 1000,
      payload: '{"step":"throw"}',
    });
    const rowBadJson = buildRow({ id: 'job_bad', payload: '{not-json' });

    const settle = vi.fn(async (input: SettleJobInput<LogMeta>) => input.job.id !== 'job_fenced');
    const queries = buildQueries({
      claimDue: vi
        .fn<JobQueueQueries<LogMeta>['claimDue']>()
        .mockResolvedValueOnce([rowDone, rowRetry, rowFail, rowBadJson])
        .mockResolvedValueOnce([rowExhausted, rowFenced])
        .mockResolvedValue([]),
      settle,
    });

    const onExhausted = vi.fn();
    const handleError = new Error('gateway timeout');
    const worker = new JobQueueWorker<LogMeta>(queries, { workerId: 'worker_1', log: silentLog });
    worker.register<{ step: string }>({
      type: 'webhook',
      parsePayload: (raw) => JSON.parse(raw) as { step: string },
      leaseMs: 60_000,
      retry: {
        backoffMs: defaultRetry.backoffMs,
        maxAgeMs: 20_000,
      },
      limits: defaultLimits,
      handle: async (job) => {
        if (job.payload.step === 'done') {
          expect(job.rawPayload).toBe('{"step":"done"}');
          return { status: 'done', meta: { logKey: 'TriggerHook.PostSignIn', statusCode: 200 } };
        }
        if (job.payload.step === 'retry') {
          return {
            status: 'retry',
            retryAfterMs: 5000,
            meta: { logKey: 'TriggerHook.PostSignIn', statusCode: 429 },
          };
        }
        if (job.payload.step === 'fail') {
          return { status: 'fail', meta: { logKey: 'TriggerHook.PostSignIn', statusCode: 400 } };
        }
        throw handleError;
      },
      onExhausted,
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);

    expect(queries.settle).toHaveBeenCalledWith({
      job: rowDone,
      workerId: 'worker_1',
      resolution: { status: 'done' },
      meta: { logKey: 'TriggerHook.PostSignIn', statusCode: 200 },
    });
    expect(queries.settle).toHaveBeenCalledWith({
      job: rowRetry,
      workerId: 'worker_1',
      resolution: {
        status: 'retry',
        delayMs: 5000,
        nextAttemptAt: 15_000,
        error: undefined,
      },
      meta: { logKey: 'TriggerHook.PostSignIn', statusCode: 429 },
    });
    expect(queries.settle).toHaveBeenCalledWith({
      job: rowFail,
      workerId: 'worker_1',
      resolution: { status: 'fail' },
      meta: { logKey: 'TriggerHook.PostSignIn', statusCode: 400 },
    });
    const badJsonSettleCall = settle.mock.calls.find(([{ job }]) => job.id === 'job_bad')?.[0];
    expect(badJsonSettleCall?.workerId).toBe('worker_1');
    expect(badJsonSettleCall?.resolution.status).toBe('fail');

    // Advance to the next poll tick (15_000), where nextAttemptAt (15_000 + 40_000) exceeds deadline (21_000).
    await vi.advanceTimersByTimeAsync(defaultPollIntervalMs);
    expect(queries.settle).toHaveBeenCalledWith({
      job: rowExhausted,
      workerId: 'worker_1',
      resolution: { status: 'exhausted', error: handleError },
      meta: undefined,
    });
    expect(onExhausted).toHaveBeenCalledTimes(1);
    expect(onExhausted).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'job_exhausted', payload: { step: 'throw' } }),
      handleError
    );

    await worker.stop();
  });

  it('coalesces wake signals during an active claim and polls on the 5s interval', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const firstClaim = Promise.withResolvers<readonly ClaimedJobRow[]>();
    const queries = buildQueries({
      claimDue: vi
        .fn<JobQueueQueries<LogMeta>['claimDue']>()
        .mockImplementationOnce(async () => firstClaim.promise)
        .mockResolvedValue([]),
    });

    const worker = new JobQueueWorker<LogMeta>(queries, { workerId: 'worker_1', log: silentLog });
    worker.register<{ ok: boolean }>({
      type: 'webhook',
      parsePayload: (raw) => JSON.parse(raw) as { ok: boolean },
      leaseMs: 60_000,
      retry: defaultRetry,
      limits: defaultLimits,
      handle: async () => ({ status: 'done' }),
    });

    // Wake before start() is a no-op.
    worker.wake();
    expect(queries.claimDue).not.toHaveBeenCalled();

    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(queries.claimDue).toHaveBeenCalledTimes(1);

    // Multiple local wakes while claimDue is in flight coalesce into 1 follow-up claim.
    worker.wake();
    worker.wake();
    worker.wake();
    firstClaim.resolve([]);
    await vi.advanceTimersByTimeAsync(0);
    expect(queries.claimDue).toHaveBeenCalledTimes(2);

    // Next claim fires on the 5s poll interval.
    await vi.advanceTimersByTimeAsync(defaultPollIntervalMs - 1);
    expect(queries.claimDue).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);
    expect(queries.claimDue).toHaveBeenCalledTimes(3);

    await worker.stop();
    worker.wake();
    await vi.advanceTimersByTimeAsync(defaultPollIntervalMs * 2);
    expect(queries.claimDue).toHaveBeenCalledTimes(3);
  });

  it('survives claimDue errors and releases remaining jobs on shutdown timeout or late claim resolution', async () => {
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const slowJob = Promise.withResolvers<void>();
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- Promise.withResolvers is available in the required Node.js runtime
    const lateClaim = Promise.withResolvers<readonly ClaimedJobRow[]>();

    const row1 = buildRow({ id: 'job_slow' });
    const row2 = buildRow({ id: 'job_late' });
    const queries = buildQueries({
      claimDue: vi
        .fn<JobQueueQueries<LogMeta>['claimDue']>()
        .mockRejectedValueOnce(new Error('transient db failure'))
        .mockResolvedValueOnce([row1])
        .mockImplementationOnce(async () => lateClaim.promise),
    });

    const handle = vi.fn(async () => {
      await slowJob.promise;
      return { status: 'done' as const };
    });

    const worker = new JobQueueWorker<LogMeta>(queries, { workerId: 'worker_1', log: silentLog });
    worker.register<string>({
      type: 'webhook',
      parsePayload: (raw) => raw,
      leaseMs: 60_000,
      retry: defaultRetry,
      limits: defaultLimits,
      handle,
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(queries.claimDue).toHaveBeenCalledTimes(1);

    // Recovers on next 5s poll tick and claims row1.
    await vi.advanceTimersByTimeAsync(defaultPollIntervalMs);
    expect(queries.claimDue).toHaveBeenCalledTimes(2);
    expect(worker.inFlightCount).toBe(1);

    // Shutdown times out after 4s while row1 is still in flight -> releases row1 in batch.
    const stopPromise = worker.stop({ drainTimeoutMs: 4000 });
    await vi.advanceTimersByTimeAsync(4000);
    const stopResult = await stopPromise;

    expect(stopResult).toEqual({ drained: false, releasedCount: 1 });
    expect(queries.releaseClaimed).toHaveBeenCalledExactlyOnceWith({
      workerId: 'worker_1',
      jobs: [row1],
    });

    slowJob.resolve();
    await vi.advanceTimersByTimeAsync(0);

    // Restart and test late claim resolution arriving after stop() starts.
    worker.start();
    await vi.advanceTimersByTimeAsync(0);
    const secondStop = worker.stop();
    lateClaim.resolve([row2]);
    const secondStopResult = await secondStop;

    expect(secondStopResult).toEqual({ drained: true, releasedCount: 1 });
    expect(handle).toHaveBeenCalledTimes(1);
    expect(queries.releaseClaimed).toHaveBeenLastCalledWith({
      workerId: 'worker_1',
      jobs: [row2],
    });
  });
});
