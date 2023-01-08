import { Settings } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockSetting } from '#src/__mocks__/index.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { defaultSettingId, createSettingQueries } = await import('./setting.js');
const { getSetting, updateSetting } = createSettingQueries(pool);

describe('setting query', () => {
  const { table, fields } = convertToIdentifiers(Settings);
  const databaseValue = { ...mockSetting, adminConsole: JSON.stringify(mockSetting.adminConsole) };

  it('getSetting', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([defaultSettingId]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(getSetting()).resolves.toEqual(databaseValue);
  });

  it('updateSetting', async () => {
    const { adminConsole } = mockSetting;

    const expectSql = sql`
      update ${table}
      set
      ${fields.adminConsole}=
      coalesce("admin_console",'{}'::jsonb)|| $1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([JSON.stringify(adminConsole), defaultSettingId]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(updateSetting({ adminConsole })).resolves.toEqual(databaseValue);
  });
});
