import { createMockPool, createMockQueryResult } from '@silverhand/slonik';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { backfillOidcModelInstanceKeys } from './1795399551-backfill-oidc-model-instance-keys.js';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn() }));

type Count = { modelName: string; needed: number; overLong: number };
type Batch = { lastBatchId: string | null; scanned: number; filled: number };

const createPool = ({ counts, batches }: { counts: Count[][]; batches: Batch[] }) => {
  const countResults = counts.values();
  const batchResults = batches.values();
  const query = vi.fn(async (statement: string, _values: readonly unknown[]) => {
    if (statement.includes('from tenants')) {
      return createMockQueryResult([{ id: 'tenant-a' }]);
    }

    if (statement.includes('group by model_name')) {
      return createMockQueryResult(countResults.next().value ?? []);
    }

    const { value: batch } = batchResults.next();

    if (!batch) {
      throw new Error('The walk asked for more batches than the fixture has.');
    }

    return createMockQueryResult([batch]);
  });

  return {
    pool: createMockPool({ query }),
    fillCursors: () =>
      query.mock.calls
        .filter(([statement]) => statement.includes('for no key update'))
        .map(([, values]) => values[2]),
  };
};

describe('backfillOidcModelInstanceKeys()', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes nothing when every live row is filled', async () => {
    const { pool, fillCursors } = createPool({ counts: [[]], batches: [] });

    await backfillOidcModelInstanceKeys(pool);

    expect(fillCursors()).toEqual([]);
  });

  it('only reports over-long rows when nothing else needs a fill', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { pool, fillCursors } = createPool({
      counts: [[{ modelName: 'Grant', needed: 0, overLong: 1 }]],
      batches: [],
    });

    await backfillOidcModelInstanceKeys(pool);

    expect(fillCursors()).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('tenant-a/Grant: 1'));
  });

  it('walks past an over-long row and reports it instead of throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { pool, fillCursors } = createPool({
      counts: [
        [{ modelName: 'Session', needed: 1500, overLong: 1 }],
        [{ modelName: 'Session', needed: 0, overLong: 1 }],
      ],
      batches: [
        { lastBatchId: 'id-1000', scanned: 1000, filled: 999 },
        { lastBatchId: 'id-1501', scanned: 501, filled: 501 },
      ],
    });

    await backfillOidcModelInstanceKeys(pool);

    expect(fillCursors()).toEqual(['', 'id-1000']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('tenant-a/Session: 1'));
  });

  it('stops at an empty batch', async () => {
    const { pool, fillCursors } = createPool({
      counts: [[{ modelName: 'Grant', needed: 1, overLong: 0 }], []],
      batches: [
        { lastBatchId: 'id-1000', scanned: 1000, filled: 1000 },
        { lastBatchId: null, scanned: 0, filled: 0 },
      ],
    });

    await backfillOidcModelInstanceKeys(pool);

    expect(fillCursors()).toEqual(['', 'id-1000']);
  });

  it('throws when rows are still unfilled after the fill', async () => {
    const { pool } = createPool({
      counts: [
        [{ modelName: 'Grant', needed: 2, overLong: 0 }],
        [{ modelName: 'Grant', needed: 1, overLong: 0 }],
      ],
      batches: [{ lastBatchId: 'id-2', scanned: 2, filled: 1 }],
    });

    await expect(backfillOidcModelInstanceKeys(pool)).rejects.toThrow('tenant-a/Grant: 1');
  });
});
