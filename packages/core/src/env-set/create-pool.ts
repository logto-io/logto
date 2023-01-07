import { assert } from '@silverhand/essentials';
import { createMockPool, createMockQueryResult, createPool, parseDsn } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

const createPoolByEnv = async (databaseDsn: string, isTest: boolean) => {
  // Database connection is disabled in unit test environment
  if (isTest) {
    return createMockPool({ query: async () => createMockQueryResult([]) });
  }

  const interceptors = [...createInterceptors()];

  assert(parseDsn(databaseDsn).databaseName, new Error('Database name is required'));

  return createPool(databaseDsn, { interceptors });
};

export default createPoolByEnv;
