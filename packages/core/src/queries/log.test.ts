import { interaction, token } from '@logto/schemas';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import type { QueryType } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});

const { createLogQueries } = await import('./log.js');
const { countLogs, findLogs, findLogById, deleteLogsInRange, getHookExecutionStatsByHookId } =
  createLogQueries(pool);

beforeEach(() => {
  mockQuery.mockReset();
});

describe('findLogs()', () => {
  it('filters the payload keys by their columns', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expect(statement).toContain('"payload_user_id"=$1');
      expect(statement).toContain('"payload_application_id"=$2');
      expect(statement).toContain('"payload_hook_id"=$3');
      expect(statement).not.toContain('->>');
      expect(values).toEqual(['user-1', 'application-1', 'hook-1', 20, 0]);

      return createMockQueryResult([]);
    });

    await findLogs(20, 0, {
      payload: { userId: 'user-1', applicationId: 'application-1', hookId: 'hook-1' },
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('keeps the key prefix filter next to the column', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expect(statement).toContain('("key" like $1 or "key" like $2)');
      expect(statement).toContain('"payload_user_id"=$3');
      expect(values).toEqual(['ExchangeTokenBy%', 'Interaction%', 'user-1', 20, 0]);

      return createMockQueryResult([]);
    });

    await findLogs(20, 0, {
      payload: { userId: 'user-1' },
      includeKeyPrefix: [token.Type.ExchangeTokenBy, interaction.prefix],
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('skips payload keys without a value', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      expect(String(query)).not.toContain('where');
      expect(values).toEqual([20, 0]);

      return createMockQueryResult([]);
    });

    await findLogs(20, 0, { payload: { userId: undefined, applicationId: '' } });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});

describe('log reads', () => {
  const storedLog = {
    id: 'log-1',
    key: 'Interaction.SignIn.Submit',
    payload: {
      key: 'Interaction.SignIn.Submit',
      result: 'Success',
      params: { password: 'plain-password' },
      interaction: {
        mfa: { backupCode: { type: 'BackupCode', codes: ['a1b2c3d4e5'] } },
        verificationRecords: [{ id: 'verification-1', backupCodes: ['a1b2c3d4e5'] }],
      },
    },
  };
  const maskedPayload = {
    key: 'Interaction.SignIn.Submit',
    result: 'Success',
    params: { password: '******' },
    interaction: {
      mfa: { backupCode: { type: 'BackupCode', codes: '******' } },
      verificationRecords: [{ id: 'verification-1', backupCodes: '******' }],
    },
  };

  it('masks stored secrets in findLogs()', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([storedLog] as never));

    await expect(findLogs(20, 0, {})).resolves.toEqual([{ ...storedLog, payload: maskedPayload }]);
  });

  it('masks stored secrets in findLogById()', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([storedLog] as never));

    await expect(findLogById('log-1')).resolves.toEqual({ ...storedLog, payload: maskedPayload });
  });
});

describe('countLogs()', () => {
  it('caps the count filtered by a column', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expect(statement).toContain('"payload_hook_id"=$1');
      expect(statement).toContain('limit $2');
      expect(values).toEqual(['hook-1', 10_001]);

      return createMockQueryResult([{ count: '10001' }]);
    });

    await expect(countLogs({ payload: { hookId: 'hook-1' } }, { capped: true })).resolves.toEqual({
      count: 10_001,
      isCapped: true,
    });
  });
});

describe('getHookExecutionStatsByHookId()', () => {
  it('filters by the hook id column and excludes retrying logs', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expect(statement).toContain('"payload_hook_id" = $2');
      expect(statement).toContain(`not ("payload" ? 'nextAttemptAt')`);
      expect(statement).not.toContain(`->>'hookId'`);
      expect(values).toEqual([expect.any(Number), 'hook-1']);

      return createMockQueryResult([{ requestCount: 1, successCount: 1 }]);
    });

    await expect(getHookExecutionStatsByHookId('hook-1')).resolves.toEqual({
      requestCount: 1,
      successCount: 1,
    });
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
