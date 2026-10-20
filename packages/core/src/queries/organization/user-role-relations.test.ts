import {
  createMockPool,
  createMockQueryResult,
  type DatabasePool,
  type QueryResultRow,
} from '@silverhand/slonik';
import { type PrimitiveValueExpression } from '@silverhand/slonik/dist/src/types.js';

import { UserRoleRelationQueries } from './user-role-relations.js';

const { jest } = import.meta;

type CapturedQuery = {
  sql: string;
  values: readonly PrimitiveValueExpression[];
};

/** Records each SQL statement issued (including the ones inside `pool.transaction`). */
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

describe('UserRoleRelationQueries.insertWithResult()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('issues no query when called with no relations', async () => {
    const { pool, captured } = createCapturingPool([]);
    const queries = new UserRoleRelationQueries(pool);

    await expect(queries.insertWithResult()).resolves.toEqual([]);
    expect(captured).toHaveLength(0);
  });

  it('returns only the relations the database actually inserted', async () => {
    const insertedRows = [
      {
        organizationId: 'org-1',
        userId: 'user-1',
        organizationRoleId: 'role-new',
      },
    ];
    const { pool, captured } = createCapturingPool(insertedRows);
    const queries = new UserRoleRelationQueries(pool);

    await expect(
      queries.insertWithResult(
        { organizationId: 'org-1', userId: 'user-1', organizationRoleId: 'role-existing' },
        { organizationId: 'org-1', userId: 'user-1', organizationRoleId: 'role-new' }
      )
    ).resolves.toEqual(insertedRows);

    const [statement] = captured;
    expect(statement?.sql).toMatch(/insert into "organization_role_user_relations"/);
    expect(statement?.sql).toMatch(/on conflict do nothing/);
    expect(statement?.sql).toMatch(/returning/);
    expect(statement?.values).toEqual([
      'org-1',
      'user-1',
      'role-existing',
      'org-1',
      'user-1',
      'role-new',
    ]);
  });
});

describe('UserRoleRelationQueries.replaceWithDelta()', () => {
  it('locks the user and returns the added and removed role IDs', async () => {
    const { pool, captured } = createCapturingPool([
      { id: 'user-1' },
      { added: ['role-new'], removed: ['role-old'] },
    ]);
    const queries = new UserRoleRelationQueries(pool);

    await expect(
      queries.replaceWithDelta('org-1', 'user-1', ['role-new', 'role-keep'])
    ).resolves.toEqual({ added: ['role-new'], removed: ['role-old'] });

    expect(captured[0]?.sql).toMatch(/for update/i);
    expect(captured[0]?.values).toEqual(['user-1']);

    const delta = captured[1]?.sql ?? '';
    expect(delta).toMatch(/\bwith\b/i);
    expect(delta).toMatch(/insert into "organization_role_user_relations"/);
    expect(delta).toMatch(/on conflict do nothing/i);
    expect(delta).toMatch(/deleted as/i);
    expect(delta).toMatch(/array_agg\(\s*id\s*\)\s+from\s+inserted/i);
    expect(delta).toMatch(/array_agg\(\s*id\s*\)\s+from\s+deleted/i);
  });

  it('returns empty arrays when nothing changes', async () => {
    const { pool } = createCapturingPool([{ id: 'user-1' }, { added: [], removed: [] }]);
    const queries = new UserRoleRelationQueries(pool);

    await expect(queries.replaceWithDelta('org-1', 'user-1', [])).resolves.toEqual({
      added: [],
      removed: [],
    });
  });
});
