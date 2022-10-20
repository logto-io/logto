import { OidcModelInstances, CreateOidcModelInstance } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import {
  upsertInstance,
  findPayloadById,
  findPayloadByPayloadField,
  consumeInstanceById,
  destroyInstanceById,
  revokeInstanceByGrantId,
} from './oidc-model-instance';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

jest.mock('@/database/utils', () => ({
  ...jest.requireActual('@/database/utils'),
  convertToTimestamp: () => 100,
}));

describe('oidc-model-instance query', () => {
  const { table, fields } = convertToIdentifiers(OidcModelInstances);
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

  it('upsertInstance', async () => {
    const expectSql = sql`
      insert into ${table} ("model_name", "id", "payload", "expires_at")
      values ($1, $2, $3, to_timestamp($4::double precision / 1000))
      on conflict ("model_name", "id") do update
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

  it('findPayloadByPayloadField', async () => {
    const uid_key = 'uid';
    const uid_value = 'foo';

    const expectSql = sql`
      select ${fields.payload}, ${fields.consumedAt}
      from ${table}
      where ${fields.modelName}=$1
      and ${fields.payload}->>$2=$3
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([instance.modelName, uid_key, uid_value]);

      return createMockQueryResult([{ consumedAt: 10 }]);
    });

    await expect(
      findPayloadByPayloadField(instance.modelName, uid_key, uid_value)
    ).resolves.toEqual({
      consumed: true,
    });
  });

  it('consumeInstanceById', async () => {
    const expectSql = sql`
      update ${table}
      set ${fields.consumedAt}=$1
      where ${fields.modelName}=$2
      and ${fields.id}=$3
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([100, instance.modelName, instance.id]);

      return createMockQueryResult([]);
    });

    await consumeInstanceById(instance.modelName, instance.id);
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
      and ${fields.payload}->>'grantId'=$2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([instance.modelName, grantId]);

      return createMockQueryResult([]);
    });

    await revokeInstanceByGrantId(instance.modelName, grantId);
  });
});
