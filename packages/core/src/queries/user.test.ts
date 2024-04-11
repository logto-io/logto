import { Users } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';
import Sinon from 'sinon';

import { mockUser } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
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

const { createUserQueries } = await import('./user.js');
const {
  findUserByUsername,
  findUserByEmail,
  findUserByPhone,
  findUserByIdentity,
  hasUser,
  hasUserWithId,
  hasUserWithEmail,
  hasUserWithIdentity,
  hasUserWithPhone,
  updateUserById,
  deleteUserById,
  deleteUserIdentity,
} = createUserQueries(pool);

const stubIsCaseSensitiveUsername = (isCaseSensitiveUsername: boolean) =>
  Sinon.stub(EnvSet, 'values').value({
    ...EnvSet.values,
    isCaseSensitiveUsername,
  });

describe('user query', () => {
  beforeEach(() => {
    stubIsCaseSensitiveUsername(true);
  });

  const { table, fields } = convertToIdentifiers(Users);
  const databaseValue = {
    ...mockUser,
    profile: JSON.stringify({}),
    identities: JSON.stringify(mockUser.identities),
    customData: JSON.stringify(mockUser.customData),
    logtoConfig: JSON.stringify(mockUser.logtoConfig),
    mfaVerifications: JSON.stringify(mockUser.mfaVerifications),
  };

  it('findUserByUsername', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.username}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.username]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByUsername(mockUser.username!)).resolves.toEqual(databaseValue);
  });

  it('findUserByUsername (case insensitive)', async () => {
    stubIsCaseSensitiveUsername(false);
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where lower(${fields.username})=lower($1)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.username]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByUsername(mockUser.username!)).resolves.toEqual(databaseValue);
  });

  it('findUserByEmail', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where lower(${fields.primaryEmail})=lower($1)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryEmail]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByEmail(mockUser.primaryEmail!)).resolves.toEqual(databaseValue);
  });

  it('findUserByPhone', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.primaryPhone}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryPhone]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByPhone(mockUser.primaryPhone!)).resolves.toEqual(databaseValue);
  });

  it('findUserByIdentity', async () => {
    const target = 'github';

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = $1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.id]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByIdentity(target, mockUser.id)).resolves.toEqual(databaseValue);
  });

  it('hasUser', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where ${fields.username}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.username]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUser(mockUser.username!)).resolves.toEqual(true);
  });

  it('hasUser (case insensitive)', async () => {
    stubIsCaseSensitiveUsername(false);
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where lower(${fields.username})=lower($1)
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.username]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUser(mockUser.username!)).resolves.toEqual(true);
  });

  it('hasUserWithId', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where ${fields.id}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.id]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUserWithId(mockUser.id)).resolves.toEqual(true);
  });

  it('hasUserWithEmail', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.primaryEmail}
        from ${table}
        where lower(${fields.primaryEmail})=lower($1)
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryEmail]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUserWithEmail(mockUser.primaryEmail!)).resolves.toEqual(true);
  });

  it('hasUserWithPhone', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.primaryPhone}
        from ${table}
        where ${fields.primaryPhone}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryPhone]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUserWithPhone(mockUser.primaryPhone!)).resolves.toEqual(true);
  });

  it('hasUserWithIdentity', async () => {
    const target = 'github';

    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = $1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.id]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUserWithIdentity(target, mockUser.id)).resolves.toEqual(true);
  });

  it('updateUserById', async () => {
    const username = 'Joe';
    const id = 'foo';
    const expectSql = sql`
      update ${table}
      set ${fields.username}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([username, id]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(updateUserById(id, { username })).resolves.toEqual(databaseValue);
  });

  it('deleteUserById', async () => {
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([databaseValue]);
    });

    await deleteUserById(id);
  });

  it('deleteUserById should throw with zero response', async () => {
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([]);
    });

    await expect(deleteUserById(id)).rejects.toMatchError(new DeletionError(Users.table, id));
  });

  it('deleteUserIdentity', async () => {
    const userId = 'foo';
    const target = 'connector1';

    const { connector1, ...restIdentities } = mockUser.identities;
    const finalDbvalue = {
      ...mockUser,
      profile: JSON.stringify({}),
      identities: JSON.stringify(restIdentities),
      customData: JSON.stringify(mockUser.customData),
      logtoConfig: JSON.stringify(mockUser.logtoConfig),
      mfaVerifications: JSON.stringify(mockUser.mfaVerifications),
    };

    const expectSql = sql`
      update ${table}
      set ${fields.identities}=${fields.identities}::jsonb-$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([target, mockUser.id]);

      return createMockQueryResult([finalDbvalue]);
    });

    await expect(deleteUserIdentity(userId, target)).resolves.toEqual(finalDbvalue);
  });
});
