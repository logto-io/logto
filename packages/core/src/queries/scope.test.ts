import { ResourceScopes } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { convertToIdentifiers, convertToPrimitiveOrSql } from '@/database/utils';
import { DeletionError } from '@/errors/SlonikError';
import { mockScope } from '@/utils/mock';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import { findAllScopesWithResourceId, insertScope, deleteScopeById } from './scope';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.mock('@/database/pool', () =>
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

describe('scope query', () => {
  const { table, fields } = convertToIdentifiers(ResourceScopes);

  it('findAllScopesWithResourceId', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.resourceId}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockScope.resourceId]);

      return createMockQueryResult([mockScope]);
    });

    await expect(findAllScopesWithResourceId(mockScope.resourceId)).resolves.toEqual([mockScope]);
  });

  it('insertScope', async () => {
    const expectSql = sql`
      insert into ${table} (${sql.join(Object.values(fields), sql`, `)})
      values (${sql.join(
        Object.values(fields).map((_, index) => `$${index + 1}`),
        sql`, `
      )})
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);

      expect(values).toEqual(
        ResourceScopes.fieldKeys.map((k) => convertToPrimitiveOrSql(k, mockScope[k]))
      );

      return createMockQueryResult([mockScope]);
    });

    await expect(insertScope(mockScope)).resolves.toEqual(mockScope);
  });

  it('deleteScopeById', async () => {
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockScope]);
    });

    await deleteScopeById(id);
  });

  it('deleteScopeById throw error if return row count is 0', async () => {
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

    await expect(deleteScopeById(id)).rejects.toMatchError(
      new DeletionError(ResourceScopes.table, id)
    );
  });
});
