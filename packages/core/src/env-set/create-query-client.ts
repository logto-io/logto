import { assert } from '@silverhand/essentials';
import { PostgresQueryClient } from '@withtyped/postgres';
import { parseDsn } from 'slonik';

import { MockQueryClient } from '#src/test-utils/query-client.test.js';

const createQueryClient = (databaseDsn: string, isTest: boolean) => {
  // Database connection is disabled in unit test environment
  if (isTest) {
    return new MockQueryClient();
  }

  assert(parseDsn(databaseDsn), new Error('Database name is required'));

  return new PostgresQueryClient({ connectionString: databaseDsn });
};

export default createQueryClient;
