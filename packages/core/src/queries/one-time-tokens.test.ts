import { OneTimeTokens, OneTimeTokenStatus } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createOneTimeTokenQueries } = await import('./one-time-tokens.js');
const { countOneTimeTokens } = createOneTimeTokenQueries(pool);

describe('one-time token query', () => {
  const { table } = convertToIdentifiers(OneTimeTokens);

  it('counts every token when no condition is given', async () => {
    const expectSql = sql`
      select count(*)
      from ${table}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([]);

      return createMockQueryResult([{ count: '10' }]);
    });

    await expect(countOneTimeTokens({})).resolves.toEqual({ count: 10 });
  });

  it('counts only the tokens matching the conditions', async () => {
    const email = 'foo@bar.com';
    const expectSql = sql`
      select count(*)
      from ${table}
      where "email" = $1 and "status" = $2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([email, OneTimeTokenStatus.Active]);

      return createMockQueryResult([{ count: '2' }]);
    });

    await expect(countOneTimeTokens({ email, status: OneTimeTokenStatus.Active })).resolves.toEqual(
      { count: 2 }
    );
  });
});
