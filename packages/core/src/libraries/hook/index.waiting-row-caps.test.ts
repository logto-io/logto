import { appInsights } from '@logto/app-insights/node';
import { LogResult, type Hook, type HookEvent } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';

import { CoreJobQueue, jobQueueMetricNames } from '#src/job-queue/index.js';
import { WaitingRowCapCache } from '#src/job-queue/waiting-row-cap-cache.js';
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

await mockEsmWithActual('./utils.js', () => ({
  sendWebhookRequest: jest
    .fn()
    .mockResolvedValue({ status: 200, text: async () => '{"message":"ok"}' }),
  generateHookTestPayload,
  parseResponse,
}));

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createHookLibrary } = await import('./index.js');
const { HookContextManager } = await import('./context-manager.js');

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

describe('createHookLibrary waiting-row caps', () => {
  const originalClient = appInsights.client;
  const trackMetric = jest.fn();

  const findAllHooks = jest.fn();
  const insertLog = jest.fn();
  const enqueueJob = jest.fn<Promise<void>, Parameters<Queries['jobs']['enqueueJob']>>();
  const countJobsByGroup = jest.fn<
    Promise<number>,
    Parameters<Queries['jobs']['countJobsByGroup']>
  >();
  const countJobsByType = jest.fn<
    Promise<number>,
    Parameters<Queries['jobs']['countJobsByType']>
  >();

  const setup = ({
    waitingRowCaps,
    waitingRowCapCache,
  }: {
    waitingRowCaps?: { perHook: number; perTenant: number };
    waitingRowCapCache?: WaitingRowCapCache;
  } = {}) => {
    const queue = new CoreJobQueue({ waitingRowCapCache });
    const queries = new MockQueries({
      hooks: { findAllHooks },
      logs: { insertLog },
      jobs: { enqueueJob, countJobsByGroup, countJobsByType },
    });

    return {
      queue,
      library: createHookLibrary(queries, {
        tenantId: 'tenant-1',
        jobQueue: queue,
        waitingRowCaps,
      }),
    };
  };

  beforeEach(() => {
    setDevFeaturesEnabled(true);
    findAllHooks.mockReset();
    enqueueJob.mockReset();
    insertLog.mockReset();
    countJobsByGroup.mockReset().mockResolvedValue(0);
    countJobsByType.mockReset().mockResolvedValue(0);
    trackMetric.mockReset();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- stub the shared client
    appInsights.client = { trackMetric } as unknown as NonNullable<typeof appInsights.client>;
  });

  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- restore the shared client
    appInsights.client = originalClient;
    jest.clearAllMocks();
  });

  afterAll(() => {
    resetDevFeaturesEnabled();
  });

  it('drops events at the per-hook cap, logs a permanent failure with deliveryId, and records droppedAtGroupCap', async () => {
    findAllHooks.mockResolvedValueOnce([makeHook('hook-capped', ['Role.Created'])]);
    countJobsByGroup.mockResolvedValueOnce(2);

    const { queue, library } = setup({
      waitingRowCaps: { perHook: 2, perTenant: 10 },
    });
    const wake = jest.spyOn(queue, 'wake');
    const dataContext = new HookContextManager({ ip: '1.2.3.4' });
    dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });

    await library.triggerDataHooks(new ConsoleLog(), dataContext);

    expect(countJobsByGroup).toHaveBeenCalledWith(webhookJobType, 'hook-capped', 2);
    expect(enqueueJob).not.toHaveBeenCalled();
    expect(wake).not.toHaveBeenCalled();
    expect(insertLog).toHaveBeenCalledTimes(1);

    const logged = insertLog.mock.calls[0]?.[0] as {
      id: string;
      key: string;
      payload: Record<string, unknown>;
    };
    expect(logged.id).toBe(mockId);
    expect(logged.key).toBe('TriggerHook.Role.Created');
    expect(logged.payload).toMatchObject({
      result: LogResult.Error,
      hookId: 'hook-capped',
      attempts: 0,
    });
    expect(logged.payload.hookRequest).toMatchObject({
      body: {
        event: 'Role.Created',
        hookId: 'hook-capped',
        deliveryId: mockId,
      },
    });
    expect(logged.payload).not.toHaveProperty('nextAttemptAt');

    await queue.reportMetrics(async () => ({ depth: 0, oldestWaitingAgeMs: 0 }));
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.droppedAtGroupCap,
      value: 1,
    });
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.failedEnqueues,
      value: 0,
    });
  });

  it('enforces the per-tenant cap across hooks using cached counts and records droppedAtTenantCap', async () => {
    const now = jest.fn(() => 1000);
    const waitingRowCapCache = new WaitingRowCapCache({ ttlMs: 5000, now });
    const hookA = makeHook('hook-a', ['Role.Created']);
    const hookB = makeHook('hook-b', ['Role.Created']);

    const { queue, library } = setup({
      waitingRowCaps: { perHook: 5, perTenant: 3 },
      waitingRowCapCache,
    });

    const triggerHook = async (hook: Hook) => {
      findAllHooks.mockResolvedValueOnce([hook]);
      const dataContext = new HookContextManager({ ip: '1.2.3.4' });
      dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });
      await library.triggerDataHooks(new ConsoleLog(), dataContext);
    };

    // Start from 1 existing row for tenant-1 (0 in hookA, 1 in hookB).
    countJobsByGroup.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    countJobsByType.mockResolvedValueOnce(1);

    await triggerHook(hookA); // Tenant cache: 1 -> 2
    await triggerHook(hookB); // Tenant cache: 2 -> 3 (at cap)
    await triggerHook(hookB); // Dropped via cached tenant count without re-querying DB

    expect(enqueueJob).toHaveBeenCalledTimes(2);
    expect(insertLog).toHaveBeenCalledTimes(1);
    expect(countJobsByType).toHaveBeenCalledTimes(1);
    expect(countJobsByGroup).toHaveBeenCalledTimes(2);

    // After TTL expires, fresh DB counts allow enqueueing again.
    now.mockReturnValue(7000);
    countJobsByGroup.mockResolvedValueOnce(0);
    countJobsByType.mockResolvedValueOnce(0);
    await triggerHook(hookA);

    expect(enqueueJob).toHaveBeenCalledTimes(3);
    expect(countJobsByType).toHaveBeenCalledTimes(2);

    await queue.reportMetrics(async () => ({ depth: 0, oldestWaitingAgeMs: 0 }));
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.droppedAtTenantCap,
      value: 1,
    });
  });

  it('drops capped hooks without aborting other matching hooks on the same event', async () => {
    findAllHooks.mockResolvedValueOnce([
      makeHook('hook-full', ['Role.Created']),
      makeHook('hook-open', ['Role.Created']),
    ]);
    countJobsByGroup.mockImplementation(async (_type, groupKey) =>
      groupKey === 'hook-full' ? 2 : 0
    );
    countJobsByType.mockResolvedValueOnce(2);

    const { queue, library } = setup({
      waitingRowCaps: { perHook: 2, perTenant: 10 },
    });
    const dataContext = new HookContextManager({ ip: '1.2.3.4' });
    dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });

    await library.triggerDataHooks(new ConsoleLog(), dataContext);

    expect(enqueueJob).toHaveBeenCalledTimes(1);
    expect(enqueueJob.mock.calls[0]?.[0].groupKey).toBe('hook-open');
    expect(insertLog).toHaveBeenCalledTimes(1);
    expect(insertLog.mock.calls[0]?.[0].payload).toMatchObject({
      result: LogResult.Error,
      hookId: 'hook-full',
    });

    await queue.reportMetrics(async () => ({ depth: 0, oldestWaitingAgeMs: 0 }));
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.droppedAtGroupCap,
      value: 1,
    });
  });

  it('rolls back cached counts when enqueueJob fails so subsequent triggers are not falsely capped', async () => {
    findAllHooks.mockResolvedValue([makeHook('hook-1', ['Role.Created'])]);
    countJobsByGroup.mockResolvedValueOnce(1);
    countJobsByType.mockResolvedValueOnce(1);
    enqueueJob.mockRejectedValueOnce(new Error('db write error'));

    const { queue, library } = setup({
      waitingRowCaps: { perHook: 2, perTenant: 10 },
    });
    const dataContext = new HookContextManager({ ip: '1.2.3.4' });
    dataContext.appendDataHookContext('Role.Created', { data: { id: 'role-1' } });

    await library.triggerDataHooks(new ConsoleLog(), dataContext);
    // Second trigger within TTL still succeeds because the failed insert rolled back its reservation.
    await library.triggerDataHooks(new ConsoleLog(), dataContext);

    expect(enqueueJob).toHaveBeenCalledTimes(2);
    expect(insertLog).not.toHaveBeenCalled();

    await queue.reportMetrics(async () => ({ depth: 0, oldestWaitingAgeMs: 0 }));
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.failedEnqueues,
      value: 1,
    });
    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.droppedAtGroupCap,
      value: 0,
    });
  });
});
