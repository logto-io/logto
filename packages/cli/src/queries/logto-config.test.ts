import { AlterationStateKey, LogtoConfigs } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import type { QueryType } from '../test-utilities.js';
import { expectSqlAssert } from '../test-utilities.js';
import { updateDatabaseTimestamp, getCurrentDatabaseAlterationTimestamp } from './logto-config.js';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});
const { table, fields } = convertToIdentifiers(LogtoConfigs);
const timestamp = 1_663_923_776;

describe('getCurrentDatabaseAlterationTimestamp()', () => {
  it('returns 0 if query failed (table not found)', async () => {
    mockQuery.mockRejectedValueOnce({ code: '42P01' });

    await expect(getCurrentDatabaseAlterationTimestamp(pool)).resolves.toBe(0);
  });

  it('returns 0 if the row is not found', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([AlterationStateKey.AlterationState]);

      return createMockQueryResult([]);
    });

    await expect(getCurrentDatabaseAlterationTimestamp(pool)).resolves.toBe(0);
  });

  it('returns 0 if the value is in bad format', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([AlterationStateKey.AlterationState]);

      return createMockQueryResult([{ value: 'some_value' }]);
    });

    await expect(getCurrentDatabaseAlterationTimestamp(pool)).resolves.toBe(0);
  });

  it('returns the timestamp from database', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([AlterationStateKey.AlterationState]);

      // @ts-expect-error createMockQueryResult doesn't support jsonb
      return createMockQueryResult([{ value: { timestamp, updatedAt: 'now' } }]);
    });

    await expect(getCurrentDatabaseAlterationTimestamp(pool)).resolves.toEqual(timestamp);
  });
});

describe('updateDatabaseTimestamp()', () => {
  const expectSql = sql`
    insert into ${table} (${fields.key}, ${fields.value}) 
      values ($1, $2::jsonb)
      on conflict (${fields.key}) do update set ${fields.value}=excluded.${fields.value}
  `;
  const updatedAt = '2022-09-21T06:32:46.583Z';

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(updatedAt));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('sends upsert sql with timestamp and updatedAt', async () => {
    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        AlterationStateKey.AlterationState,
        JSON.stringify({ timestamp, updatedAt }),
      ]);

      return createMockQueryResult([]);
    });

    await updateDatabaseTimestamp(pool, timestamp);
  });
});
