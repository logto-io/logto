import { setTimeout as sleep } from 'node:timers/promises';

import { createMockPool, createMockQueryResult } from '@silverhand/slonik';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { migrateMfaPolicyUserControlled } from './1795510038-migrate-mfa-policy-user-controlled.js';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn() }));

type Batch = {
  lastBatchTenantId: string | null;
  lastBatchId: string | null;
  scanned: number;
  migrated: number;
};

const createPool = ({ counts, batches }: { counts: number[]; batches: Batch[] }) => {
  const countResults = counts.values();
  const batchResults = batches.values();
  const query = vi.fn(async (statement: string, _values: readonly unknown[]) => {
    if (!statement.includes('for no key update')) {
      return createMockQueryResult([{ count: countResults.next().value ?? 0 }]);
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
    countStatements: () => statements("where mfa->>'policy' = 'UserControlled'"),
    batchStatements: () => statements('for no key update').map(([statement]) => statement),
    batchCursors: () => statements('for no key update').map(([, values]) => [values[0], values[1]]),
  };
};

describe('migrateMfaPolicyUserControlled()', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(vi.fn());
    vi.mocked(sleep).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes nothing when no row has UserControlled policy', async () => {
    const { pool, countStatements, batchCursors } = createPool({ counts: [0], batches: [] });

    await migrateMfaPolicyUserControlled(pool);

    expect(countStatements()).toHaveLength(1);
    expect(batchCursors()).toEqual([]);
  });

  it('migrates rows using jsonb_set with keyset order on (tenant_id, id)', async () => {
    const { pool, countStatements, batchStatements, batchCursors } = createPool({
      counts: [1, 0],
      batches: [{ lastBatchTenantId: 'default', lastBatchId: 'default', scanned: 1, migrated: 1 }],
    });

    await migrateMfaPolicyUserControlled(pool);

    expect(countStatements()).toHaveLength(2);
    expect(batchCursors()).toEqual([['', '']]);
    expect(batchStatements()[0]).toContain('(tenant_id, id) >');
    expect(batchStatements()[0]).toContain('order by tenant_id, id');
    expect(batchStatements()[0]).toContain("mfa->>'policy' = 'UserControlled'");
    expect(batchStatements()[0]).toContain(
      `jsonb_set(target.mfa, '{policy}', '"PromptAtSignInAndSignUp"')`
    );
  });

  it('walks the table in keyset batches', async () => {
    const { pool, batchCursors } = createPool({
      counts: [1500, 0],
      batches: [
        { lastBatchTenantId: 'tenant-a', lastBatchId: 'id-1000', scanned: 1000, migrated: 1000 },
        { lastBatchTenantId: 'tenant-b', lastBatchId: 'id-1500', scanned: 500, migrated: 500 },
      ],
    });

    await migrateMfaPolicyUserControlled(pool);

    expect(batchCursors()).toEqual([
      ['', ''],
      ['tenant-a', 'id-1000'],
    ]);
  });

  it('pauses only after a batch that wrote rows', async () => {
    const { pool } = createPool({
      counts: [1, 0],
      batches: [
        { lastBatchTenantId: 'tenant-a', lastBatchId: 'id-1000', scanned: 1000, migrated: 0 },
        { lastBatchTenantId: 'tenant-b', lastBatchId: 'id-2000', scanned: 1000, migrated: 1 },
        { lastBatchTenantId: null, lastBatchId: null, scanned: 0, migrated: 0 },
      ],
    });

    await migrateMfaPolicyUserControlled(pool);

    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('stops at an empty batch', async () => {
    const { pool, batchCursors } = createPool({
      counts: [1000, 0],
      batches: [
        { lastBatchTenantId: 'tenant-a', lastBatchId: 'id-1000', scanned: 1000, migrated: 1000 },
        { lastBatchTenantId: null, lastBatchId: null, scanned: 0, migrated: 0 },
      ],
    });

    await migrateMfaPolicyUserControlled(pool);

    expect(batchCursors()).toEqual([
      ['', ''],
      ['tenant-a', 'id-1000'],
    ]);
  });

  it('throws when UserControlled rows remain after the migration', async () => {
    const { pool } = createPool({
      counts: [2, 1],
      batches: [{ lastBatchTenantId: 'tenant-a', lastBatchId: 'id-2', scanned: 2, migrated: 1 }],
    });

    await expect(migrateMfaPolicyUserControlled(pool)).rejects.toThrow(
      "sign_in_experiences still has 1 rows with mfa.policy = 'UserControlled'"
    );
  });
});
