import { UserLogs } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';
import { snakeCase } from 'snake-case';

import { mockUserLog } from '@/__mocks__';
import {
  convertToIdentifiers,
  excludeAutoSetFields,
  convertToPrimitiveOrSql,
} from '@/database/utils';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import { insertUserLog, findLogsByUserId } from './user-log';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.mock('@/database/pool', () =>
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

describe('user-log query', () => {
  const { table, fields } = convertToIdentifiers(UserLogs);
  const dbvalue = { ...mockUserLog, payload: JSON.stringify(mockUserLog.payload) };

  it('findLogsByUserId', async () => {
    const userId = 'foo';
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.userId}=${userId}
      order by created_at desc
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([userId]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(findLogsByUserId(userId)).resolves.toEqual([dbvalue]);
  });

  it('insertUserLog', async () => {
    const keys = excludeAutoSetFields(UserLogs.fieldKeys);

    // eslint-disable-next-line sql/no-unsafe-query
    const expectSql = `
      insert into "user_logs" (${keys.map((k) => `"${snakeCase(k)}"`).join(', ')})
      values (${keys.map((_, index) => `$${index + 1}`).join(', ')})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);
      expect(values).toEqual(keys.map((k) => convertToPrimitiveOrSql(k, mockUserLog[k])));

      return createMockQueryResult([]);
    });

    await insertUserLog(mockUserLog);
  });
});
