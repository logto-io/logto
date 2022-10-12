import { createMockPool } from 'slonik';

import * as queries from '../../queries/logto-config';
import { QueryType } from '../../test-utilities';
import * as functions from './alteration';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const files = Object.freeze([
  { filename: '1.0.0-1663923770-a.js', path: '/alterations/1.0.0-1663923770-a.js' },
  { filename: '1.0.0-1663923771-b.js', path: '/alterations/1.0.0-1663923771-b.js' },
  { filename: '1.0.0-1663923772-c.js', path: '/alterations/1.0.0-1663923772-c.js' },
]);

describe('getUndeployedAlterations()', () => {
  beforeEach(() => {
    // `getAlterationFiles()` will ensure the order
    jest.spyOn(functions, 'getAlterationFiles').mockResolvedValueOnce([...files]);
  });

  it('returns all files if database timestamp is 0', async () => {
    jest.spyOn(queries, 'getCurrentDatabaseAlterationTimestamp').mockResolvedValueOnce(0);

    await expect(functions.getUndeployedAlterations(pool)).resolves.toEqual(files);
  });

  it('returns files whose timestamp is greater then database timestamp', async () => {
    jest
      .spyOn(queries, 'getCurrentDatabaseAlterationTimestamp')
      .mockResolvedValueOnce(1_663_923_770);

    await expect(functions.getUndeployedAlterations(pool)).resolves.toEqual([files[1], files[2]]);
  });
});
