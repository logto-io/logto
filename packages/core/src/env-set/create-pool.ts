import { assert } from '@silverhand/essentials';
import {
  createMockPool,
  createMockQueryResult,
  createPool,
  parseDsn,
  createInterceptorsPreset,
} from '@silverhand/slonik';

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

  return createPool(databaseDsn, {
    interceptors: createInterceptorsPreset(),
    maximumPoolSize: poolSize,
    connectionTimeout,
    statementTimeout,
  });
};

export default createPoolByEnv;
