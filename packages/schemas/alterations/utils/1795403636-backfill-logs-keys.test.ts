import { setTimeout as sleep } from 'node:timers/promises';

import { createMockPool, createMockQueryResult } from '@silverhand/slonik';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { backfillLogsKeys } from './1795403636-backfill-logs-keys.js';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn() }));

type Count = { tenantId: string; needed: number; overLong: number };
type Batch = { lastBatchId: string | null; scanned: number; filled: number };

const createPool = ({ counts, batches }: { counts: Count[][]; batches: Batch[] }) => {
  const countResults = counts.values();
  const batchResults = batches.values();
  const query = vi.fn(async (statement: string, _values: readonly unknown[]) => {
    if (statement.includes('group by tenant_id')) {
      return createMockQueryResult(countResults.next().value ?? []);
    }

    const { value: batch } = batchResults.next();

    if (!batch) {
      throw new Error('The walk asked for more batches than the fixture has.');
    }

    return createMockQueryResult([batch]);
  });
  const statements = (marker: string) =>
    query.mock.calls.filter(([statement]) => statement.includes(marker));

  return {
    pool: createMockPool({ query }),
    countStatements: () => statements('group by tenant_id').map(([statement]) => statement),
    fillStatements: () => statements('for no key update').map(([statement]) => statement),
    fillCursors: () => statements('for no key update').map(([, values]) => values[0]),
  };
};

describe('backfillLogsKeys()', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(vi.fn());
    vi.mocked(sleep).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes nothing when every row is filled', async () => {
    const { pool, countStatements, fillCursors } = createPool({ counts: [[]], batches: [] });

    await backfillLogsKeys(pool);

    expect(countStatements()).toHaveLength(1);
    expect(fillCursors()).toEqual([]);
  });

  it('only reports over-long rows when nothing else needs a fill', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { pool, fillCursors } = createPool({
      counts: [[{ tenantId: 'tenant-a', needed: 0, overLong: 2 }]],
      batches: [],
    });

    await backfillLogsKeys(pool);

    expect(fillCursors()).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('tenant-a: 2'));
  });

  // Two rows fit; one has a `userId` over 128 characters and one an `applicationId` over 2600 bytes.
  it('fills the rows that fit and reports the over-long ones', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { pool, fillCursors } = createPool({
      counts: [
        [{ tenantId: 'tenant-a', needed: 2, overLong: 2 }],
        [{ tenantId: 'tenant-a', needed: 0, overLong: 2 }],
      ],
      batches: [{ lastBatchId: 'id-4', scanned: 4, filled: 2 }],
    });

    await backfillLogsKeys(pool);

    expect(fillCursors()).toEqual(['']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('tenant-a: 2'));
  });

  it('fills a row only when every key fits, whatever its log key', async () => {
    const { pool, countStatements, fillStatements } = createPool({
      counts: [[{ tenantId: 'tenant-a', needed: 1, overLong: 0 }], []],
      batches: [{ lastBatchId: 'id-1', scanned: 1, filled: 1 }],
    });

    await backfillLogsKeys(pool);

    for (const statement of [...countStatements(), ...fillStatements()]) {
      expect(statement).toContain('payload_user_id is null');
      expect(statement).toContain(`payload->>'userId' is not null`);
      expect(statement).toContain(`coalesce(length(payload->>'userId'), 0) <= 128`);
      expect(statement).toContain(`coalesce(length(payload->>'hookId'), 0) <= 21`);
      expect(statement).toContain(`coalesce(octet_length(payload->>'applicationId'), 0) <= 2600`);
      expect(statement.replace('for no key update', '')).not.toMatch(/\bkey\b/);
    }

    expect(countStatements()[0]).toContain('filter (where not (');
  });

  it('walks the table in keyset batches', async () => {
    const { pool, fillCursors } = createPool({
      counts: [[{ tenantId: 'tenant-a', needed: 1500, overLong: 0 }], []],
      batches: [
        { lastBatchId: 'id-1000', scanned: 1000, filled: 1000 },
        { lastBatchId: 'id-1500', scanned: 500, filled: 500 },
      ],
    });

    await backfillLogsKeys(pool);

    expect(fillCursors()).toEqual(['', 'id-1000']);
  });

  it('pauses only after a batch that wrote rows', async () => {
    const { pool } = createPool({
      counts: [[{ tenantId: 'tenant-a', needed: 1, overLong: 0 }], []],
      batches: [
        { lastBatchId: 'id-1000', scanned: 1000, filled: 0 },
        { lastBatchId: 'id-2000', scanned: 1000, filled: 1 },
        { lastBatchId: null, scanned: 0, filled: 0 },
      ],
    });

    await backfillLogsKeys(pool);

    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('stops at an empty batch', async () => {
    const { pool, fillCursors } = createPool({
      counts: [[{ tenantId: 'tenant-a', needed: 1, overLong: 0 }], []],
      batches: [
        { lastBatchId: 'id-1000', scanned: 1000, filled: 1000 },
        { lastBatchId: null, scanned: 0, filled: 0 },
      ],
    });

    await backfillLogsKeys(pool);

    expect(fillCursors()).toEqual(['', 'id-1000']);
  });

  it('throws when rows are still unfilled after the fill', async () => {
    const { pool } = createPool({
      counts: [
        [{ tenantId: 'tenant-a', needed: 2, overLong: 0 }],
        [{ tenantId: 'tenant-a', needed: 1, overLong: 0 }],
      ],
      batches: [{ lastBatchId: 'id-2', scanned: 2, filled: 1 }],
    });

    await expect(backfillLogsKeys(pool)).rejects.toThrow('tenant-a: 1');
  });
});
