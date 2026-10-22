import { defaultTenantId, type User } from '@logto/schemas';
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

type LowerColumns = Pick<User, 'primaryEmailLower' | 'usernameLower'>;

describe('users lower-cased identifier columns', () => {
  const id = generateStandardId();
  /* eslint-disable @silverhand/fp/no-let -- pool handle assigned in beforeAll */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  const writeAsTenant = async (statement: SqlSqlToken) =>
    runAsTenant(pool, defaultTenantId, async (transaction) => transaction.query(statement));

  const findColumns = async () =>
    pool.one<LowerColumns>(sql`
      select primary_email_lower, username_lower
      from users
      where tenant_id = ${defaultTenantId} and id = ${id}
    `);

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation -- pool handle assigned in beforeAll */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await pool.query(sql`delete from users where tenant_id = ${defaultTenantId} and id = ${id}`);
    await pool.end();
  });

  it('fills the columns on insert', async () => {
    await writeAsTenant(sql`
      insert into users (tenant_id, id, username, primary_email)
      values (${defaultTenantId}, ${id}, ${`Lower_${id}`}, ${`Lower.${id}@Example.com`})
    `);

    await expect(findColumns()).resolves.toEqual({
      primaryEmailLower: `lower.${id}@example.com`,
      usernameLower: `lower_${id}`,
    });
  });

  it('refreshes the columns when the email changes, including non-ASCII', async () => {
    const email = `Ünïcode.${id}@Example.com`;

    await writeAsTenant(sql`
      update users set primary_email = ${email}
      where tenant_id = ${defaultTenantId} and id = ${id}
    `);

    // The database's own `lower()`, so the expectation holds under any locale.
    const expected = await pool.oneFirst<string>(sql`select lower(${email})`);
    await expect(findColumns()).resolves.toMatchObject({ primaryEmailLower: expected });
  });

  it('refreshes the columns when the username changes', async () => {
    await writeAsTenant(sql`
      update users set username = null
      where tenant_id = ${defaultTenantId} and id = ${id}
    `);

    await expect(findColumns()).resolves.toMatchObject({ usernameLower: null });
  });

  it('overwrites a direct write to a lower column', async () => {
    await writeAsTenant(sql`
      update users set primary_email_lower = 'drifted'
      where tenant_id = ${defaultTenantId} and id = ${id}
    `);

    const expected = await pool.oneFirst<string>(sql`
      select lower(primary_email) from users
      where tenant_id = ${defaultTenantId} and id = ${id}
    `);
    await expect(findColumns()).resolves.toMatchObject({ primaryEmailLower: expected });
  });
});
