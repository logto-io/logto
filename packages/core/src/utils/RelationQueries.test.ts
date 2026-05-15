import { Organizations, Users } from '@logto/schemas';
import {
  createMockPool,
  createMockQueryResult,
  type DatabasePool,
  type QueryResultRow,
} from '@silverhand/slonik';
import { type PrimitiveValueExpression } from '@silverhand/slonik/dist/src/types.js';

import { TwoRelationsQueries } from './RelationQueries.js';

/** Records each SQL statement issued (including the ones inside `pool.transaction`). */
type CapturedQuery = {
  sql: string;
  values: readonly PrimitiveValueExpression[];
};

const createCapturingPool = (
  responses: QueryResultRow[]
): { pool: DatabasePool; captured: CapturedQuery[] } => {
  const captured: CapturedQuery[] = [];
  // eslint-disable-next-line @silverhand/fp/no-let
  let cursor = 0;
  const pool = createMockPool({
    query: async (sql, values) => {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      captured.push({ sql, values });
      const row = responses[cursor];
      if (row === undefined) {
        // Fail loudly on unexpected extra queries so tests can't silently pass over a
        // refactor that issues more SQL than the scenario was set up for.
        throw new Error(
          `Capturing pool received ${cursor + 1} queries but only ${responses.length} responses were provisioned. Last SQL: ${sql}`
        );
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation
      cursor += 1;
      return createMockQueryResult([row]);
    },
  });
  return { pool, captured };
};

describe('TwoRelationsQueries.replaceWithDelta()', () => {
  it('acquires a row lock on the schema1 entity before issuing the delta statement', async () => {
    const { pool, captured } = createCapturingPool([
      { id: 'org-1' }, // Row lock select ... for update.
      { added: ['u-new'], removed: ['u-old'] }, // CTE statement.
    ]);
    const queries = new TwoRelationsQueries(
      pool,
      'organization_user_relations',
      Organizations,
      Users
    );

    await queries.replaceWithDelta('org-1', ['u-new', 'u-keep']);

    // First statement must be the parent-row lock so concurrent membership operations on the
    // same Schema1 entity serialize behind it.
    expect(captured[0]?.sql).toMatch(/select id\s+from\s+"organizations"\s+where\s+id\s+=/i);
    expect(captured[0]?.sql).toMatch(/for update/i);
  });

  it('issues a single delta statement that performs the INSERT and DELETE in CTEs and returns both id sets', async () => {
    const { pool, captured } = createCapturingPool([
      { id: 'org-1' },
      { added: ['u-new'], removed: ['u-old'] },
    ]);
    const queries = new TwoRelationsQueries(
      pool,
      'organization_user_relations',
      Organizations,
      Users
    );

    const result = await queries.replaceWithDelta('org-1', ['u-new', 'u-keep']);

    expect(result).toEqual({ added: ['u-new'], removed: ['u-old'] });
    // Delta statement is the second query (the first is the row lock).
    const delta = captured[1]?.sql ?? '';
    expect(delta).toMatch(/\bwith\b/i);
    expect(delta).toMatch(/next_set\s+as/i);
    expect(delta).toMatch(/inserted\s+as\s*\(\s*insert into "organization_user_relations"/i);
    expect(delta).toMatch(/on conflict do nothing/i);
    expect(delta).toMatch(/returning\s+"user_id"/i);
    expect(delta).toMatch(/deleted\s+as\s*\(\s*delete from "organization_user_relations"/i);
    expect(delta).toMatch(/array_agg\(\s*id\s*\)\s+from\s+inserted/i);
    expect(delta).toMatch(/array_agg\(\s*id\s*\)\s+from\s+deleted/i);
  });

  it('returns empty added and removed arrays when the database reports neither', async () => {
    const { pool } = createCapturingPool([{ id: 'org-1' }, { added: [], removed: [] }]);
    const queries = new TwoRelationsQueries(
      pool,
      'organization_user_relations',
      Organizations,
      Users
    );

    const result = await queries.replaceWithDelta('org-1', []);
    expect(result).toEqual({ added: [], removed: [] });
  });
});
