import { type DatabasePool } from '@silverhand/slonik';
import { describe, expect, it, vi } from 'vitest';

import { createPoolWithRetry, isTransientConnectionError } from './pool-retry.js';

/** What Node throws when the database host name cannot be resolved. */
class DnsError extends Error {
  code = 'ENOTFOUND';
  syscall = 'getaddrinfo';

  constructor(public hostname: string) {
    super(`getaddrinfo ENOTFOUND ${hostname}`);
  }
}

/** What `pg` throws when the database does not exist. */
class MissingDatabaseError extends Error {
  code = '3D000';
}

const noDelay = { minTimeout: 0, maxTimeout: 0, factor: 0 };

type TestPool = Pick<DatabasePool, 'query' | 'end'>;

const createTestPool = (
  query: TestPool['query'] = vi.fn(async () => ({})) as unknown as TestPool['query']
): TestPool => ({
  query,
  end: vi.fn(async () => {
    // Nothing to close
  }),
});

describe('createPoolWithRetry()', () => {
  it('should retry a failed DNS resolution of the database host', async () => {
    const readyPool = createTestPool();
    const factory = vi
      .fn()
      .mockRejectedValueOnce(new DnsError('db.example.com'))
      .mockResolvedValueOnce(readyPool);

    await expect(createPoolWithRetry(factory, 1, noDelay)).resolves.toBe(readyPool);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should retry a readiness query that fails on a transient error and close that pool', async () => {
    const failingPool = createTestPool(
      vi.fn().mockRejectedValue(new DnsError('db.example.com')) as unknown as TestPool['query']
    );
    const readyPool = createTestPool();
    const factory = vi.fn().mockResolvedValueOnce(failingPool).mockResolvedValueOnce(readyPool);

    await expect(createPoolWithRetry(factory, 1, noDelay)).resolves.toBe(readyPool);
    expect(failingPool.end).toHaveBeenCalledTimes(1);
  });

  it('should rethrow a non-transient error untouched after the first attempt', async () => {
    const error = new MissingDatabaseError('database "logto" does not exist');
    const factory = vi
      .fn()
      .mockResolvedValue(
        createTestPool(vi.fn().mockRejectedValue(error) as unknown as TestPool['query'])
      );

    await expect(createPoolWithRetry(factory, 3, noDelay)).rejects.toBe(error);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should not retry a non-transient error thrown while creating the pool', async () => {
    const error = new Error('invalid database options');
    const factory = vi.fn().mockRejectedValue(error);

    await expect(createPoolWithRetry(factory, 3, noDelay)).rejects.toBe(error);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should rethrow the last transient error after exhausting retries', async () => {
    const error = new DnsError('db.example.com');
    const factory = vi.fn().mockRejectedValue(error);

    await expect(createPoolWithRetry(factory, 2, noDelay)).rejects.toBe(error);
    expect(factory).toHaveBeenCalledTimes(3);
  });
});

describe('isTransientConnectionError()', () => {
  it('should identify transient connection errors by code or timeout message', () => {
    expect(isTransientConnectionError({ code: 'ECONNREFUSED' })).toBe(true);
    expect(isTransientConnectionError({ code: 'ENOTFOUND' })).toBe(true);
    expect(isTransientConnectionError({ code: 'EAI_AGAIN' })).toBe(true);
    expect(isTransientConnectionError(new Error('timeout expired'))).toBe(true);
    expect(isTransientConnectionError({ code: '3D000' })).toBe(false);
    expect(isTransientConnectionError(new Error('password authentication failed'))).toBe(false);
    expect(isTransientConnectionError()).toBe(false);
  });
});
