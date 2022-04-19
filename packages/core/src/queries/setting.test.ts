import { Settings } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockSetting } from '@/__mocks__';
import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import { defaultSettingId, getSetting, updateSetting } from './setting';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

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
    const customDomain = 'logto.io';

    const expectSql = sql`
      update ${table}
      set ${fields.customDomain}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([customDomain, defaultSettingId]);

      return createMockQueryResult([dbvalue]);
    });

    await expect(updateSetting({ customDomain })).resolves.toEqual(dbvalue);
  });
});
