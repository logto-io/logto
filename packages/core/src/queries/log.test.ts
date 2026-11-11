import { LogResult } from '@logto/schemas';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';
import type { QueryResultRow } from '@silverhand/slonik';

import type { QueryType } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});

const { createLogQueries } = await import('./log.js');
const { deleteLogsInRange, findLogsForExport } = createLogQueries(pool);

describe('findLogsForExport()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  it('selects the API fields plus an exact UTC cursor, ascending', async () => {
    const row = {
      tenantId: 'tenant',
      id: 'log-id',
      key: 'Interaction.SignIn',
      payload: { key: 'Interaction.SignIn', result: LogResult.Success },
      createdAt: 1000,
      createdAtCursor: '2020-09-13T12:26:40.001000Z',
    };

    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expect(statement).toContain('to_char(');
      expect(statement).toContain("at time zone 'UTC'");
      expect(statement).toContain('YYYY-MM-DD"T"HH24:MI:SS.US"Z"');
      expect(statement).toContain('as "created_at_cursor"');
      expect(statement).toContain('order by "created_at" asc');
      expect(statement).toContain('"id" asc');
      expect(statement).toContain('limit');
      expect(statement).not.toContain('payload_user_id');
      expect(statement).not.toContain('"key" like');
      expect(values).toEqual([5000, 100]);

      // The mock query result type only accepts primitive JSON values; the real row carries a
      // JSONB payload, which the test asserts through the returned object below.
      return createMockQueryResult([row as unknown as QueryResultRow]);
    });

    await expect(findLogsForExport(100, { endTime: 5000 })).resolves.toEqual([row]);
  });

  it('applies every filter and the keyset cursor in parameter order', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expect(statement).toContain('"key" like');
      expect(statement).toContain('"payload"->>');
      expect(statement).toContain('"key"=');
      expect(statement).toContain('"created_at" >=');
      expect(statement).toContain('"created_at" <');
      expect(statement).toContain('("created_at", "id") > (');
      expect(statement).toContain('::timestamptz');
      expect(values).toEqual([
        'Interaction%',
        'userId',
        'user-id',
        'applicationId',
        'application-id',
        'Interaction.SignIn',
        1000,
        5000,
        '2020-09-13T12:26:40.123456Z',
        'previous-log',
        10,
      ]);

      return createMockQueryResult([]);
    });

    await expect(
      findLogsForExport(10, {
        payload: { userId: 'user-id', applicationId: 'application-id' },
        logKey: 'Interaction.SignIn',
        includeKeyPrefix: ['Interaction'],
        startTime: 1000,
        endTime: 5000,
        after: { createdAt: '2020-09-13T12:26:40.123456Z', id: 'previous-log' },
      })
    ).resolves.toEqual([]);
  });

  it('orders descending for the newest-row range probe', async () => {
    mockQuery.mockImplementationOnce(async (query) => {
      const statement = String(query);

      expect(statement).toContain('order by "created_at" desc');
      expect(statement).toContain('"id" desc');
      expect(statement).toContain('limit');

      return createMockQueryResult([]);
    });

    await findLogsForExport(1, { endTime: 5000 }, 'desc');
  });

  it('keeps the inclusive upper bound and drops the cursor on the first page', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expect(statement).toContain(
        '"created_at" < to_timestamp($1::double precision / 1000) + interval \'1 millisecond\''
      );
      expect(statement).not.toContain('::timestamptz');
      expect(values).toEqual([5000, 10]);

      return createMockQueryResult([]);
    });

    await findLogsForExport(10, { endTime: 5000 });
  });
});

describe('deleteLogsInRange()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  it('deletes by ctid within the window and returns the affected range', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      // Keep the delete a bounded Tid Scan instead of a semi-join that scans the whole table.
      expect(statement).toContain('ctid = any(array(');
      expect(statement).toContain('order by');
      expect(statement).toContain('limit');

      // The window must be the one `GET /logs` applies: inclusive lower bound, and an upper bound
      // made inclusive at millisecond granularity.
      expect(statement).toContain('"created_at" >= to_timestamp($1::double precision / 1000)');
      expect(statement).toContain(
        `"created_at" < to_timestamp($2::double precision / 1000) + interval '1 millisecond'`
      );

      // No key filter: the delete covers every log row in the window, webhook delivery logs
      // included, which is what keeps the statement on the time index.
      expect(statement).not.toContain('"key"');

      // Tenant isolation is enforced by RLS; the statement must carry no tenant predicate.
      expect(statement).not.toContain('tenant_id');

      expect(values).toEqual([1000, 5000, 100]);

      // Out-of-order fixtures: a first/last read instead of a min/max fold would be wrong.
      return createMockQueryResult([{ createdAt: 3000 }, { createdAt: 1000 }]);
    });

    await expect(
      deleteLogsInRange({ endTime: 5000, startTime: 1000, limit: 100 })
    ).resolves.toEqual({
      deletedCount: 2,
      deletedRange: { oldest: 1000, newest: 3000 },
    });
  });

  it('omits the lower bound when no start time is given', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expect(statement).not.toContain('>= to_timestamp');
      expect(statement).toContain(
        `"created_at" < to_timestamp($1::double precision / 1000) + interval '1 millisecond'`
      );
      expect(values).toEqual([5000, 10]);

      return createMockQueryResult([{ createdAt: 2000 }]);
    });

    await expect(deleteLogsInRange({ endTime: 5000, limit: 10 })).resolves.toEqual({
      deletedCount: 1,
      deletedRange: { oldest: 2000, newest: 2000 },
    });
  });

  it('applies a start time of `0` as a real bound', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      expect(String(query)).toContain('"created_at" >= to_timestamp($1::double precision / 1000)');
      expect(values).toEqual([0, 5000, 10]);

      return createMockQueryResult([]);
    });

    await expect(deleteLogsInRange({ endTime: 5000, startTime: 0, limit: 10 })).resolves.toEqual({
      deletedCount: 0,
    });
  });

  it('omits the range when nothing was deleted', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([]));

    await expect(deleteLogsInRange({ endTime: 5000, limit: 10 })).resolves.toEqual({
      deletedCount: 0,
    });
  });
});
