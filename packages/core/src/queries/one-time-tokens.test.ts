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
const { countOneTimeTokens, consumeActiveOneTimeToken } = createOneTimeTokenQueries(pool);

describe('one-time token query', () => {
  const { table, fields } = convertToIdentifiers(OneTimeTokens);

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

  it('consumes a token only while it is active', async () => {
    const token = 'foo-token';
    const expectSql = sql`
      update ${table}
      set ${fields.status} = $1
      where ${fields.token} = $2
      and ${fields.status} = $3
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([OneTimeTokenStatus.Consumed, token, OneTimeTokenStatus.Active]);

      return createMockQueryResult([]);
    });

    await expect(consumeActiveOneTimeToken(token)).resolves.toBeNull();
  });
});
