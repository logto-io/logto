import { type DatabasePool, sql } from '@silverhand/slonik';
import pRetry, { AbortError } from 'p-retry';

const databaseConnectionRetries = 5;

/**
 * The connection errors worth retrying at startup. Mirrors the list core uses for its own pool
 * (`packages/core/src/env-set/create-pool.ts`): the database or the network is not ready yet.
 * `ENOTFOUND` / `EAI_AGAIN` are DNS resolution failures of the database host, frequent on a
 * container platform where the resolver is not ready when the process starts.
 */
const transientConnectionErrorCodes = new Set([
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

type PoolLike = Pick<DatabasePool, 'query' | 'end'>;

const isErrorWithConnectionMetadata = (
  error: unknown
): error is {
  code?: string;
  message?: string;
} => typeof error === 'object' && error !== null;

export const isTransientConnectionError = (error?: unknown) => {
  if (!isErrorWithConnectionMetadata(error)) {
    return false;
  }

  const { code, message } = error;

  if (typeof code === 'string' && transientConnectionErrorCodes.has(code)) {
    return true;
  }

  return typeof message === 'string' && message.toLowerCase().includes('timeout');
};

type RetryOptions = { minTimeout?: number; maxTimeout?: number; factor?: number };

/**
 * Create a pool and verify it with a lightweight readiness query, retrying transient connection errors with
 * an exponential backoff. Any other error, including "database does not exist" (`3D000`) that
 * callers handle themselves, is rethrown untouched after the first attempt.
 */
export const createPoolWithRetry = async <T extends PoolLike>(
  factory: () => Promise<T> | T,
  retries = databaseConnectionRetries,
  options: RetryOptions = {}
) =>
  pRetry(
    async () => {
      const pool = await (async () => {
        try {
          return await factory();
        } catch (error: unknown) {
          if (!isTransientConnectionError(error)) {
            throw new AbortError(error instanceof Error ? error : new Error(String(error)));
          }

          throw error;
        }
      })();

      try {
        await pool.query(sql`select 1`);
        return pool;
      } catch (error: unknown) {
        try {
          await pool.end();
        } catch {}

        if (!isTransientConnectionError(error)) {
          throw new AbortError(error instanceof Error ? error : new Error(String(error)));
        }

        throw error;
      }
    },
    {
      retries,
      minTimeout: 500,
      maxTimeout: 5000,
      ...options,
    }
  );
