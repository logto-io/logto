import { appInsights } from '@logto/app-insights/node';
import {
  InteractionEvent,
  InteractionHookEvent,
  LogResult,
  type Hook,
  type HookEvent,
} from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';

import { CoreJobQueue, jobQueueMetricNames } from '#src/job-queue/index.js';
import { webhookJobType } from '#src/job-queue/webhook-handler.js';
import type Queries from '#src/tenants/Queries.js';
import { resetDevFeaturesEnabled, setDevFeaturesEnabled } from '#src/test-utils/dev-features.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';

import { generateHookTestPayload, parseResponse } from './utils.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

await mockIdGenerators();

mockEsm('#src/utils/sign.js', () => ({
  sign: () => 'mockSignature',
}));

const { sendWebhookRequest } = await mockEsmWithActual('./utils.js', () => ({
  sendWebhookRequest: jest
    .fn()
    .mockResolvedValue({ status: 200, text: async () => '{"message":"ok"}' }),
  generateHookTestPayload,
  parseResponse,
}));

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createHookLibrary } = await import('./index.js');
const { HookContextManager, InteractionHookContextManager } = await import('./context-manager.js');

const makeHook = (id: string, events: HookEvent[]): Hook => ({
  tenantId: 'tenant-1',
  id,
  name: `hook-${id}`,
  event: null,
  events,
  signingKey: `secret-signing-key-${id}`,
  enabled: true,
  config: {
    url: `https://${id}.example.com/webhook`,
    headers: { authorization: 'Bearer top-secret' },
  },
  createdAt: Date.now() / 1000,
});

describe('createHookLibrary job queue integration', () => {
  const originalClient = appInsights.client;
  const trackMetric = jest.fn();

  const findAllHooks = jest.fn();
  const findHookById = jest.fn();
  const findApplicationById = jest.fn();
  const findUserById = jest.fn();
  const insertLog = jest.fn();
  const enqueueJob = jest.fn<Promise<void>, Parameters<Queries['jobs']['enqueueJob']>>();

  const retainRequestSlot = jest.fn<boolean, never[]>();
  const releaseRequestSlot = jest.fn<void, never[]>();

  const setup = () => {
    const queue = new CoreJobQueue();
    const queries = new MockQueries({
      hooks: { findAllHooks, findHookById },
      applications: { findApplicationById },
      users: { findUserById },
      logs: { insertLog },
      jobs: { enqueueJob },
    });

    return {
      queue,
      library: createHookLibrary(queries, {
        jobQueue: queue,
        requestSlot: { retainRequestSlot, releaseRequestSlot },
      }),
    };
  };

  beforeEach(() => {
    setDevFeaturesEnabled(true);
    retainRequestSlot.mockReturnValue(true);
    findApplicationById.mockResolvedValue({ id: 'app-1', name: 'App 1' });
    findUserById.mockResolvedValue({ id: 'user-1', username: 'alice' });
    // eslint-disable-next-line @silverhand/fp/no-mutation -- stub the shared client
    appInsights.client = { trackMetric } as unknown as NonNullable<typeof appInsights.client>;
  });

  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- restore the shared client
    appInsights.client = originalClient;
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => {
    resetDevFeaturesEnabled();
  });

  it('enqueues data, exception, interaction, and OIDC events without sending inline', async () => {
    const dataHook = makeHook('hook-data', ['Role.Created']);
    const exceptionHook = makeHook('hook-exception', ['Identifier.Lockout']);
    const interactionHook = makeHook('hook-interaction', [InteractionHookEvent.PostSignIn]);
    const grantHook = makeHook('hook-grant', ['Grant.LimitExceeded']);
    findAllHooks.mockResolvedValue([dataHook, exceptionHook, interactionHook, grantHook]);

    const { library } = setup();

    // 1. Data hook (with non-lexicographic custom key order to verify pre-serialized preservation)
    const dataContext = new HookContextManager({ ip: '1.2.3.4', userAgent: 'ua' });
    dataContext.appendDataHookContext('Role.Created', {
      path: '/roles',
      method: 'POST',
      zKey: 'first',
      aKey: 'second',
    });
    await library.triggerDataHooks(new ConsoleLog(), dataContext);

    // 2. Exception hook
    const exceptionContext = new HookContextManager({ ip: '1.2.3.4', userAgent: 'ua' });
    exceptionContext.appendExceptionHookContext('Identifier.Lockout', {
      data: { identifier: 'alice' },
    });
    await library.triggerExceptionHooks(new ConsoleLog(), exceptionContext);

    // 3. Interaction hook
    const interactionContext = new InteractionHookContextManager({
      interactionEvent: InteractionEvent.SignIn,
      applicationId: 'app-1',
      sessionId: 'session-1',
      userIp: '1.2.3.4',
      userAgent: 'ua',
    });
    interactionContext.assignReleaseOnSuccessInteractionHookResult({ userId: 'user-1' });
    await library.triggerInteractionHooks(
      new ConsoleLog(),
      interactionContext.getReleaseOnSuccessDispatchContext()
    );

    // 4. OIDC triggerEvent
    await library.triggerEvent(
      new ConsoleLog(),
      'Grant.LimitExceeded',
      {
        userId: 'user-1',
        applicationId: 'app-1',
        revokedGrantIds: ['grant-1'],
        maxAllowedGrants: 1,
        preRevocationActiveGrantCount: 2,
      },
      { ip: '1.2.3.4', userAgent: 'ua' }
    );

    expect(sendWebhookRequest).not.toHaveBeenCalled();
    expect(insertLog).not.toHaveBeenCalled();
    expect(enqueueJob).toHaveBeenCalledTimes(4);

    const rows = enqueueJob.mock.calls.map(([row]) => row);

    expect(rows.map(({ groupKey }) => groupKey)).toEqual([
      'hook-data',
      'hook-exception',
      'hook-interaction',
      'hook-grant',
    ]);

    for (const row of rows) {
      expect(row.type).toBe(webhookJobType);
      expect(row.id).toBe(mockId);
      expect(row.dedupeKey).toBe(mockId);

      const parsed = JSON.parse(row.payload ?? '') as Record<string, unknown>;
      expect(parsed.deliveryId).toBe(row.id);
      expect(parsed.hookId).toBe(row.groupKey);
      expect(parsed).not.toHaveProperty('signingKey');
      expect(parsed).not.toHaveProperty('config');
      expect(parsed).not.toHaveProperty('headers');
      expect(parsed).not.toHaveProperty('url');
    }

    // Verify exact JSON key order is preserved in the stored text payload.
    expect(rows[0]!.payload!.indexOf('"zKey"')).toBeLessThan(rows[0]!.payload!.indexOf('"aKey"'));
    expect(retainRequestSlot).toHaveBeenCalledTimes(4);
    expect(releaseRequestSlot).toHaveBeenCalledTimes(4);
  });

  it('keeps triggerTestHook synchronous even when dev features are enabled', async () => {
    const testHook = makeHook('hook-test', [InteractionHookEvent.PostSignIn]);
    findHookById.mockResolvedValueOnce(testHook);

    const { library } = setup();
    await library.triggerTestHook(testHook.id, [InteractionHookEvent.PostSignIn], testHook.config);

    expect(sendWebhookRequest).toHaveBeenCalledTimes(1);
    expect(enqueueJob).not.toHaveBeenCalled();
    expect(retainRequestSlot).not.toHaveBeenCalled();
  });

  it('retains a request slot synchronously before awaiting hooks and releases it on error', async () => {
    const recordEvent = jest.fn();
    // eslint-disable-next-line @silverhand/fp/no-let
    let resolveHooks: ((hooks: Hook[]) => void) | undefined;

    retainRequestSlot.mockImplementation(() => {
      recordEvent('retain');
      return true;
    });
    releaseRequestSlot.mockImplementation(() => {
      recordEvent('release');
    });
    findAllHooks.mockImplementationOnce(
      async () =>
        new Promise<Hook[]>((resolve) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          resolveHooks = resolve;
        })
    );

    const { queue, library } = setup();
    const dataContext = new HookContextManager({ ip: '1.2.3.4' });
    dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });

    const pending = library.triggerDataHooks(new ConsoleLog(), dataContext);
    expect(recordEvent.mock.calls).toEqual([['retain']]);

    // Force an error after retainRequestSlot succeeded to verify releaseRequestSlot runs in finally.
    findAllHooks.mockRejectedValueOnce(new Error('db read error'));
    const failedPending = library.triggerDataHooks(new ConsoleLog(), dataContext);

    resolveHooks?.([]);
    await Promise.all([pending, failedPending]);

    expect(releaseRequestSlot).toHaveBeenCalledTimes(2);
    await queue.reportMetrics(async () => ({ depth: 0, oldestWaitingAgeMs: 0 }));
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.failedEnqueues,
      value: 1,
    });
  });

  it('skips DB lookups and counts failedEnqueues when the tenant pool is already closing', async () => {
    retainRequestSlot.mockReturnValueOnce(false);

    const { queue, library } = setup();
    const dataContext = new HookContextManager({ ip: '1.2.3.4' });
    dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });

    await library.triggerDataHooks(new ConsoleLog(), dataContext);

    expect(findAllHooks).not.toHaveBeenCalled();
    expect(releaseRequestSlot).not.toHaveBeenCalled();
    await queue.reportMetrics(async () => ({ depth: 0, oldestWaitingAgeMs: 0 }));
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.failedEnqueues,
      value: 1,
    });
  });

  it('drains in-flight pre-insert lookups during graceful shutdown', async () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let resolveHooks: ((hooks: Hook[]) => void) | undefined;
    findAllHooks.mockImplementationOnce(
      async () =>
        new Promise<Hook[]>((resolve) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          resolveHooks = resolve;
        })
    );

    const { queue, library } = setup();
    const dataContext = new HookContextManager({ ip: '1.2.3.4' });
    dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });

    const hook = makeHook('hook-1', ['Role.Created']);
    void library.triggerDataHooks(new ConsoleLog(), dataContext);

    const draining = queue.drain(
      (async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        resolveHooks?.([hook]);
      })()
    );

    await draining;

    expect(enqueueJob).toHaveBeenCalledTimes(1);
    expect(releaseRequestSlot).toHaveBeenCalledTimes(1);
  });

  it('counts failed enqueueJob calls per hook without aborting remaining matching hooks', async () => {
    findAllHooks.mockResolvedValueOnce([
      makeHook('hook-1', ['Role.Created']),
      makeHook('hook-2', ['Role.Created']),
    ]);
    enqueueJob.mockRejectedValueOnce(new Error('unique violation'));

    const { queue, library } = setup();
    const dataContext = new HookContextManager({ ip: '1.2.3.4' });
    dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });

    await library.triggerDataHooks(new ConsoleLog(), dataContext);

    expect(enqueueJob).toHaveBeenCalledTimes(2);
    await queue.reportMetrics(async () => ({ depth: 0, oldestWaitingAgeMs: 0 }));
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.failedEnqueues,
      value: 1,
    });
  });

  it('falls back to inline send and insertLog when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    findAllHooks.mockResolvedValueOnce([makeHook('hook-1', ['Role.Created'])]);

    const { library } = setup();
    const dataContext = new HookContextManager({ ip: '1.2.3.4' });
    dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });

    await library.triggerDataHooks(new ConsoleLog(), dataContext);

    expect(sendWebhookRequest).toHaveBeenCalledTimes(1);
    expect(insertLog).toHaveBeenCalledTimes(1);
    expect(insertLog.mock.calls[0]?.[0]).toMatchObject({
      id: mockId,
      key: 'TriggerHook.Role.Created',
      payload: { result: LogResult.Success },
    });
    expect(enqueueJob).not.toHaveBeenCalled();
    expect(retainRequestSlot).not.toHaveBeenCalled();
  });
});
