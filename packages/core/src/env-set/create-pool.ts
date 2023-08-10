import { assert } from '@silverhand/essentials';
import { createMockPool, createMockQueryResult, createPool, parseDsn } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

const createPoolByEnv = async (
  databaseDsn: string,
  mockDatabaseConnection: boolean,
  poolSize?: number
) => {
  // Database connection is disabled in unit test environment
  if (mockDatabaseConnection) {
    return createMockPool({ query: async () => createMockQueryResult([]) });
  }

  const interceptors = [...createInterceptors()];

  assert(parseDsn(databaseDsn).databaseName, new Error('Database name is required'));

  return createPool(databaseDsn, { interceptors, maximumPoolSize: poolSize });
};

export default createPoolByEnv;
