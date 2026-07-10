import { type GetUsageFunction } from '@logto/connector-kit';

import { mockAliyunDmConnector } from '#src/__mocks__/connector.js';
import { type LogtoConnector } from '#src/utils/connectors/types.js';

const { transpileLogtoConnector } = await import('./index.js');

// `mockAliyunDmConnector` is an email (passwordless) connector; attach a `getUsage` implementation.
const buildEmailConnector = (
  getUsage: GetUsageFunction
): LogtoConnector & { getUsage: GetUsageFunction } => ({
  ...mockAliyunDmConnector,
  getUsage,
});

// Intentionally never resolve to simulate a stuck cloud usage lookup without extra timers.
const hang: GetUsageFunction = async () =>
  new Promise<number>((resolve) => {
    void resolve;
  });

describe('transpileLogtoConnector usage', () => {
  it('includes usage when getUsage resolves in time', async () => {
    const connector = buildEmailConnector(async () => 42);

    const result = await transpileLogtoConnector(connector);

    expect(result.usage).toBe(42);
  });

  it('omits usage when getUsage rejects', async () => {
    const connector = buildEmailConnector(async () => {
      throw new Error('cloud usage lookup failed');
    });

    const result = await transpileLogtoConnector(connector);

    expect(result.usage).toBeUndefined();
  });

  it('does not block the response when getUsage hangs', async () => {
    const connector = buildEmailConnector(hang);

    const start = Date.now();
    const result = await transpileLogtoConnector(connector);

    expect(result.usage).toBeUndefined();
    // The 3s deadline fired instead of waiting on the stuck lookup.
    expect(Date.now() - start).toBeGreaterThanOrEqual(2900);
    // Generous Jest budget so the ~3s real-timer wait can't brush the default timeout under CI load.
  }, 8000);
});
