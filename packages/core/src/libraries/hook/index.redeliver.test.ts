import { InteractionHookEvent, LogResult, type Hook, type Log } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import { UniqueIntegrityConstraintViolationError } from '@silverhand/slonik';

import RequestError from '#src/errors/RequestError/index.js';
import { CoreJobQueue } from '#src/job-queue/index.js';
import {
  serializeWebhookRedeliveryJobPayload,
  webhookJobType,
} from '#src/job-queue/webhook-handler.js';
import type Queries from '#src/tenants/Queries.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

await mockIdGenerators();

await mockEsmWithActual('./utils.js', () => ({}));

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createHookLibrary } = await import('./index.js');

const makeHook = (overrides?: Partial<Hook>): Hook => ({
  tenantId: 'tenant-1',
  id: 'hook-1',
  name: 'hook-1',
  event: null,
  events: [InteractionHookEvent.PostSignIn],
  signingKey: 'signing-key-1',
  enabled: true,
  config: { url: 'https://example.com/hook' },
  createdAt: 1_700_000_000_000,
  ...overrides,
});

const requestBody = {
  event: InteractionHookEvent.PostSignIn,
  createdAt: '2026-11-20T00:00:00.000Z',
  hookId: 'hook-1',
  deliveryId: 'delivery-1',
  userId: 'user-1',
};

const makeLog = (overrides?: Partial<Log>): Log => ({
  tenantId: 'tenant-1',
  id: 'delivery-1',
  key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
  payloadHookId: 'hook-1',
  payloadUserId: 'user-1',
  payloadApplicationId: null,
  createdAt: 1_700_000_000_000,
  payload: {
    key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
    result: LogResult.Error,
    hookId: 'hook-1',
    hookRequest: { body: requestBody },
    error: 'HTTP 500',
  },
  ...overrides,
});

describe('createHookLibrary redeliverHookLog', () => {
  const findHookById = jest.fn<Promise<Hook>, [id: string]>();
  const findLogById = jest.fn<Promise<Log>, [id: string]>();
  const enqueueJob = jest.fn<Promise<void>, Parameters<Queries['jobs']['enqueueJob']>>();

  const setup = () => {
    const queue = new CoreJobQueue();
    const wake = jest.spyOn(queue, 'wake');
    const queries = new MockQueries({
      hooks: { findHookById },
      logs: { findLogById },
      jobs: { enqueueJob },
    });

    return {
      queue,
      wake,
      library: createHookLibrary(queries, { jobQueue: queue }),
    };
  };

  beforeEach(() => {
    findHookById.mockReset().mockResolvedValue(makeHook());
    findLogById.mockReset().mockResolvedValue(makeLog());
    enqueueJob.mockReset().mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('enqueues a redelivery job keeping deliveryId and linking redeliveredFrom', async () => {
    const { library, wake } = setup();

    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).resolves.toEqual({
      logId: mockId,
    });

    expect(enqueueJob).toHaveBeenCalledTimes(1);
    const enqueued = enqueueJob.mock.calls[0]?.[0];
    expect(enqueued).toMatchObject({
      id: mockId,
      type: webhookJobType,
      groupKey: 'hook-1',
      dedupeKey: 'delivery-1',
    });
    const envelope = JSON.parse(enqueued?.payload ?? '') as {
      rawBody: string;
      redeliveredFrom: string;
    };
    expect(envelope.redeliveredFrom).toBe('delivery-1');
    expect(JSON.parse(envelope.rawBody)).toEqual(requestBody);
    expect(wake).toHaveBeenCalledTimes(1);
  });

  it('falls back to log.id as dedupeKey for legacy logs without body.deliveryId without mutating body', async () => {
    const legacyBody = {
      event: InteractionHookEvent.PostSignIn,
      createdAt: '2026-11-20T00:00:00.000Z',
      hookId: 'hook-1',
      userId: 'user-1',
    };
    findLogById.mockResolvedValueOnce(
      makeLog({
        id: 'legacy-log-1',
        payload: {
          key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
          result: LogResult.Error,
          hookId: 'hook-1',
          hookRequest: { body: legacyBody },
        },
      })
    );

    const { library } = setup();
    await expect(library.redeliverHookLog('hook-1', 'legacy-log-1')).resolves.toEqual({
      logId: mockId,
    });

    expect(enqueueJob).toHaveBeenCalledWith({
      id: mockId,
      type: webhookJobType,
      groupKey: 'hook-1',
      dedupeKey: 'legacy-log-1',
      payload: serializeWebhookRedeliveryJobPayload({
        rawBody: JSON.stringify(legacyBody),
        redeliveredFrom: 'legacy-log-1',
      }),
    });
  });

  it('propagates hook or log not found errors', async () => {
    const { library, wake } = setup();

    findHookById.mockRejectedValueOnce(
      new RequestError({ code: 'entity.not_exists_with_id', status: 404 })
    );
    await expect(library.redeliverHookLog('missing-hook', 'delivery-1')).rejects.toMatchObject({
      code: 'entity.not_exists_with_id',
      status: 404,
    });

    findLogById.mockRejectedValueOnce(
      new RequestError({ code: 'entity.not_exists_with_id', status: 404 })
    );
    await expect(library.redeliverHookLog('hook-1', 'missing-log')).rejects.toMatchObject({
      code: 'entity.not_exists_with_id',
      status: 404,
    });

    expect(enqueueJob).not.toHaveBeenCalled();
    expect(wake).not.toHaveBeenCalled();
  });

  it('rejects disabled hooks with 422 hook.disabled', async () => {
    findHookById.mockResolvedValueOnce(makeHook({ enabled: false }));
    const { library, wake } = setup();

    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject(
      new RequestError({ code: 'hook.disabled', status: 422 })
    );
    expect(findLogById).not.toHaveBeenCalled();
    expect(enqueueJob).not.toHaveBeenCalled();
    expect(wake).not.toHaveBeenCalled();
  });

  it('rejects logs belonging to another hook or lacking TriggerHook prefix with 404', async () => {
    const { library } = setup();

    findLogById.mockResolvedValueOnce(makeLog({ payloadHookId: 'other-hook' }));
    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject({
      code: 'entity.not_exists_with_id',
      status: 404,
    });

    findLogById.mockResolvedValueOnce(makeLog({ key: 'Interaction.SignIn.Submit' }));
    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject({
      code: 'entity.not_exists_with_id',
      status: 404,
    });

    expect(enqueueJob).not.toHaveBeenCalled();
  });

  it('rejects succeeded or retrying logs with 422 hook.log_not_permanently_failed', async () => {
    const { library } = setup();

    findLogById.mockResolvedValueOnce(
      makeLog({
        payload: {
          key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
          result: LogResult.Success,
          hookRequest: { body: requestBody },
        },
      })
    );
    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject({
      code: 'hook.log_not_permanently_failed',
      status: 422,
    });

    findLogById.mockResolvedValueOnce(
      makeLog({
        payload: {
          key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
          result: LogResult.Error,
          nextAttemptAt: Date.now() + 10_000,
          hookRequest: { body: requestBody },
        },
      })
    );
    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject({
      code: 'hook.log_not_permanently_failed',
      status: 422,
    });

    expect(enqueueJob).not.toHaveBeenCalled();
  });

  it('rejects logs with missing or invalid hookRequest.body with 422 hook.invalid_log_payload', async () => {
    const { library } = setup();

    findLogById.mockResolvedValueOnce(
      makeLog({
        payload: {
          key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
          result: LogResult.Error,
        },
      })
    );
    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject({
      code: 'hook.invalid_log_payload',
      status: 422,
    });

    findLogById.mockResolvedValueOnce(
      makeLog({
        payload: {
          key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
          result: LogResult.Error,
          hookRequest: { body: { event: 'Unknown.Event', deliveryId: 'delivery-1' } },
        },
      })
    );
    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject({
      code: 'hook.invalid_log_payload',
      status: 422,
    });

    findLogById.mockResolvedValueOnce(
      makeLog({
        payload: {
          key: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
          result: LogResult.Error,
          hookRequest: { body: { event: InteractionHookEvent.PostSignIn, deliveryId: '' } },
        },
      })
    );
    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject({
      code: 'hook.invalid_log_payload',
      status: 422,
    });

    expect(enqueueJob).not.toHaveBeenCalled();
  });

  it('maps jobs__type_dedupe_key unique constraint violation to 409 and skips wake', async () => {
    enqueueJob.mockRejectedValueOnce(
      new UniqueIntegrityConstraintViolationError(new Error('duplicate'), 'jobs__type_dedupe_key')
    );

    const { library, wake } = setup();

    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toMatchObject({
      code: 'hook.redelivery_in_progress',
      status: 409,
    });
    expect(wake).not.toHaveBeenCalled();
  });

  it('rethrows unexpected database errors on enqueue without waking', async () => {
    enqueueJob.mockRejectedValueOnce(new Error('connection lost'));

    const { library, wake } = setup();

    await expect(library.redeliverHookLog('hook-1', 'delivery-1')).rejects.toThrow(
      'connection lost'
    );
    expect(wake).not.toHaveBeenCalled();
  });
});
