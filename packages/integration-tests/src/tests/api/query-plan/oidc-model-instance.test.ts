import { defaultTenantId } from '@logto/schemas';
import { assertEnv } from '@silverhand/essentials';
import {
  createInterceptorsPreset,
  createPool,
  sql,
  type DatabasePool,
  type DatabasePoolConnection,
  type SqlSqlToken,
} from '@silverhand/slonik';

import { expectIndexCondition, explainAsTenant } from '#src/helpers/query-plan.js';

// The shape of core's `OidcSessionExtensionsQueries` session lookups.
const sessionsStatement = (extraCondition = sql``) => sql`
  select oidc_model_instances.payload, oidc_session_extensions.last_submission
  from oidc_model_instances
  left join oidc_session_extensions
    on payload_uid = session_uid
    and oidc_session_extensions.account_id = ${'query-plan-seed-account-1'}
  where model_name = ${'Session'}
    and payload_account_id = ${'query-plan-seed-account-1'}
    ${extraCondition}
    and expires_at > now()
`;

// The shape of core's batched revoke; the outer delete only probes the primary key.
const revokeStatement = (modelName: string, condition: SqlSqlToken) => sql`
  delete from oidc_model_instances
  where id in (
    select id
    from oidc_model_instances
    where model_name = ${modelName}
      and ${condition}
    limit ${2000}
  )
`;

const seedRows = async (connection: DatabasePoolConnection) => {
  await connection.query(sql`
    insert into oidc_model_instances (tenant_id, model_name, id, payload, expires_at)
    select
      ${defaultTenantId},
      'RefreshToken',
      'query-plan-seed-' || n,
      jsonb_build_object('grantId', 'query-plan-seed-grant-' || n),
      now() + interval '1 hour'
    from generate_series(1, 10) as n
  `);
  await connection.query(sql`
    insert into oidc_model_instances (tenant_id, model_name, id, payload, expires_at)
    select
      ${defaultTenantId},
      model,
      'query-plan-seed-' || lower(model) || '-' || n,
      jsonb_build_object('accountId', 'query-plan-seed-account-' || n)
        || case when model = 'Session' then jsonb_build_object('uid', 'query-plan-seed-uid-' || n) else '{}' end,
      now() + interval '1 hour'
    from generate_series(1, 10) as n, unnest(array['AccessToken', 'RefreshToken', 'Session', 'Grant']) as model
  `);
  await connection.query(sql`
    insert into oidc_model_instances (tenant_id, model_name, id, payload, expires_at)
    select
      ${defaultTenantId},
      'DeviceCode',
      'query-plan-seed-device-code-' || n,
      jsonb_build_object('userCode', 'query-plan-seed-user-code-' || n),
      now() + interval '1 hour'
    from generate_series(1, 10) as n
  `);
  await connection.query(sql`analyze oidc_model_instances`);
};

describe('oidc_model_instances query plans under the tenant role', () => {
  /* eslint-disable @silverhand/fp/no-let -- pool handle assigned in beforeAll */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  const explain = async (statement: SqlSqlToken) =>
    explainAsTenant(pool, defaultTenantId, statement, seedRows);

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation -- pool handle assigned in beforeAll */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await pool.end();
  });

  it('seeks by the tenant policy', async () => {
    const plan = await explain(
      sql`select id from oidc_model_instances where model_name = ${'RefreshToken'}`
    );

    expectIndexCondition(plan, 'tenant_id');
  });

  it('seeks by id', async () => {
    const plan = await explain(
      sql`
        select payload, consumed_at from oidc_model_instances
        where model_name = ${'RefreshToken'} and id = ${'query-plan-test-id'}
      `
    );

    expectIndexCondition(plan, 'id');
  });

  it('seeks the batched revoke by the grant id column', async () => {
    const plan = await explain(
      revokeStatement('RefreshToken', sql`payload_grant_id = ${'query-plan-seed-grant-1'}`)
    );

    expectIndexCondition(plan, 'payload_grant_id');
  });

  it.each(['AccessToken', 'RefreshToken', 'Session', 'Grant'])(
    'seeks the batched %s revoke by the account id column',
    async (modelName) => {
      const plan = await explain(
        revokeStatement(modelName, sql`payload_account_id = ${'query-plan-seed-account-1'}`)
      );

      expectIndexCondition(plan, 'payload_account_id');
    }
  );

  describe('user sessions with extensions', () => {
    it('seeks the session list by the account id column', async () => {
      const plan = await explain(sessionsStatement());

      expectIndexCondition(plan, 'payload_account_id');
    });

    it('seeks a single session by a key column', async () => {
      const plan = await explain(
        sessionsStatement(sql`and payload_uid = ${'query-plan-seed-uid-1'}`)
      );

      expectIndexCondition(plan, /\(payload_(account_id|uid)[\s)]/);
    });
  });

  describe('user grants', () => {
    it('seeks the application grants by the account id column', async () => {
      const plan = await explain(sql`
        select oidc_model_instance.id, oidc_model_instance.payload, oidc_model_instance.expires_at,
          json_build_object('id', application.id, 'name', application.name) as application
        from oidc_model_instances as oidc_model_instance
        inner join applications as application
          on oidc_model_instance.payload->>'clientId' = application.id
        where oidc_model_instance.model_name = 'Grant'
          and oidc_model_instance.payload_account_id = ${'query-plan-seed-account-1'}
          and oidc_model_instance.expires_at > now()
      `);

      expectIndexCondition(plan, 'payload_account_id');
    });

    it('seeks the CIMD grants by the account id column', async () => {
      // With an empty snapshot table the planner would rather drive the join from it.
      const seedSnapshots = async (connection: DatabasePoolConnection) => {
        await seedRows(connection);
        await connection.query(sql`
          insert into cimd_grant_client_snapshots (tenant_id, grant_id, client_id)
          select ${defaultTenantId}, id, 'https://query-plan.example.com/' || id
          from oidc_model_instances
          where model_name = 'Grant' and id like 'query-plan-seed-%'
        `);
        await connection.query(sql`analyze cimd_grant_client_snapshots`);
      };

      const plan = await explainAsTenant(
        pool,
        defaultTenantId,
        sql`
        select oidc_model_instances.id, payload, expires_at,
          json_build_object(
            'id', cimd_grant_client_snapshots.client_id,
            'name', coalesce(cimd_grant_client_snapshots.name, cimd_grant_client_snapshots.client_id)
          ) as application
        from oidc_model_instances
        inner join cimd_grant_client_snapshots
          on cimd_grant_client_snapshots.tenant_id = oidc_model_instances.tenant_id
          and cimd_grant_client_snapshots.grant_id = oidc_model_instances.id
        where model_name = 'Grant'
          and payload_account_id = ${'query-plan-seed-account-1'}
          and expires_at > now()
      `,
        seedSnapshots
      );

      expectIndexCondition(plan, 'payload_account_id');
    });

    it('seeks the grants of a client by the account id column', async () => {
      const plan = await explain(sql`
        select id, payload, expires_at
        from oidc_model_instances
        where model_name = 'Grant'
          and payload_account_id = ${'query-plan-seed-account-1'}
          and payload->>'clientId' = ${'query-plan-test-client'}
          and expires_at > now()
      `);

      expectIndexCondition(plan, 'payload_account_id');
    });

    it('seeks the session of a grant by the account id column', async () => {
      const plan = await explain(sql`
        select payload ->> 'uid' as "sessionUid"
        from oidc_model_instances
        where model_name = ${'Session'}
          and payload_account_id = ${'query-plan-seed-account-1'}
          and expires_at > now()
          and exists (
            select 1
            from jsonb_each(payload -> 'authorizations') as authorization_entry
            where authorization_entry.value ->> 'grantId' = ${'query-plan-test-grant'}
          )
        limit 1
      `);

      expectIndexCondition(plan, 'payload_account_id');
    });
  });

  it('seeks a session lookup by the uid column', async () => {
    const plan = await explain(sql`
      select payload, consumed_at from oidc_model_instances
      where model_name = ${'Session'} and payload_uid = ${'query-plan-seed-uid-1'}
      limit ${2}
    `);

    expectIndexCondition(plan, 'payload_uid');
  });

  it('seeks a device code lookup by the user code column', async () => {
    const plan = await explain(sql`
      select payload, consumed_at from oidc_model_instances
      where model_name = ${'DeviceCode'} and payload_user_code = ${'query-plan-seed-user-code-1'}
      limit ${2}
    `);

    expectIndexCondition(plan, 'payload_user_code');
  });
});
