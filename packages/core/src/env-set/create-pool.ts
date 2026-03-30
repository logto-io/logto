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
import pRetry from 'p-retry';

const databaseConnectionRetries = 5;

type PoolLike = Pick<DatabasePool, 'query' | 'end'>;

export const ensurePoolReady = async <T extends PoolLike>(pool: T) => {
  await pool.query(sql`select 1`);
  return pool;
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
