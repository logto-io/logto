import {
  type LogtoConfigKey,
  LogtoConfigs,
  LogtoOidcConfigKey,
  LogtoTenantConfigKey,
  OidcSigningKeyStatus,
} from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { createMockCommonQueryMethods, expectSqlString } from '#src/test-utils/query.js';
import { MockWellKnownCache } from '#src/test-utils/tenant.js';
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
  getSigningKeyRotationState,
  upsertSigningKeyRotationState,
  updateAdminConsoleConfig,
  updateOidcConfigsByKey,
  updatePrivateSigningKeysAndRotationState,
} = createLogtoConfigQueries(pool, new MockWellKnownCache());

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
      insert into ${table} (${fields.key}, ${fields.value})
        values (${LogtoOidcConfigKey.PrivateKeys}, ${sql.jsonb(targetValue)})
        on conflict (${fields.tenantId}, ${fields.key}) do update set ${fields.value} = ${sql.jsonb(
          targetValue
        )}
        returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toMatchObject([
        LogtoOidcConfigKey.PrivateKeys,
        JSON.stringify(targetValue),
        JSON.stringify(targetValue),
      ]);

      return createMockQueryResult(targetRowData);
    });

    void updateOidcConfigsByKey(LogtoOidcConfigKey.PrivateKeys, targetValue);
  });

  test('getSigningKeyRotationState', async () => {
    const rowData = [
      {
        key: LogtoTenantConfigKey.SigningKeyRotationState,
        value: { signingKeyRotationAt: 123_456_789 },
      },
    ];
    const expectSql = sql`
      select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
        where ${fields.key} in (${sql.join([LogtoTenantConfigKey.SigningKeyRotationState], sql`,`)})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([LogtoTenantConfigKey.SigningKeyRotationState]);

      return createMockQueryResult(rowData as never);
    });

    const result = await getSigningKeyRotationState();
    expect(result).toEqual({ signingKeyRotationAt: 123_456_789 });
  });

  test('upsertSigningKeyRotationState', async () => {
    const targetValue = { tenantCacheExpiresAt: 123_456_789 };
    const targetRowData = { value: targetValue };
    const expectSql = sql`
      insert into ${table} (${fields.key}, ${fields.value})
        values (${LogtoTenantConfigKey.SigningKeyRotationState}, ${sql.jsonb(targetValue)})
        on conflict (${fields.tenantId}, ${fields.key}) do update
        set ${fields.value} = coalesce(${table}.${fields.value}, '{}'::jsonb) || ${sql.jsonb(
          targetValue
        )}
        returning ${fields.value}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toMatchObject([
        LogtoTenantConfigKey.SigningKeyRotationState,
        JSON.stringify(targetValue),
        JSON.stringify(targetValue),
      ]);

      return createMockQueryResult([targetRowData] as never);
    });

    const result = await upsertSigningKeyRotationState(targetValue);
    expect(result).toEqual(targetValue);
  });
});

describe('logto config transactional queries', () => {
  const methods = createMockCommonQueryMethods();
  const transactionalQueries = createLogtoConfigQueries(methods as never, new MockWellKnownCache());

  test('updatePrivateSigningKeysAndRotationState', async () => {
    const privateKeys = [
      {
        id: 'foo',
        value: 'bar',
        createdAt: 123_456_789,
        status: OidcSigningKeyStatus.Next,
      },
    ];
    const rotationState = { tenantCacheExpiresAt: 222_222_222 };

    methods.transaction.mockImplementation(
      async (handler: (transaction: typeof methods) => Promise<unknown>) => handler(methods)
    );
    methods.query.mockResolvedValueOnce({ rows: [] });
    methods.one
      .mockResolvedValueOnce({
        key: LogtoOidcConfigKey.PrivateKeys,
        value: privateKeys,
      })
      .mockResolvedValueOnce({
        value: rotationState,
      });

    const result = await transactionalQueries.updatePrivateSigningKeysAndRotationState(
      privateKeys,
      rotationState
    );

    expect(methods.transaction).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledWith(expectSqlString('for update'));
    expect(methods.one).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      privateKeys,
      signingKeyRotationState: rotationState,
    });
  });
});
