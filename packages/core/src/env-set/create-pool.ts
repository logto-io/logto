import { assert, conditional, trySafe } from '@silverhand/essentials';
import {
  createMockPool,
  createMockQueryResult,
  createPool,
  sql,
  parseDsn,
  createInterceptorsPreset,
  type DatabasePool,
} from '@silverhand/slonik';
import pRetry, { AbortError } from 'p-retry';

const databaseConnectionRetries = 5;
const transientConnectionErrorCodes = new Set([
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'EPIPE',
]);

type PoolLike = Pick<DatabasePool, 'query' | 'end'>;

const isErrorWithConnectionMetadata = (
  error: unknown
): error is {
  code?: string;
  message?: string;
} => typeof error === 'object' && error !== null;

export const ensurePoolReady = async <T extends PoolLike>(pool: T) => {
  await pool.query(sql`select 1`);
  return pool;
};

export const isTransientConnectionError = (error?: unknown) => {
  if (!isErrorWithConnectionMetadata(error)) {
    return false;
  }

  const { code, message } = error;

  if (code && transientConnectionErrorCodes.has(code)) {
    return true;
  }

  return message?.toLowerCase().includes('timeout') ?? false;
};

export const createPoolWithRetry = async <T extends PoolLike>(
  factory: () => Promise<T> | T,
  retries = databaseConnectionRetries
) =>
  pRetry(
    async () => {
      const pool = await factory();

      try {
        return await ensurePoolReady(pool);
      } catch (error: unknown) {
        await trySafe(pool.end());

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
    }
  );

const createPoolByEnv = async (
  databaseDsn: string,
  mockDatabaseConnection: boolean,
  poolSize?: number,
  connectionTimeout?: number,
  statementTimeout?: number | 'DISABLE_TIMEOUT'
) => {
  // Database connection is disabled in unit test environment
  if (mockDatabaseConnection) {
    return createMockPool({ query: async () => createMockQueryResult([]) });
  }

  assert(parseDsn(databaseDsn).databaseName, new Error('Database name is required'));

  const poolOptions = {
    interceptors: createInterceptorsPreset(),
    maximumPoolSize: poolSize,
    connectionTimeout,
    ...conditional(statementTimeout !== undefined && { statementTimeout }),
  };

  return createPoolWithRetry(async () => createPool(databaseDsn, poolOptions));
};

export default createPoolByEnv;
