import { Roles } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockRole } from '@/__mocks__';
import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import { findAllRoles, findRolesByRoleNames } from './roles';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

describe('roles query', () => {
  const { table, fields } = convertToIdentifiers(Roles);

  it('findAllRoles', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([]);

      return createMockQueryResult([mockRole]);
    });

    await expect(findAllRoles()).resolves.toEqual([mockRole]);
  });

  it('findRolesByRoleNames', async () => {
    const roleNames = ['foo'];

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} in (${sql.join(roleNames, sql`, `)})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([roleNames.join(', ')]);

      return createMockQueryResult([mockRole]);
    });

    await expect(findRolesByRoleNames(roleNames)).resolves.toEqual([mockRole]);
  });
});
