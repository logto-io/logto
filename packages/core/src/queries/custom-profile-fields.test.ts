import { CustomProfileFields } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

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

const { createCustomProfileFieldsQueries } = await import('./custom-profile-fields.js');
const { deleteCustomProfileFieldsByName } = createCustomProfileFieldsQueries(pool);

describe('custom profile fields query', () => {
  const { table, fields } = convertToIdentifiers(CustomProfileFields);

  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('deleteCustomProfileFieldsByName', async () => {
    const name = 'company';
    const expectSql = sql`
      delete from ${table}
      where ${fields.name} = ${name}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(expectSql.values);

      return createMockQueryResult([{}]);
    });

    await deleteCustomProfileFieldsByName(name);
  });

  it('deleteCustomProfileFieldsByName throws error if return row count is 0', async () => {
    const name = 'company';

    mockQuery.mockImplementationOnce(async () => {
      return createMockQueryResult([]);
    });

    await expect(deleteCustomProfileFieldsByName(name)).rejects.toMatchError(
      new DeletionError(CustomProfileFields.table, name)
    );
  });
});
