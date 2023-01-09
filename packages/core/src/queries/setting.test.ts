import { Settings } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockSetting } from '#src/__mocks__/index.js';
import envSet from '#src/env-set/index.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

const { defaultSettingId, getSetting, updateSetting } = await import('./setting.js');

describe('setting query', () => {
  const { table, fields } = convertToIdentifiers(Settings);
  const dbvalue = { ...mockSetting, adminConsole: JSON.stringify(mockSetting.adminConsole) };

  it('getSetting', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([defaultSettingId]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(getSetting()).resolves.toEqual(dbvalue);
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

      return createMockQueryResult([dbvalue]);
    });

    await expect(updateSetting({ adminConsole })).resolves.toEqual(dbvalue);
  });
});
