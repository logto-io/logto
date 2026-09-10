import { OidcModelInstances } from '@logto/schemas';
import { createMockPool, sql } from '@silverhand/slonik';
import { subHours } from 'date-fns';

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

const { createOidcModelInstanceQueries } = await import('./oidc-model-instance.js');
const { pruneConsumedRefreshTokensByGrantId } = createOidcModelInstanceQueries(pool);

describe('pruneConsumedRefreshTokensByGrantId', () => {
  const { table, fields } = convertToIdentifiers(OidcModelInstances);

  afterEach(() => {
    mockQuery.mockReset();
    jest.useRealTimers();
  });

  it('deletes one bounded batch consumed more than a week ago', async () => {
    const grantId = 'target-id';
    const now = new Date('2026-09-02T00:00:00.000Z');
    jest.useFakeTimers({ now });
    const expectSql = sql`
      delete from ${table}
      where ${fields.id} in (
        select ${fields.id}
        from ${table}
        where ${fields.modelName}='RefreshToken'
        and ${fields.payload} ? 'grantId'
        and ${fields.payload}->>'grantId'=$1
        and ${fields.consumedAt} < to_timestamp($2)
        limit $3
        for update skip locked
      )
    `;

    // @ts-expect-error - mock delete query
    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([grantId, subHours(now, 7 * 24).valueOf() / 1000, 100]);

      return { rowCount: 7 };
    });

    await expect(pruneConsumedRefreshTokensByGrantId(grantId)).resolves.toBe(7);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('skips a grant that is already being pruned', async () => {
    // @ts-expect-error - mock delete query
    mockQuery.mockImplementation(async () => ({ rowCount: 1 }));

    const [first, second] = await Promise.all([
      pruneConsumedRefreshTokensByGrantId('same-grant'),
      pruneConsumedRefreshTokensByGrantId('same-grant'),
    ]);

    expect([first, second]).toEqual([1, 0]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('caps concurrent prunes across grants', async () => {
    // @ts-expect-error - mock delete query
    mockQuery.mockImplementation(async () => ({ rowCount: 1 }));

    const results = await Promise.all(
      ['a', 'b', 'c', 'd', 'e'].map(async (grantId) => pruneConsumedRefreshTokensByGrantId(grantId))
    );

    expect(results).toEqual([1, 1, 1, 1, 0]);
    expect(mockQuery).toHaveBeenCalledTimes(4);
  });

  it('releases the in-flight mark when the query fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('statement timeout'));
    await expect(pruneConsumedRefreshTokensByGrantId('failing-grant')).rejects.toThrow(
      'statement timeout'
    );

    // @ts-expect-error - mock delete query
    mockQuery.mockImplementationOnce(async () => ({ rowCount: 2 }));
    await expect(pruneConsumedRefreshTokensByGrantId('failing-grant')).resolves.toBe(2);
  });
});
