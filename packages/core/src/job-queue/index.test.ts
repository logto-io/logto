import { appInsights } from '@logto/app-insights/node';
import { InteractionHookEvent } from '@logto/schemas';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import { CoreJobQueue, jobQueueMetricNames } from './index.js';
import { webhookJobType, webhookRetryMaxAgeMs } from './webhook-handler.js';

const { jest } = import.meta;

const gauges = { depth: 7, oldestWaitingAgeMs: 1200 };

describe('CoreJobQueue', () => {
  const originalClient = appInsights.client;
  const trackMetric = jest.fn();

  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- restore the shared client
    appInsights.client = originalClient;
    trackMetric.mockReset();
  });

  it('reports gauges, open circuits, failed enqueues, and exhausted deliveries to Application Insights', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- stub the shared client
    appInsights.client = { trackMetric } as unknown as NonNullable<typeof appInsights.client>;
    const queue = new CoreJobQueue();

    await queue.enqueue(async () => {
      throw new Error('insert failed');
    });
    await queue.enqueue(async () => {
      throw new Error('insert failed');
    });
    await queue.enqueue(async () => 'inserted');
    queue.recordExhaustedDeliveries(3);
    queue.recordDroppedAtCap('group', 2);
    queue.recordDroppedAtCap('tenant', 4);
    await queue.reportMetrics(async () => gauges);

    expect(trackMetric.mock.calls.map(([metric]) => metric)).toEqual([
      { name: jobQueueMetricNames.depth, value: 7 },
      { name: jobQueueMetricNames.oldestWaitingAgeMs, value: 1200 },
      { name: jobQueueMetricNames.openCircuits, value: 0 },
      { name: jobQueueMetricNames.failedEnqueues, value: 2 },
      { name: jobQueueMetricNames.exhaustedDeliveries, value: 3 },
      { name: jobQueueMetricNames.droppedAtGroupCap, value: 2 },
      { name: jobQueueMetricNames.droppedAtTenantCap, value: 4 },
    ]);

    trackMetric.mockReset();
    await queue.reportMetrics(async () => {
      throw new Error('database unavailable');
    });

    expect(trackMetric.mock.calls.map(([metric]) => metric)).toEqual([
      { name: jobQueueMetricNames.openCircuits, value: 0 },
      { name: jobQueueMetricNames.failedEnqueues, value: 0 },
      { name: jobQueueMetricNames.exhaustedDeliveries, value: 0 },
      { name: jobQueueMetricNames.droppedAtGroupCap, value: 0 },
      { name: jobQueueMetricNames.droppedAtTenantCap, value: 0 },
    ]);
  });

  it('reports worker openCircuitCount in metrics', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- stub the shared client
    appInsights.client = { trackMetric } as unknown as NonNullable<typeof appInsights.client>;
    const query = jest.fn(async () => createMockQueryResult([]));
    const queue = new CoreJobQueue();
    const worker = queue.start(createMockPool({ query }));
    jest.spyOn(worker, 'openCircuitCount', 'get').mockReturnValue(2);

    await queue.reportMetrics(async () => gauges);

    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.openCircuits,
      value: 2,
    });

    await queue.drain();
  });

  it('stops the worker and waits for enqueues started before the servers closed', async () => {
    const query = jest.fn(async () => createMockQueryResult([]));
    const queue = new CoreJobQueue();
    const worker = queue.start(createMockPool({ query }));
    const stop = jest.spyOn(worker, 'stop');
    const inserted = jest.fn();
    const slowInsert = async (name: string) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      inserted(name);
    };

    void queue.enqueue(async () => slowInsert('before drain'));
    const draining = queue.drain(
      // A request still running while its server closes enqueues after the drain began.
      (async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        void queue.enqueue(async () => slowInsert('while closing'));
      })()
    );
    await draining;

    expect(inserted.mock.calls).toEqual([['before drain'], ['while closing']]);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('tracks pre-insert enqueue tasks through drain and counts recorded failures', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- stub the shared client
    appInsights.client = { trackMetric } as unknown as NonNullable<typeof appInsights.client>;
    const queue = new CoreJobQueue();
    const recordStep = jest.fn();

    // eslint-disable-next-line @silverhand/fp/no-let
    let releaseLookup: (() => void) | undefined;
    const lookupBlocked = new Promise<void>((resolve) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      releaseLookup = resolve;
    });

    void queue.trackEnqueue(async () => {
      await lookupBlocked;
      recordStep('lookup-finished');
      throw new Error('lookup failed');
    });

    const draining = queue.drain(
      (async () => {
        recordStep('servers-closed');
        releaseLookup?.();
      })()
    );
    await draining;

    queue.recordFailedEnqueue(new Error('slot unavailable'));
    await queue.reportMetrics(async () => gauges);

    expect(recordStep.mock.calls).toEqual([['servers-closed'], ['lookup-finished']]);
    expect(trackMetric.mock.calls.map(([metric]) => metric)).toEqual([
      { name: jobQueueMetricNames.depth, value: 7 },
      { name: jobQueueMetricNames.oldestWaitingAgeMs, value: 1200 },
      { name: jobQueueMetricNames.openCircuits, value: 0 },
      { name: jobQueueMetricNames.failedEnqueues, value: 2 },
      { name: jobQueueMetricNames.exhaustedDeliveries, value: 0 },
      { name: jobQueueMetricNames.droppedAtGroupCap, value: 0 },
      { name: jobQueueMetricNames.droppedAtTenantCap, value: 0 },
    ]);
  });

  it('registers the webhook handler when starting the worker', async () => {
    const query = jest.fn(async () => createMockQueryResult([]));
    const queue = new CoreJobQueue();
    const worker = queue.start(createMockPool({ query }));

    // A claim query includes the registered `webhook` type in its SQL parameters.
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
    const claimCall = query.mock.calls[0] as [string, unknown[]] | undefined;
    expect(claimCall?.[1]?.flat()).toContain(webhookJobType);

    await queue.drain();
    expect(worker.inFlightCount).toBe(0);
  });

  it('wires webhook handler onExhausted into exhaustedDeliveries metrics', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- stub the shared client
    appInsights.client = { trackMetric } as unknown as NonNullable<typeof appInsights.client>;
    const now = Date.now();
    const query = jest.fn(async (sqlText: string) => {
      if (sqlText.includes('update jobs j')) {
        const claimCallCount = query.mock.calls.filter(([text]) =>
          String(text).includes('update jobs j')
        ).length;
        if (claimCallCount === 1) {
          return createMockQueryResult([
            {
              tenantId: 't1',
              id: 'j1',
              type: webhookJobType,
              groupKey: 'h1',
              dedupeKey: 'j1',
              payload: JSON.stringify({
                event: InteractionHookEvent.PostSignIn,
                hookId: 'h1',
                deliveryId: 'j1',
              }),
              attempts: 12,
              nextAttemptAt: now + 60_000,
              claimedBy: 'w1',
              createdAt: now - webhookRetryMaxAgeMs - 1000,
            },
          ]);
        }
      }

      if (sqlText.includes('from hooks')) {
        throw new Error('transient hook lookup error');
      }

      if (sqlText.includes('with settled as')) {
        return createMockQueryResult([{ count: 1 }]);
      }

      return createMockQueryResult([]);
    });

    const queue = new CoreJobQueue();
    queue.start(createMockPool({ query }));

    await new Promise((resolve) => {
      setTimeout(resolve, 30);
    });
    await queue.drain();
    await queue.reportMetrics(async () => gauges);

    expect(trackMetric).toHaveBeenCalledWith({
      name: jobQueueMetricNames.exhaustedDeliveries,
      value: 1,
    });
  });
});
