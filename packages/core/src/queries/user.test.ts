import { UserRole, Users } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockUser } from '@/__mocks__';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';
import type { QueryType } from '@/utils/test-utils';
import { expectSqlAssert } from '@/utils/test-utils';

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

  it('countUsers', async () => {
    const search = 'foo';
    const expectSql = sql`
      select count(*)
      from ${table}
      where ${fields.primaryEmail} ilike $1 or ${fields.primaryPhone} ilike $2 or ${fields.username} ilike $3 or ${fields.name} ilike $4
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(countUsers(search)).resolves.toEqual(dbvalue);
  });

  it('countUsers with hideAdminUser', async () => {
    const search = 'foo';
    const expectSql = sql`
      select count(*)
      from ${table}
      where not (${fields.roleNames}::jsonb?$1)
      and (${fields.primaryEmail} ilike $2 or ${fields.primaryPhone} ilike $3 or ${fields.username} ilike $4 or ${fields.name} ilike $5)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        UserRole.Admin,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
      ]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(countUsers(search, true)).resolves.toEqual(dbvalue);
  });

  it('countUsers with isCaseSensitive', async () => {
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

    await expect(countUsers(search, undefined, true)).resolves.toEqual(dbvalue);
  });

  it('findUsers', async () => {
    const search = 'foo';
    const limit = 100;
    const offset = 1;
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.primaryEmail} ilike $1 or ${fields.primaryPhone} ilike $2 or ${
      fields.username
    } ilike $3 or ${fields.name} ilike $4
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

  it('findUsers with hideAdminUser', async () => {
    const search = 'foo';
    const limit = 100;
    const offset = 1;
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where not (${fields.roleNames}::jsonb?$1)
      and (${fields.primaryEmail} ilike $2 or ${fields.primaryPhone} ilike $3 or ${
      fields.username
    } ilike $4 or ${fields.name} ilike $5)
      limit $6
      offset $7
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        UserRole.Admin,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        limit,
        offset,
      ]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(findUsers(limit, offset, search, true)).resolves.toEqual([dbvalue]);
  });

  it('findUsers with isSensitive', async () => {
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

    await expect(findUsers(limit, offset, search, undefined, true)).resolves.toEqual([dbvalue]);
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
