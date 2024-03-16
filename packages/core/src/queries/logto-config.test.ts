import {
  type LogtoConfigKey,
  LogtoConfigs,
  LogtoOidcConfigKey,
  LogtoTenantConfigKey,
} from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';
import { expectSqlAssert, type QueryType } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createLogtoConfigQueries } = await import('./logto-config.js');

const {
  getAdminConsoleConfig,
  getCloudConnectionData,
  getRowsByKeys,
  updateAdminConsoleConfig,
  updateOidcConfigsByKey,
} = createLogtoConfigQueries(pool);

describe('connector queries', () => {
  const { table, fields } = convertToIdentifiers(LogtoConfigs);

  test('getAdminConsoleConfig', async () => {
    const rowData = { key: 'adminConsole', value: `{"signInExperienceCustomized": false}` };
    const expectSql = sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([LogtoTenantConfigKey.AdminConsole]);

      return createMockQueryResult([rowData]);
    });

    const result = await getAdminConsoleConfig();
    expect(result).toEqual(rowData);
  });

  test('updateAdminConsoleConfig', async () => {
    const targetValue = { signInExperienceCustomized: true };
    const targetRowData = { key: 'adminConsole', value: JSON.stringify(targetValue) };
    const expectSql = sql`
      update ${table}
      set ${fields.value} = coalesce(${fields.value},'{}'::jsonb) || ${sql.jsonb(targetValue)}
      where ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
      returning ${fields.value}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toMatchObject([
        JSON.stringify(targetValue),
        LogtoTenantConfigKey.AdminConsole,
      ]);

      return createMockQueryResult([targetRowData]);
    });

    const result = await updateAdminConsoleConfig(targetValue);
    expect(result).toEqual(targetRowData);
  });

  test('getCloudConnectionData', async () => {
    const rowData = {
      key: 'cloudConnection',
      value: `"appId": "abc", "resource": "https://foo.io/api"`,
    };
    const expectSql = sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${LogtoTenantConfigKey.CloudConnection}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([LogtoTenantConfigKey.CloudConnection]);

      return createMockQueryResult([rowData]);
    });

    const result = await getCloudConnectionData();
    expect(result).toEqual(rowData);
  });

  test('getRowsByKeys', async () => {
    const rowData = [
      { key: 'adminConsole', value: `{"signInExperienceCustomized": false}` },
      { key: 'oidc.privateKeys', value: `[{ "id": "foo", value: "bar", "createdAt": 123456789 }]` },
    ];
    const keys = rowData.map((row) => row.key) as LogtoConfigKey[];
    const expectSql = sql`
      select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
        where ${fields.key} in (${sql.join(keys, sql`,`)})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(keys);

      return createMockQueryResult(rowData);
    });

    const result = await getRowsByKeys(keys);
    expect(result.rows).toEqual(rowData);
  });

  test('updateOidcConfigsByKey', async () => {
    const targetValue = [{ id: 'foo', value: 'bar', createdAt: 123_456_789 }];
    const targetRowData = [
      { key: LogtoOidcConfigKey.PrivateKeys, value: JSON.stringify(targetValue) },
    ];

    const expectSql = sql`
      update ${table}
      set ${fields.value} = ${sql.jsonb(targetValue)}
      where ${fields.key} = ${LogtoOidcConfigKey.PrivateKeys}
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toMatchObject([JSON.stringify(targetValue), LogtoOidcConfigKey.PrivateKeys]);

      return createMockQueryResult(targetRowData);
    });

    void updateOidcConfigsByKey(LogtoOidcConfigKey.PrivateKeys, targetValue);
  });
});
