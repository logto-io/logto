import { LogtoConfigKey, LogtoConfigs } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import { QueryType, expectSqlAssert } from '@/utils/test-utils';

import * as functions from '.';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const {
  createLogtoConfigsTable,
  isLogtoConfigsTableExists,
  updateDatabaseTimestamp,
  getCurrentDatabaseTimestamp,
  getUndeployedAlterations,
} = functions;
const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});
const { table, fields } = convertToIdentifiers(LogtoConfigs);
const timestamp = 1_663_923_776;

describe('isLogtoConfigsTableExists()', () => {
  it('generates "select exists" sql and query for result', async () => {
    const expectSql = sql`
      select exists (
        select from 
          pg_tables
        where 
          tablename = $1
        );
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([LogtoConfigs.table]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(isLogtoConfigsTableExists(pool)).resolves.toEqual(true);
  });
});

describe('getCurrentDatabaseTimestamp()', () => {
  it('returns null if query failed (table not found)', async () => {
    mockQuery.mockRejectedValueOnce(new Error('table not found'));

    await expect(getCurrentDatabaseTimestamp(pool)).resolves.toBeNull();
  });

  it('returns null if the row is not found', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([LogtoConfigKey.AlterationState]);

      return createMockQueryResult([]);
    });

    await expect(getCurrentDatabaseTimestamp(pool)).resolves.toBeNull();
  });

  it('returns null if the value is in bad format', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([LogtoConfigKey.AlterationState]);

      return createMockQueryResult([{ value: 'some_value' }]);
    });

    await expect(getCurrentDatabaseTimestamp(pool)).resolves.toBeNull();
  });

  it('returns the timestamp from database', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([LogtoConfigKey.AlterationState]);

      // @ts-expect-error createMockQueryResult doesn't support jsonb
      return createMockQueryResult([{ value: { timestamp, updatedAt: 'now' } }]);
    });

    await expect(getCurrentDatabaseTimestamp(pool)).resolves.toEqual(timestamp);
  });
});

describe('createLogtoConfigsTable()', () => {
  it('sends sql to create target table', async () => {
    mockQuery.mockImplementationOnce(async (sql, values) => {
      expect(sql).toContain(LogtoConfigs.table);
      expect(sql).toContain('create table');

      return createMockQueryResult([]);
    });

    await createLogtoConfigsTable(pool);
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

  it('calls createLogtoConfigsTable() if table does not exist', async () => {
    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);

      return createMockQueryResult([]);
    });

    const mockCreateLogtoConfigsTable = jest
      .spyOn(functions, 'createLogtoConfigsTable')
      .mockImplementationOnce(jest.fn());
    jest.spyOn(functions, 'isLogtoConfigsTableExists').mockResolvedValueOnce(false);

    await updateDatabaseTimestamp(pool, timestamp);
    expect(mockCreateLogtoConfigsTable).toHaveBeenCalled();
  });

  it('sends upsert sql with timestamp and updatedAt', async () => {
    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        LogtoConfigKey.AlterationState,
        JSON.stringify({ timestamp, updatedAt }),
      ]);

      return createMockQueryResult([]);
    });
    jest.spyOn(functions, 'isLogtoConfigsTableExists').mockResolvedValueOnce(true);

    await updateDatabaseTimestamp(pool, timestamp);
  });
});

describe('getUndeployedAlterations()', () => {
  beforeEach(() => {
    jest
      .spyOn(functions, 'getAlterationFiles')
      .mockResolvedValueOnce([
        '1.0.0-1663923770-a.js',
        '1.0.0-1663923772-c.js',
        '1.0.0-1663923771-b.js',
      ]);
  });

  it('returns all files with right order if database timestamp is null', async () => {
    jest.spyOn(functions, 'getCurrentDatabaseTimestamp').mockResolvedValueOnce(null);

    await expect(getUndeployedAlterations(pool)).resolves.toEqual([
      '1.0.0-1663923770-a.js',
      '1.0.0-1663923771-b.js',
      '1.0.0-1663923772-c.js',
    ]);
  });

  it('returns files whose timestamp is greater then database timstamp', async () => {
    jest.spyOn(functions, 'getCurrentDatabaseTimestamp').mockResolvedValueOnce(1_663_923_770);

    await expect(getUndeployedAlterations(pool)).resolves.toEqual([
      '1.0.0-1663923771-b.js',
      '1.0.0-1663923772-c.js',
    ]);
  });
});
