import { interaction, type AuditLogPrefix } from '@logto/schemas';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import type { QueryType } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});

const { createLogQueries } = await import('./log.js');
const { deleteLogsInRange } = createLogQueries(pool);

const auditPrefix = interaction.prefix;
const includeKeyPrefix: AuditLogPrefix[] = [auditPrefix];

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
      expect(statement).toContain('"created_at" >= to_timestamp($2::double precision / 1000)');
      expect(statement).toContain(
        `"created_at" < to_timestamp($3::double precision / 1000) + interval '1 millisecond'`
      );

      // Only the requested key prefixes are in scope, so webhook delivery logs are left alone.
      expect(statement).toContain('"key" like $1');

      // Tenant isolation is enforced by RLS; the statement must carry no tenant predicate.
      expect(statement).not.toContain('tenant_id');

      expect(values).toEqual([`${auditPrefix}%`, 1000, 5000, 100]);

      // Out-of-order fixtures: a first/last read instead of a min/max fold would be wrong.
      return createMockQueryResult([{ createdAt: 3000 }, { createdAt: 1000 }]);
    });

    await expect(
      deleteLogsInRange({ endTime: 5000, startTime: 1000, limit: 100, includeKeyPrefix })
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
        `"created_at" < to_timestamp($2::double precision / 1000) + interval '1 millisecond'`
      );
      expect(values).toEqual([`${auditPrefix}%`, 5000, 10]);

      return createMockQueryResult([{ createdAt: 2000 }]);
    });

    await expect(
      deleteLogsInRange({ endTime: 5000, limit: 10, includeKeyPrefix })
    ).resolves.toEqual({ deletedCount: 1, deletedRange: { oldest: 2000, newest: 2000 } });
  });

  it('applies a start time of `0` as a real bound', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      expect(String(query)).toContain('"created_at" >= to_timestamp($2::double precision / 1000)');
      expect(values).toEqual([`${auditPrefix}%`, 0, 5000, 10]);

      return createMockQueryResult([]);
    });

    await expect(
      deleteLogsInRange({ endTime: 5000, startTime: 0, limit: 10, includeKeyPrefix })
    ).resolves.toEqual({ deletedCount: 0 });
  });

  it('omits the range when nothing was deleted', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([]));

    await expect(
      deleteLogsInRange({ endTime: 5000, limit: 10, includeKeyPrefix })
    ).resolves.toEqual({ deletedCount: 0 });
  });
});
