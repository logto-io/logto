import type { CreateOidcModelInstance } from '@logto/schemas';
import { Applications, OidcModelInstances } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { createMockOidcGrantInstance } from '#src/__mocks__/oidc-grant.js';
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

const { createOidcModelInstanceQueries } = await import('./oidc-model-instance.js');
const {
  upsertInstance,
  findPayloadById,
  findPayloadByPayloadField,
  findPayloadByUid,
  findPayloadByUserCode,
  consumeInstanceById,
  destroyInstanceById,
  revokeInstanceByGrantId,
  findUserActiveApplicationGrants,
} = createOidcModelInstanceQueries(pool);

describe('oidc-model-instance query', () => {
  const { table, fields } = convertToIdentifiers(OidcModelInstances);
  const { table: applicationTable } = convertToIdentifiers(Applications);
  const expiresAt = Date.now();
  const instance: CreateOidcModelInstance = {
    modelName: 'access_token',
    id: 'foo',
    payload: {},
    expiresAt,
  };
  const databaseValue = {
    ...instance,
    payload: JSON.stringify(instance.payload),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upsertInstance', async () => {
    const expectSql = sql`
      insert into ${table} ("model_name", "id", "payload", "expires_at")
      values ($1, $2, $3, to_timestamp($4::double precision / 1000))
      on conflict ("tenant_id", "model_name", "id") do update
      set "payload"=excluded."payload", "expires_at"=excluded."expires_at"
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        instance.modelName,
        instance.id,
        JSON.stringify(instance.payload),
        instance.expiresAt,
      ]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(upsertInstance(instance)).resolves.toEqual(databaseValue);
  });

  it('findPayloadById', async () => {
    const expectSql = sql`
      select ${fields.payload}, ${fields.consumedAt}
      from ${table}
      where "model_name"=$1
      and "id"=$2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([instance.modelName, instance.id]);

      return createMockQueryResult([{ consumedAt: 10 }]);
    });

    await expect(findPayloadById(instance.modelName, instance.id)).resolves.toEqual({
      consumed: true,
    });
  });

  it('findPayloadByPayloadField - single result', async () => {
    const uid_key = 'uid';
    const uid_value = 'foo';

    // Mock a single result
    mockQuery.mockImplementationOnce(async () => {
      // Simulate pool.any
      return createMockQueryResult([{ consumedAt: 10 }]);
    });

    await expect(
      findPayloadByPayloadField(instance.modelName, uid_key, uid_value)
    ).resolves.toEqual({
      consumed: true,
    });
  });

  it('findPayloadByPayloadField - multiple results (should delete and return null)', async () => {
    const uid_key = 'uid';
    const uid_value = 'foo';

    // Mock multiple results
    mockQuery
      .mockImplementationOnce(async () => {
        // Simulate pool.any
        return createMockQueryResult([{ uid: uid_value }, { uid: uid_value }]);
      })
      // @ts-expect-error - mock delete query
      .mockImplementationOnce(async () => {
        // Simulate delete query
        return { rowCount: 2 };
      });

    await expect(
      findPayloadByPayloadField(instance.modelName, uid_key, uid_value)
    ).resolves.toBeUndefined();

    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('findPayloadByPayloadField - no result', async () => {
    const uid_key = 'uid';
    const uid_value = 'foo';

    // Mock no result
    mockQuery.mockImplementationOnce(async () => {
      // Simulate pool.any
      return createMockQueryResult([]);
    });

    await expect(
      findPayloadByPayloadField(instance.modelName, uid_key, uid_value)
    ).resolves.toBeUndefined();
  });

  it('findPayloadByUid should use uid literal jsonb key', async () => {
    const uid = 'foo';
    const expectSql = sql`
      select ${fields.payload}, ${fields.consumedAt}
      from ${table}
      where ${fields.modelName}=$1
      and ${fields.payload}->>'uid'=$2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([instance.modelName, uid]);

      return createMockQueryResult([{ consumedAt: 10 }]);
    });

    await expect(findPayloadByUid(instance.modelName, uid)).resolves.toEqual({
      consumed: true,
    });
  });

  it('findPayloadByUid - multiple results should delete with uid literal jsonb key', async () => {
    const uid = 'foo';
    const selectSql = sql`
      select ${fields.payload}, ${fields.consumedAt}
      from ${table}
      where ${fields.modelName}=$1
      and ${fields.payload}->>'uid'=$2
    `;
    const deleteSql = sql`
      delete from ${table}
      where ${fields.modelName}=$1
      and ${fields.payload}->>'uid'=$2
    `;

    mockQuery
      .mockImplementationOnce(async (sql, values) => {
        expectSqlAssert(sql, selectSql.sql);
        expect(values).toEqual([instance.modelName, uid]);
        return createMockQueryResult([{ consumedAt: 10 }, { consumedAt: 20 }]);
      })
      // @ts-expect-error - mock delete query
      .mockImplementationOnce(async (sql, values) => {
        expectSqlAssert(sql, deleteSql.sql);
        expect(values).toEqual([instance.modelName, uid]);
        return { rowCount: 2 };
      });

    await expect(findPayloadByUid(instance.modelName, uid)).resolves.toBeUndefined();
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('findPayloadByUserCode should use userCode literal jsonb key', async () => {
    const userCode = 'code';
    const expectSql = sql`
      select ${fields.payload}, ${fields.consumedAt}
      from ${table}
      where ${fields.modelName}=$1
      and ${fields.payload}->>'userCode'=$2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([instance.modelName, userCode]);

      return createMockQueryResult([{ consumedAt: 10 }]);
    });

    await expect(findPayloadByUserCode(instance.modelName, userCode)).resolves.toEqual({
      consumed: true,
    });
  });

  it('findPayloadByUserCode - multiple results should delete with userCode literal jsonb key', async () => {
    const userCode = 'code';
    const selectSql = sql`
      select ${fields.payload}, ${fields.consumedAt}
      from ${table}
      where ${fields.modelName}=$1
      and ${fields.payload}->>'userCode'=$2
    `;
    const deleteSql = sql`
      delete from ${table}
      where ${fields.modelName}=$1
      and ${fields.payload}->>'userCode'=$2
    `;

    mockQuery
      .mockImplementationOnce(async (sql, values) => {
        expectSqlAssert(sql, selectSql.sql);
        expect(values).toEqual([instance.modelName, userCode]);
        return createMockQueryResult([{ consumedAt: 10 }, { consumedAt: 20 }]);
      })
      // @ts-expect-error - mock delete query
      .mockImplementationOnce(async (sql, values) => {
        expectSqlAssert(sql, deleteSql.sql);
        expect(values).toEqual([instance.modelName, userCode]);
        return { rowCount: 2 };
      });

    await expect(findPayloadByUserCode(instance.modelName, userCode)).resolves.toBeUndefined();
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('consumeInstanceById', async () => {
    jest.useFakeTimers().setSystemTime(100_000);

    const expectSql = sql`
      update ${table}
      set ${fields.consumedAt}=to_timestamp($1)
      where ${fields.modelName}=$2
      and ${fields.id}=$3
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([100, instance.modelName, instance.id]);

      return createMockQueryResult([]);
    });

    await consumeInstanceById(instance.modelName, instance.id);

    jest.useRealTimers();
  });

  it('destroyInstanceById', async () => {
    const expectSql = sql`
      delete from ${table}
      where ${fields.modelName}=$1
      and ${fields.id}=$2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([instance.modelName, instance.id]);

      return createMockQueryResult([]);
    });

    await destroyInstanceById(instance.modelName, instance.id);
  });

  it('revokeInstanceByGrantId', async () => {
    const grantId = 'grant';

    const expectSql = sql`
      delete from ${table}
      where ${fields.modelName}=$1
      and ${fields.payload} ? 'grantId'
      and ${fields.payload}->>'grantId'=$2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([instance.modelName, grantId]);

      return createMockQueryResult([]);
    });

    await revokeInstanceByGrantId(instance.modelName, grantId);
  });

  it('findUserActiveApplicationGrants with thirdparty', async () => {
    const userId = 'user-id';
    const expectSql = sql`
      select "oidc_model_instance"."id", "oidc_model_instance"."payload", "oidc_model_instance"."expires_at"
      from ${table} as "oidc_model_instance"
      inner join ${applicationTable} as "application"
        on "oidc_model_instance"."payload"->>'clientId'="application"."id"
      where "oidc_model_instance"."model_name"='Grant'
        and "oidc_model_instance"."payload"->>'accountId'=${userId}
        and "application"."is_third_party"=${true}
        and "oidc_model_instance"."expires_at" > to_timestamp($3)
    `;

    const grant = createMockOidcGrantInstance({
      payload: { kind: 'Grant', clientId: 'demo-app', accountId: userId },
    });

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([userId, true, expect.any(Number)]);

      return createMockQueryResult([grant as never]);
    });

    await expect(findUserActiveApplicationGrants(userId, 'thirdParty')).resolves.toEqual([grant]);
  });

  it('findUserActiveApplicationGrants with firstparty', async () => {
    const userId = 'user-id';
    const expectSql = sql`
      select "oidc_model_instance"."id", "oidc_model_instance"."payload", "oidc_model_instance"."expires_at"
      from ${table} as "oidc_model_instance"
      inner join ${applicationTable} as "application"
        on "oidc_model_instance"."payload"->>'clientId'="application"."id"
      where "oidc_model_instance"."model_name"='Grant'
        and "oidc_model_instance"."payload"->>'accountId'=${userId}
        and "application"."is_third_party"=${false}
        and "oidc_model_instance"."expires_at" > to_timestamp($3)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([userId, false, expect.any(Number)]);

      return createMockQueryResult([]);
    });

    await expect(findUserActiveApplicationGrants(userId, 'firstParty')).resolves.toEqual([]);
  });

  it('findUserActiveApplicationGrants with all', async () => {
    const userId = 'user-id';
    const expectSql = sql`
      select "oidc_model_instance"."id", "oidc_model_instance"."payload", "oidc_model_instance"."expires_at"
      from ${table} as "oidc_model_instance"
      inner join ${applicationTable} as "application"
        on "oidc_model_instance"."payload"->>'clientId'="application"."id"
      where "oidc_model_instance"."model_name"='Grant'
        and "oidc_model_instance"."payload"->>'accountId'=${userId}
        and "oidc_model_instance"."expires_at" > to_timestamp($2)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([userId, expect.any(Number)]);

      return createMockQueryResult([]);
    });

    await expect(findUserActiveApplicationGrants(userId)).resolves.toEqual([]);
  });
});
