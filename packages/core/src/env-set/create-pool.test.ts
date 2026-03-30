import { createMockUtils } from '@logto/shared/esm';
import pRetry from 'p-retry';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('p-retry', () => ({
  default: async (
    input: <T>(attemptNumber: number) => T | PromiseLike<T>,
    options?: Parameters<typeof pRetry>[1]
  ) =>
    pRetry(input, {
      ...options,
      factor: 0,
      minTimeout: 0,
      maxTimeout: 0,
    }),
}));

const { createPoolWithRetry, ensurePoolReady, isTransientConnectionError } = await import(
  './create-pool.js'
);

type TestPool = Parameters<typeof ensurePoolReady>[0];

const createTestPool = (options?: {
  queryImplementation?: TestPool['query'];
  endImplementation?: TestPool['end'];
}): TestPool => {
  const query =
    options?.queryImplementation ?? (jest.fn(async () => ({})) as unknown as TestPool['query']);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const end = options?.endImplementation ?? (jest.fn(async () => {}) satisfies TestPool['end']);

  return { query, end };
};

describe('create-pool', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should verify the pool with a lightweight readiness query', async () => {
    const pool = createTestPool();

    await expect(ensurePoolReady(pool)).resolves.toBe(pool);
    expect(pool.query).toBeCalledTimes(1);
  });

  it('should retry timed out connections and close failed pools', async () => {
    const error = new Error('timeout expired');
    const failedPool = createTestPool({
      queryImplementation: jest.fn(async () => {
        throw error;
      }),
    });
    const readyPool = createTestPool();
    const factory = jest.fn().mockResolvedValueOnce(failedPool).mockResolvedValueOnce(readyPool);

    await expect(createPoolWithRetry(factory, 1)).resolves.toBe(readyPool);
    expect(factory).toBeCalledTimes(2);
    expect(failedPool.end).toBeCalledTimes(1);
    expect(readyPool.end).not.toBeCalled();
  });

  it('should not retry non-transient connection errors', async () => {
    const error = new Error('password authentication failed');
    const failedPool = createTestPool({
      queryImplementation: jest.fn(async () => {
        throw error;
      }),
    });
    const factory = jest.fn().mockResolvedValue(failedPool);

    await expect(createPoolWithRetry(factory, 1)).rejects.toThrow(error);
    expect(factory).toBeCalledTimes(1);
    expect(failedPool.end).toBeCalledTimes(1);
  });

  it('should rethrow the last error after exhausting retries', async () => {
    const error = new Error('timeout expired');
    const firstFailedPool = createTestPool({
      queryImplementation: jest.fn(async () => {
        throw error;
      }),
    });
    const secondFailedPool = createTestPool({
      queryImplementation: jest.fn(async () => {
        throw error;
      }),
    });
    const factory = jest
      .fn()
      .mockResolvedValueOnce(firstFailedPool)
      .mockResolvedValueOnce(secondFailedPool);

    await expect(createPoolWithRetry(factory, 1)).rejects.toThrow(error);
    expect(factory).toBeCalledTimes(2);
    expect(firstFailedPool.end).toBeCalledTimes(1);
    expect(secondFailedPool.end).toBeCalledTimes(1);
  });

  it('should identify transient connection errors by code or timeout message', () => {
    expect(isTransientConnectionError({ code: 'ECONNREFUSED' })).toBe(true);
    expect(isTransientConnectionError(new Error('timeout expired'))).toBe(true);
    expect(isTransientConnectionError(new Error('password authentication failed'))).toBe(false);
    expect(isTransientConnectionError()).toBe(false);
  });
});
