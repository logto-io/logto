import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';
import { describe, expect, it, vi } from 'vitest';

import { withoutStatementTimeout } from './1792569975-statement-timeout.js';

const createPool = () => {
  const query = vi.fn(async (_statement: string) => createMockQueryResult([]));

  return {
    pool: createMockPool({ query }),
    statements: () => query.mock.calls.map(([statement]) => statement),
  };
};

describe('withoutStatementTimeout()', () => {
  it('disables the timeout for every statement of the step and restores it afterwards', async () => {
    const { pool, statements } = createPool();

    await withoutStatementTimeout(pool, async (pinned) => {
      await pinned.query(sql`select 1`);
      await pinned.query(sql`select 2`);
    });

    expect(statements()).toEqual([
      'set statement_timeout = 0',
      'select 1',
      'select 2',
      'reset statement_timeout',
    ]);
  });

  it('propagates the step error without a reset on the discarded connection', async () => {
    const { pool, statements } = createPool();

    await expect(
      withoutStatementTimeout(pool, async () => {
        throw new Error('build failed');
      })
    ).rejects.toThrow('build failed');
    expect(statements()).toEqual(['set statement_timeout = 0']);
  });
});
