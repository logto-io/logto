import { setTimeout as sleep } from 'node:timers/promises';

import { createMockPool, createMockQueryResult } from '@silverhand/slonik';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { backfillUsersLowerKeys } from './1795421620-backfill-users-lower-keys.js';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn() }));

type Count = { needed: number; overLong: number };
type Batch = { lastBatchId: string | null; scanned: number; filled: number };

const createPool = ({ counts, batches }: { counts: Count[]; batches: Batch[] }) => {
  const countResults = counts.values();
  const batchResults = batches.values();
  const query = vi.fn(async (statement: string, _values: readonly unknown[]) => {
    if (statement.includes('as over_long')) {
      const { value: count } = countResults.next();

      if (!count) {
        throw new Error('The backfill counted more often than the fixture has.');
      }

      return createMockQueryResult([count]);
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
    countStatements: () => statements('as over_long').map(([statement]) => statement),
    fillStatements: () => statements('for no key update').map(([statement]) => statement),
    fillCursors: () => statements('for no key update').map(([, values]) => values[0]),
  };
};

describe('backfillUsersLowerKeys()', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(vi.fn());
    vi.mocked(sleep).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes nothing when every user is filled', async () => {
    const { pool, countStatements, fillCursors } = createPool({
      counts: [{ needed: 0, overLong: 0 }],
      batches: [],
    });

    await backfillUsersLowerKeys(pool);

    expect(countStatements()).toHaveLength(1);
    expect(fillCursors()).toEqual([]);
  });

  it('fills pending users and warns about over-long ones', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { pool, fillCursors } = createPool({
      counts: [
        { needed: 2, overLong: 1 },
        { needed: 0, overLong: 1 },
      ],
      batches: [{ lastBatchId: 'id-3', scanned: 3, filled: 2 }],
    });

    await backfillUsersLowerKeys(pool);

    expect(fillCursors()).toEqual(['']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('1 users have an email or username'));
  });

  it('matches drifted rows and skips only values that do not fit', async () => {
    const { pool, countStatements, fillStatements } = createPool({
      counts: [
        { needed: 1, overLong: 0 },
        { needed: 0, overLong: 0 },
      ],
      batches: [{ lastBatchId: 'id-1', scanned: 1, filled: 1 }],
    });

    await backfillUsersLowerKeys(pool);

    for (const statement of [...countStatements(), ...fillStatements()]) {
      expect(statement).toContain('primary_email_lower is distinct from lower(primary_email)');
      expect(statement).toContain('username_lower is distinct from lower(username)');
      expect(statement).toContain('coalesce(length(lower(primary_email)), 0) <= 384');
      expect(statement).toContain('coalesce(length(lower(username)), 0) <= 384');
    }

    expect(fillStatements()[0]).toContain('skip locked');
    expect(countStatements()[0]).toContain('filter (where not (');
  });

  it('walks the table in keyset batches', async () => {
    const { pool, fillCursors } = createPool({
      counts: [
        { needed: 1500, overLong: 0 },
        { needed: 0, overLong: 0 },
      ],
      batches: [
        { lastBatchId: 'id-1000', scanned: 1000, filled: 1000 },
        { lastBatchId: 'id-1500', scanned: 500, filled: 500 },
      ],
    });

    await backfillUsersLowerKeys(pool);

    expect(fillCursors()).toEqual(['', 'id-1000']);
  });

  it('pauses only after a batch that wrote rows', async () => {
    const { pool } = createPool({
      counts: [
        { needed: 1, overLong: 0 },
        { needed: 0, overLong: 0 },
      ],
      batches: [
        { lastBatchId: 'id-1000', scanned: 1000, filled: 0 },
        { lastBatchId: 'id-2000', scanned: 1000, filled: 1 },
        { lastBatchId: null, scanned: 0, filled: 0 },
      ],
    });

    await backfillUsersLowerKeys(pool);

    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('throws with the count and the drift query when users stay unfilled', async () => {
    const { pool } = createPool({
      counts: [
        { needed: 2, overLong: 0 },
        { needed: 1, overLong: 0 },
      ],
      batches: [{ lastBatchId: 'id-2', scanned: 2, filled: 1 }],
    });

    await expect(backfillUsersLowerKeys(pool)).rejects.toThrow(
      /^1 users still .* select tenant_id, id from users where \( primary_email_lower is distinct from lower\(primary_email\) or username_lower is distinct from lower\(username\) \)$/
    );
  });
});
