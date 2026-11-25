import { OidcModelInstances } from '@logto/schemas';
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

const { createOidcModelInstanceQueries } = await import('./oidc-model-instance.js');
const { findUserActiveGrantsByClientId, findUserActiveSessionUidByGrantId } =
  createOidcModelInstanceQueries(pool);

describe('user grant lookups', () => {
  const { table, fields } = convertToIdentifiers(OidcModelInstances);
  const userId = 'user-id';

  afterEach(() => {
    mockQuery.mockReset();
  });

  it('finds active grants by the account id column', async () => {
    const expectSql = sql`
      select ${fields.id}, ${fields.payload}, ${fields.expiresAt}
      from ${table}
      where ${fields.modelName}='Grant'
        and ${fields.payloadAccountId}=$1
        and ${fields.payload}->>'clientId'=$2
        and ${fields.expiresAt} > to_timestamp($3)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([userId, 'client-id', expect.any(Number)]);

      return createMockQueryResult([]);
    });

    await expect(findUserActiveGrantsByClientId(userId, 'client-id')).resolves.toEqual([]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('finds the session of a grant by the account id column', async () => {
    const expectSql = sql`
      select ${fields.payload} ->> 'uid' as "sessionUid"
      from ${table}
      where ${fields.modelName} = $1
        and ${fields.payloadAccountId} = $2
        and ${fields.expiresAt} > to_timestamp($3)
        and exists (
          select 1
          from jsonb_each(${fields.payload} -> 'authorizations') as authorization_entry
          where authorization_entry.value ->> 'grantId' = $4
        )
      limit 1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(['Session', userId, expect.any(Number), 'grant-id']);

      return createMockQueryResult([{ sessionUid: 'session-uid' }]);
    });

    await expect(findUserActiveSessionUidByGrantId(userId, 'grant-id')).resolves.toEqual({
      sessionUid: 'session-uid',
    });
  });
});
