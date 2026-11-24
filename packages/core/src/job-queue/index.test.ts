import { appInsights } from '@logto/app-insights/node';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import { CoreJobQueue, jobQueueMetricNames } from './index.js';
import { webhookJobType } from './webhook-handler.js';

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

  it('reports gauges and failed enqueues since the last report to Application Insights', async () => {
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
    await queue.reportMetrics(async () => gauges);

    expect(trackMetric.mock.calls.map(([metric]) => metric)).toEqual([
      { name: jobQueueMetricNames.depth, value: 7 },
      { name: jobQueueMetricNames.oldestWaitingAgeMs, value: 1200 },
      { name: jobQueueMetricNames.failedEnqueues, value: 2 },
    ]);

    trackMetric.mockReset();
    await queue.reportMetrics(async () => {
      throw new Error('database unavailable');
    });

    expect(trackMetric.mock.calls.map(([metric]) => metric)).toEqual([
      { name: jobQueueMetricNames.failedEnqueues, value: 0 },
    ]);
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
      { name: jobQueueMetricNames.failedEnqueues, value: 2 },
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
});
