import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import type { QueryType } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({ query: async (query, values) => mockQuery(query, values) });
const { createUserQueries } = await import('./user.js');
const { countUsers, findUsers } = createUserQueries(pool);

it.each([true, false])('filters user counts and rows by isSuspended=%s', async (isSuspended) => {
  mockQuery.mockImplementationOnce(async (query, values) => {
    expect(query).toContain('where "is_suspended" = $1');
    expect(values).toEqual([isSuspended]);
    return createMockQueryResult([{ count: 1 }]);
  });
  await expect(countUsers({ isSuspended })).resolves.toEqual({ count: 1 });

  mockQuery.mockImplementationOnce(async (query, values) => {
    expect(query).toContain('where "is_suspended" = $1');
    expect(values[0]).toEqual(isSuspended);
    return createMockQueryResult([]);
  });
  await expect(findUsers(10, 0, { isSuspended })).resolves.toEqual([]);
});
