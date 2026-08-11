import { CimdGrantClientSnapshots, OidcModelInstances } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { createMockOidcGrantInstance } from '#src/__mocks__/oidc-grant.js';
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
const { findUserActiveCimdGrants } = createOidcModelInstanceQueries(pool);

/** In its own file because `oidc-model-instance.test.ts` is at the max-lines lint cap. */
describe('findUserActiveCimdGrants', () => {
  const { table, fields } = convertToIdentifiers(OidcModelInstances);
  const { table: cimdGrantClientSnapshotTable } = convertToIdentifiers(CimdGrantClientSnapshots);

  afterEach(() => {
    mockQuery.mockReset();
  });

  it('joins the consent-time snapshot into the application shape', async () => {
    const userId = 'user-id';
    const expectSql = sql`
      select ${fields.id}, ${fields.payload}, ${fields.expiresAt},
        json_build_object(
          'id', "cimd_grant_client_snapshots"."client_id",
          'name', coalesce(
            "cimd_grant_client_snapshots"."name",
            "cimd_grant_client_snapshots"."client_id"
          )
        ) as application
      from ${table}
      inner join ${cimdGrantClientSnapshotTable}
        on "cimd_grant_client_snapshots"."tenant_id"="oidc_model_instances"."tenant_id"
        and "cimd_grant_client_snapshots"."grant_id"=${fields.id}
      where ${fields.modelName}='Grant'
        and ${fields.payload}->>'accountId'=${userId}
        and ${fields.expiresAt} > to_timestamp($2)
    `;

    const cimdClientId = 'https://client.example.com/oauth/metadata.json';
    const cimdGrant = {
      ...createMockOidcGrantInstance({
        id: 'cimd-grant-id',
        payload: { kind: 'Grant', clientId: cimdClientId, accountId: userId },
      }),
      application: {
        id: cimdClientId,
        name: 'Example App',
      },
    };

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([userId, expect.any(Number)]);

      return createMockQueryResult([cimdGrant as never]);
    });

    await expect(findUserActiveCimdGrants(userId)).resolves.toEqual([cimdGrant]);
  });
});
