import { Users, UserSsoIdentities } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { mockUser } from '#src/__mocks__/user.js';
import { convertToIdentifiers } from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});
const { createUserQueries } = await import('./user.js');
const { countUsers, findUsers } = createUserQueries(pool);
const { table, fields } = convertToIdentifiers(Users);
const databaseValue = {
  ...mockUser,
  profile: JSON.stringify({}),
  identities: JSON.stringify(mockUser.identities),
  customData: JSON.stringify(mockUser.customData),
  logtoConfig: JSON.stringify(mockUser.logtoConfig),
  mfaVerifications: JSON.stringify(mockUser.mfaVerifications),
};

describe('user external identity conditions', () => {
  it('counts users by social identity', async () => {
    const provider = 'dingtalk';
    const identityId = 'dingtalk-open-id';
    const expectSql = sql`
      select count(*)
      from ${table}
      where ${fields.identities}::json#>>array[${provider}, 'userId'] = ${identityId}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([provider, identityId]);

      return createMockQueryResult([{ count: 1 }]);
    });

    await expect(
      countUsers({ identity: { type: 'social', provider, identityId } })
    ).resolves.toEqual({ count: 1 });
  });

  it('finds users by enterprise SSO identity', async () => {
    const provider = 'https://example.com/issuer';
    const identityId = 'enterprise-user-id';
    const limit = 20;
    const offset = 0;
    const id = sql.identifier;
    const expectSql = sql`
      select ${sql.join(
        Object.values(fields).map((field) => sql`${table}.${field}`),
        sql`,`
      )}
      from ${table}
      where exists (
        select 1
        from ${id([UserSsoIdentities.table])}
        where ${id([UserSsoIdentities.table, UserSsoIdentities.fields.issuer])} = ${provider}
        and ${id([UserSsoIdentities.table, UserSsoIdentities.fields.identityId])} = ${identityId}
        and ${id([UserSsoIdentities.table, UserSsoIdentities.fields.userId])} = ${id([
          Users.table,
          Users.fields.id,
        ])}
      )
      order by ${fields.createdAt} desc
      limit ${limit}
      offset ${offset}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([provider, identityId, limit, offset]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(
      findUsers(limit, offset, { identity: { type: 'sso', provider, identityId } })
    ).resolves.toEqual([databaseValue]);
  });
});
