import { OidcModelInstances } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createOidcModelInstanceQueries } = await import('./oidc-model-instance.js');
const { consumeInstanceById } = createOidcModelInstanceQueries(pool);

/** Kept apart so `oidc-model-instance.test.ts` stays under the max-lines lint cap. */
describe('consumeInstanceById', () => {
  const { table, fields } = convertToIdentifiers(OidcModelInstances);
  const id = 'foo';

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(100_000);
  });

  afterEach(() => {
    mockQuery.mockReset();
    jest.useRealTimers();
  });

  it.each(['AuthorizationCode', 'DeviceCode', 'PushedAuthorizationRequest'])(
    'consumes a %s only while it is unconsumed',
    async (modelName) => {
      const expectSql = sql`
        update ${table}
        set ${fields.consumedAt}=to_timestamp($1)
        where ${fields.modelName}=$2
        and ${fields.id}=$3
        and ${fields.consumedAt} is null
      `;

      mockQuery.mockImplementation(async (sql, values) => {
        expectSqlAssert(sql, expectSql.sql);
        expect(values).toEqual([100, modelName, id]);

        return { ...createMockQueryResult([]), rowCount: 1 };
      });
      await expect(consumeInstanceById(modelName, id)).resolves.toBe(true);

      mockQuery.mockResolvedValue(createMockQueryResult([]));
      await expect(consumeInstanceById(modelName, id)).resolves.toBe(false);
    }
  );

  it('re-stamps a refresh token and always resolves true', async () => {
    const expectSql = sql`
      update ${table}
      set ${fields.consumedAt}=to_timestamp($1)
      where ${fields.modelName}=$2
      and ${fields.id}=$3
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([100, 'RefreshToken', id]);

      return createMockQueryResult([]);
    });

    await expect(consumeInstanceById('RefreshToken', id)).resolves.toBe(true);
  });
});
