import { LogtoConfigs } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import { QueryType, expectSqlAssert } from '@/utils/test-utils';

import * as functions from '.';
import { databaseVersionKey } from './constants';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const {
  createLogtoConfigsTable,
  getCurrentDatabaseVersion,
  isLogtoConfigsTableExists,
  updateDatabaseVersion,
  getMigrationFiles,
  getUndeployedMigrations,
} = functions;
const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});
const { table, fields } = convertToIdentifiers(LogtoConfigs);
const existsSync = jest.fn();
const readdir = jest.fn();

jest.mock('fs', () => ({
  existsSync: () => existsSync(),
}));

jest.mock('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),
  readdir: async () => readdir(),
}));

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

describe('getCurrentDatabaseVersion()', () => {
  it('returns null if query failed (table not found)', async () => {
    mockQuery.mockRejectedValueOnce(new Error('table not found'));

    await expect(getCurrentDatabaseVersion(pool)).resolves.toBeNull();
  });

  it('returns null if the row is not found', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([databaseVersionKey]);

      return createMockQueryResult([]);
    });

    await expect(getCurrentDatabaseVersion(pool)).resolves.toBeNull();
  });

  it('returns null if the value is in bad format', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([databaseVersionKey]);

      return createMockQueryResult([{ value: 'some_version' }]);
    });

    await expect(getCurrentDatabaseVersion(pool)).resolves.toBeNull();
  });

  it('returns the version from database', async () => {
    const expectSql = sql`
      select * from ${table} where ${fields.key}=$1
    `;
    const version = 'version';

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([databaseVersionKey]);

      // @ts-expect-error createMockQueryResult doesn't support jsonb
      return createMockQueryResult([{ value: { version, updatedAt: 'now' } }]);
    });

    await expect(getCurrentDatabaseVersion(pool)).resolves.toEqual(version);
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

describe('updateDatabaseVersion()', () => {
  const expectSql = sql`
    insert into ${table} (${fields.key}, ${fields.value}) 
      values ($1, $2)
      on conflict (${fields.key}) do update set ${fields.value}=excluded.${fields.value}
  `;
  const version = 'version';
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

    await updateDatabaseVersion(pool, version);
    expect(mockCreateLogtoConfigsTable).toHaveBeenCalled();
  });

  it('sends upsert sql with version and updatedAt', async () => {
    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([databaseVersionKey, JSON.stringify({ version, updatedAt })]);

      return createMockQueryResult([]);
    });
    jest.spyOn(functions, 'isLogtoConfigsTableExists').mockResolvedValueOnce(true);

    await updateDatabaseVersion(pool, version);
  });
});

describe('getMigrationFiles()', () => {
  it('returns [] if directory does not exist', async () => {
    existsSync.mockReturnValueOnce(false);
    await expect(getMigrationFiles()).resolves.toEqual([]);
  });

  it('returns files without "next"', async () => {
    existsSync.mockReturnValueOnce(true);
    readdir.mockResolvedValueOnce(['next.js', '1.0.0.js', '1.0.2.js', '1.0.1.js']);

    await expect(getMigrationFiles()).resolves.toEqual(['1.0.0.js', '1.0.2.js', '1.0.1.js']);
  });
});

describe('getUndeployedMigrations()', () => {
  beforeEach(() => {
    jest
      .spyOn(functions, 'getMigrationFiles')
      .mockResolvedValueOnce(['1.0.0.js', '1.0.2.js', '1.0.1.js']);
  });

  it('returns all files with right order if database version is null', async () => {
    jest.spyOn(functions, 'getCurrentDatabaseVersion').mockResolvedValueOnce(null);

    await expect(getUndeployedMigrations(pool)).resolves.toEqual([
      '1.0.0.js',
      '1.0.1.js',
      '1.0.2.js',
    ]);
  });

  it('returns files whose version is greater then database version', async () => {
    jest.spyOn(functions, 'getCurrentDatabaseVersion').mockResolvedValueOnce('1.0.0');

    await expect(getUndeployedMigrations(pool)).resolves.toEqual(['1.0.1.js', '1.0.2.js']);
  });
});
