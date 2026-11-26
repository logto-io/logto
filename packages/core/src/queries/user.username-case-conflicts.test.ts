import { Users } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});
const { createUserQueries } = await import('./user.js');
const { findUsernameCaseConflicts, countUsernameCaseConflicts } = createUserQueries(pool);
const { table, fields } = convertToIdentifiers(Users);

describe('username case conflicts', () => {
  it('findUsernameCaseConflicts', async () => {
    const expectSql = sql`
      select ${fields.usernameLower} as "usernameLower",
             array_agg(${fields.id}) as "userIds"
      from ${table}
      where ${fields.usernameLower} is not null
      group by ${fields.usernameLower}
      having count(*) > 1
      order by min(${fields.createdAt})
      limit $1
    `;
    const conflict = { usernameLower: 'alice', userIds: ['id-1', 'id-2'] };

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([10]);

      return createMockQueryResult([conflict]);
    });

    await expect(findUsernameCaseConflicts(10)).resolves.toEqual([conflict]);
  });

  it('countUsernameCaseConflicts', async () => {
    const expectSql = sql`
      select count(*)::int from (
        select 1
        from ${table}
        where ${fields.usernameLower} is not null
        group by ${fields.usernameLower}
        having count(*) > 1
      ) as conflicts
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([]);

      return createMockQueryResult([{ count: 2 }]);
    });

    await expect(countUsernameCaseConflicts()).resolves.toEqual(2);
  });
});
