import { Users } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockUser } from '@/__mocks__';
import { convertToIdentifiers, convertToPrimitiveOrSql } from '@/database/utils';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import {
  findUserByUsername,
  findUserByEmail,
  findUserByPhone,
  findUserById,
  findUserByIdentity,
  hasUser,
  hasUserWithId,
  hasUserWithEmail,
  hasUserWithIdentity,
  hasUserWithPhone,
  insertUser,
  countUsers,
  findUsers,
  updateUserById,
  deleteUserById,
  deleteUserIdentity,
} from './user';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

describe('user query', () => {
  const { table, fields } = convertToIdentifiers(Users);
  const dbvalue = {
    ...mockUser,
    roleNames: JSON.stringify(mockUser.roleNames),
    identities: JSON.stringify(mockUser.identities),
    customData: JSON.stringify(mockUser.customData),
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

      return createMockQueryResult([dbvalue]);
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await expect(findUserByUsername(mockUser.username!)).resolves.toEqual(dbvalue);
  });

  it('findUserByEmail', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.primaryEmail}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryEmail]);

      return createMockQueryResult([dbvalue]);
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await expect(findUserByEmail(mockUser.primaryEmail!)).resolves.toEqual(dbvalue);
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

      return createMockQueryResult([dbvalue]);
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await expect(findUserByPhone(mockUser.primaryPhone!)).resolves.toEqual(dbvalue);
  });

  it('findUserById', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.id]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(findUserById(mockUser.id)).resolves.toEqual(dbvalue);
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

      return createMockQueryResult([dbvalue]);
    });

    await expect(findUserByIdentity(target, mockUser.id)).resolves.toEqual(dbvalue);
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        where ${fields.primaryEmail}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryEmail]);

      return createMockQueryResult([{ exists: true }]);
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

  it('insertUser', async () => {
    const expectSql = sql`
      insert into ${table} (${sql.join(Object.values(fields), sql`, `)})
      values (${sql.join(
        Object.values(fields)
          .slice(0, -1)
          .map((_, index) => `$${index + 1}`),
        sql`, `
      )}, to_timestamp(${Object.values(fields).length}::double precision / 1000))
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);

      expect(values).toEqual(
        Users.fieldKeys.map((k) =>
          k === 'lastSignInAt' ? mockUser[k] : convertToPrimitiveOrSql(k, mockUser[k])
        )
      );

      return createMockQueryResult([dbvalue]);
    });

    await expect(insertUser(mockUser)).resolves.toEqual(dbvalue);
  });

  it('countUsers', async () => {
    const search = 'foo';
    const expectSql = sql`
      select count(*)
      from ${table}
      where ${fields.primaryEmail} like $1 or ${fields.primaryPhone} like $2 or ${fields.username} like $3 or ${fields.name} like $4
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(countUsers(search)).resolves.toEqual(dbvalue);
  });

  it('findUsers', async () => {
    const search = 'foo';
    const limit = 100;
    const offset = 1;
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.primaryEmail} like $1 or ${fields.primaryPhone} like $2 or ${
      fields.username
    } like $3 or ${fields.name} like $4
      limit $5
      offset $6
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        limit,
        offset,
      ]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(findUsers(limit, offset, search)).resolves.toEqual([dbvalue]);
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

      return createMockQueryResult([dbvalue]);
    });

    await expect(updateUserById(id, { username })).resolves.toEqual(dbvalue);
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

      return createMockQueryResult([dbvalue]);
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
      roleNames: JSON.stringify(mockUser.roleNames),
      identities: JSON.stringify(restIdentities),
      customData: JSON.stringify(mockUser.customData),
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
