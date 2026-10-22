import { defaultTenantId, type OidcModelInstance } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import {
  createInterceptorsPreset,
  createPool,
  sql,
  type DatabasePool,
  type SqlSqlToken,
} from '@silverhand/slonik';

import { runAsTenant } from '#src/helpers/tenant-role.js';

type PayloadKeys = Pick<
  OidcModelInstance,
  'payloadGrantId' | 'payloadAccountId' | 'payloadUid' | 'payloadUserCode'
>;

describe('oidc_model_instances payload key columns', () => {
  const modelName = 'RefreshToken';
  const id = generateStandardId();
  const thisRow = sql`tenant_id = ${defaultTenantId} and model_name = ${modelName} and id = ${id}`;
  /* eslint-disable @silverhand/fp/no-let -- pool handle assigned in beforeAll */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  // Writes run as the tenant's database role, the way core writes.
  const writeAsTenant = async (statement: SqlSqlToken) =>
    runAsTenant(pool, defaultTenantId, async (transaction) => transaction.query(statement));

  // The same upsert shape as the OIDC adapter's `upsertInstance`.
  const upsert = async (payload: Record<string, string>) =>
    writeAsTenant(sql`
      insert into oidc_model_instances (tenant_id, model_name, id, payload, expires_at)
      values (${defaultTenantId}, ${modelName}, ${id}, ${sql.jsonb(payload)}, now() + interval '1 hour')
      on conflict (tenant_id, model_name, id) do update
        set payload = excluded.payload, expires_at = excluded.expires_at
    `);

  const findKeys = async () =>
    pool.one<PayloadKeys>(sql`
      select
        payload_grant_id,
        payload_account_id,
        payload_uid,
        payload_user_code
      from oidc_model_instances
      where ${thisRow}
    `);

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation -- pool handle assigned in beforeAll */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await pool.query(sql`
      delete from oidc_model_instances
      where ${thisRow}
    `);
    await pool.end();
  });

  it('fills the columns on insert and leaves absent keys null', async () => {
    await upsert({ grantId: 'grant-1', accountId: 'account-1', uid: 'uid-1' });

    await expect(findKeys()).resolves.toEqual({
      payloadGrantId: 'grant-1',
      payloadAccountId: 'account-1',
      payloadUid: 'uid-1',
      payloadUserCode: null,
    });
  });

  it('refreshes the columns when an upsert rewrites the payload', async () => {
    await upsert({ grantId: 'grant-2', userCode: 'code-2' });

    await expect(findKeys()).resolves.toEqual({
      payloadGrantId: 'grant-2',
      payloadAccountId: null,
      payloadUid: null,
      payloadUserCode: 'code-2',
    });
  });

  it('skips the trigger on a consume, which only sets consumed_at', async () => {
    // A marker the trigger would overwrite from the payload if it fired, planted with triggers
    // suppressed, since a plain write to the column fires the trigger itself.
    await pool.transaction(async (transaction) => {
      await transaction.query(sql`set local session_replication_role = replica`);
      await transaction.query(sql`
        update oidc_model_instances
        set payload_user_code = 'marker'
        where ${thisRow}
      `);
    });

    await writeAsTenant(sql`
      update oidc_model_instances
      set consumed_at = now()
      where ${thisRow}
    `);

    await expect(findKeys()).resolves.toMatchObject({ payloadUserCode: 'marker' });
  });

  it('overwrites a direct write to a key column from the payload', async () => {
    await writeAsTenant(sql`
      update oidc_model_instances
      set payload_grant_id = 'drifted'
      where ${thisRow}
    `);

    await expect(findKeys()).resolves.toMatchObject({ payloadGrantId: 'grant-2' });
  });
});
