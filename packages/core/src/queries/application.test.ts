import { Applications } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';
import { snakeCase } from 'snake-case';

import { mockApplication } from '#src/__mocks__/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import {
  convertToIdentifiers,
  convertToPrimitiveOrSql,
  excludeAutoSetFields,
} from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createApplicationQueries } = await import('./application.js');
const {
  findTotalNumberOfApplications,
  findApplicationById,
  insertApplication,
  updateApplicationById,
  deleteApplicationById,
} = createApplicationQueries(pool);

describe('application query', () => {
  const { table, fields } = convertToIdentifiers(Applications);

  it('findTotalNumberOfApplications', async () => {
    const expectSql = sql`
      select count(*)
      from ${table}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(expectSql.values);

      return createMockQueryResult([{ count: 10 }]);
    });

    await expect(findTotalNumberOfApplications()).resolves.toEqual({ count: 10 });
  });

  it('findApplicationById', async () => {
    const id = 'foo';
    const rowData = { id };

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([rowData]);
    });

    await findApplicationById(id);
  });

  it('insertApplication', async () => {
    const keys = excludeAutoSetFields(Applications.fieldKeys);

    const expectSql = `
      insert into "applications" (${keys.map((k) => `"${snakeCase(k)}"`).join(', ')})
      values (${keys.map((_, index) => `$${index + 1}`).join(', ')})
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      const rowData = { id: 'foo' };
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual(keys.map((k) => convertToPrimitiveOrSql(k, mockApplication[k])));

      return createMockQueryResult([rowData]);
    });

    await insertApplication(mockApplication);
  });

  it('updateApplicationById', async () => {
    const id = 'foo';
    const description = 'des';

    const expectSql = sql`
      update ${table}
      set ${fields.description}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([description, id]);

      return createMockQueryResult([{ id, description }]);
    });

    await updateApplicationById(id, { description });
  });

  it('deleteApplicationById', async () => {
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([{ id }]);
    });

    await deleteApplicationById(id);
  });

  it('deleteApplicationById throw error if return row count is 0', async () => {
    const id = 'foo';

    mockQuery.mockImplementationOnce(async () => {
      return createMockQueryResult([]);
    });

    await expect(deleteApplicationById(id)).rejects.toMatchError(
      new DeletionError(Applications.table, id)
    );
  });
});
