import { Logs } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';
import { expectSqlAssert, type QueryType } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});

const { createLogQueries } = await import('./log.js');
const { deleteLogsBefore } = createLogQueries(pool);

const { table, fields } = convertToIdentifiers(Logs);

describe('deleteLogsBefore()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  it('deletes with only an exclusive upper bound and no tenant predicate', async () => {
    // The `RETURNING` rows are deliberately out of order so that a first/last read instead of
    // a min/max fold would produce the wrong range.
    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(
        query,
        sql`
          delete from ${table}
          where ${fields.id} in (
            select ${fields.id}
            from ${table}
            where ${fields.createdAt} < to_timestamp($1::double precision / 1000)
            order by ${fields.createdAt}, ${fields.id}
            limit $2
          )
          returning ${fields.createdAt}
        `.sql
      );
      // Tenant isolation is enforced by RLS; the statement must not carry a tenant predicate.
      expect(query).not.toContain('tenant_id');
      expect(values).toEqual([5000, 100]);

      return createMockQueryResult([{ createdAt: 3000 }, { createdAt: 1000 }]);
    });

    await expect(deleteLogsBefore({ before: 5000, limit: 100 })).resolves.toEqual({
      deletedCount: 2,
      deletedRange: { oldest: 1000, newest: 3000 },
    });
  });

  it('adds an exclusive lower bound when `after` is provided', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(
        query,
        sql`
          delete from ${table}
          where ${fields.id} in (
            select ${fields.id}
            from ${table}
            where ${fields.createdAt} < to_timestamp($1::double precision / 1000)
              and ${fields.createdAt} > to_timestamp($2::double precision / 1000)
            order by ${fields.createdAt}, ${fields.id}
            limit $3
          )
          returning ${fields.createdAt}
        `.sql
      );
      expect(values).toEqual([5000, 1500, 10]);

      return createMockQueryResult([{ createdAt: 2000 }, { createdAt: 1600 }]);
    });

    await expect(deleteLogsBefore({ before: 5000, after: 1500, limit: 10 })).resolves.toEqual({
      deletedCount: 2,
      deletedRange: { oldest: 1600, newest: 2000 },
    });
  });

  it('treats `after: 0` as a real bound rather than "absent"', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(
        query,
        sql`
          delete from ${table}
          where ${fields.id} in (
            select ${fields.id}
            from ${table}
            where ${fields.createdAt} < to_timestamp($1::double precision / 1000)
              and ${fields.createdAt} > to_timestamp($2::double precision / 1000)
            order by ${fields.createdAt}, ${fields.id}
            limit $3
          )
          returning ${fields.createdAt}
        `.sql
      );
      expect(values).toEqual([5000, 0, 10]);

      return createMockQueryResult([]);
    });

    await expect(deleteLogsBefore({ before: 5000, after: 0, limit: 10 })).resolves.toEqual({
      deletedCount: 0,
    });
  });

  it('omits the range when nothing was deleted', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([]));

    await expect(deleteLogsBefore({ before: 5000, limit: 10 })).resolves.toEqual({
      deletedCount: 0,
    });
  });
});
