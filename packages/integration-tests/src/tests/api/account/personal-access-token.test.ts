import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, defaultTenantId, type User } from '@logto/schemas';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
import { type KyInstance } from 'ky';

import { updateAccountCenter } from '#src/api/account-center.js';
import { baseApi } from '#src/api/api.js';
import {
  createPersonalAccessToken,
  deletePersonalAccessToken,
  getPersonalAccessTokens,
  renamePersonalAccessToken,
} from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  initClientAndSignInForDefaultTenant,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest } from '#src/utils.js';

type TestUser = Readonly<{
  user: User;
  api: KyInstance;
  verificationRecordId: string;
}>;

const dayInMs = 24 * 60 * 60 * 1000;
const expiresInDays = (days: number) => Date.now() + days * dayInMs;

const createTestUser = async (
  scopes: UserScope[] = [UserScope.PersonalAccessTokens]
): Promise<TestUser> => {
  const { user, username, password } = await createDefaultTenantUserWithPassword();
  const client = await initClientAndSignInForDefaultTenant(username, password, { scopes });
  const accessToken = await client.getAccessToken();
  const api = baseApi.extend({ headers: { Authorization: `Bearer ${accessToken}` } });
  const verificationRecordId = await createVerificationRecordByPassword(api, password);

  return { user, api, verificationRecordId };
};

devFeatureTest.describe('account personal access tokens', () => {
  /* eslint-disable @silverhand/fp/no-let -- Integration setup resources are initialized in hooks. */
  let pool: DatabasePool;
  let owner: TestUser;
  let userWithoutScope: TestUser;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateAccountCenter({
      enabled: true,
      fields: { personalAccessToken: AccountCenterControlValue.Edit },
    });

    /* eslint-disable @silverhand/fp/no-mutation -- Initialize integration resources once. */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    owner = await createTestUser();
    userWithoutScope = await createTestUser([]);
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  beforeEach(async () => {
    await updateAccountCenter({
      enabled: true,
      fields: { personalAccessToken: AccountCenterControlValue.Edit },
    });
    await pool.query(sql`
      delete from personal_access_tokens
      where tenant_id = ${defaultTenantId} and user_id = ${owner.user.id}
    `);
  });

  afterAll(async () => {
    await Promise.all([
      deleteDefaultTenantUser(owner.user.id),
      deleteDefaultTenantUser(userWithoutScope.user.id),
    ]);
    await pool.end();
  });

  it('returns the secret only on creation and never in the list', async () => {
    const expiresAt = expiresInDays(30);
    const created = await createPersonalAccessToken(
      owner.api,
      { name: 'cli', expiresAt },
      owner.verificationRecordId
    );

    expect(created).toMatchObject({ name: 'cli', expiresAt });
    expect(created.value).toMatch(/^pat_/);
    expect(typeof created.createdAt).toBe('number');

    const tokens = await getPersonalAccessTokens(owner.api);

    expect(tokens).toEqual([{ name: 'cli', createdAt: created.createdAt, expiresAt }]);
    expect(JSON.stringify(tokens)).not.toContain(created.value);
  });

  it('rejects requests without the scope or the account center field', async () => {
    await expectRejects(getPersonalAccessTokens(userWithoutScope.api), {
      code: 'auth.unauthorized',
      status: 401,
    });
    await expectRejects(
      createPersonalAccessToken(
        userWithoutScope.api,
        { name: 'cli', expiresAt: expiresInDays(1) },
        userWithoutScope.verificationRecordId
      ),
      { code: 'auth.unauthorized', status: 401 }
    );

    await updateAccountCenter({
      enabled: true,
      fields: { personalAccessToken: AccountCenterControlValue.Off },
    });
    await expectRejects(getPersonalAccessTokens(owner.api), {
      code: 'account_center.field_not_enabled',
      status: 400,
    });

    await updateAccountCenter({
      enabled: true,
      fields: { personalAccessToken: AccountCenterControlValue.ReadOnly },
    });
    await expect(getPersonalAccessTokens(owner.api)).resolves.toEqual([]);
    await expectRejects(
      createPersonalAccessToken(
        owner.api,
        { name: 'cli', expiresAt: expiresInDays(1) },
        owner.verificationRecordId
      ),
      { code: 'account_center.field_not_editable', status: 400 }
    );
  });

  it('requires identity verification to create, rename, and delete tokens', async () => {
    await expectRejects(
      createPersonalAccessToken(owner.api, { name: 'cli', expiresAt: expiresInDays(1) }),
      { code: 'verification_record.permission_denied', status: 401 }
    );

    await createPersonalAccessToken(
      owner.api,
      { name: 'cli', expiresAt: expiresInDays(1) },
      owner.verificationRecordId
    );

    await expectRejects(renamePersonalAccessToken(owner.api, { currentName: 'cli', name: 'x' }), {
      code: 'verification_record.permission_denied',
      status: 401,
    });
    await expectRejects(deletePersonalAccessToken(owner.api, 'cli'), {
      code: 'verification_record.permission_denied',
      status: 401,
    });

    const response = await deletePersonalAccessToken(owner.api, 'cli', owner.verificationRecordId);
    expect(response.status).toBe(204);
    await expect(getPersonalAccessTokens(owner.api)).resolves.toEqual([]);

    await expectRejects(deletePersonalAccessToken(owner.api, 'cli', owner.verificationRecordId), {
      code: 'entity.not_found',
      status: 404,
    });
  });

  it('requires an expiration time within 365 days', async () => {
    const create = async (expiresAt: number) =>
      createPersonalAccessToken(owner.api, { name: 'cli', expiresAt }, owner.verificationRecordId);

    await expectRejects(
      owner.api.post('api/my-account/personal-access-tokens', {
        json: { name: 'cli' },
        headers: { 'logto-verification-id': owner.verificationRecordId },
      }),
      { code: 'guard.invalid_input', status: 400 }
    );
    await expectRejects(create(Date.now() - 1000), {
      code: 'user.personal_access_token_invalid_expiration',
      status: 400,
    });
    await expectRejects(create(expiresInDays(366)), {
      code: 'user.personal_access_token_invalid_expiration',
      status: 400,
    });

    await expect(create(expiresInDays(364))).resolves.toMatchObject({ name: 'cli' });
  });

  it('limits the number of unexpired tokens per user', async () => {
    // Expired tokens do not count towards the limit.
    await pool.query(sql`
      insert into personal_access_tokens (tenant_id, user_id, name, value, expires_at)
      values (${defaultTenantId}, ${owner.user.id}, 'expired', 'pat_expired_test_value', now() - interval '1 day')
    `);

    for (const index of Array.from({ length: 20 }, (_, index) => index)) {
      // eslint-disable-next-line no-await-in-loop -- Create tokens sequentially to keep the setup deterministic.
      await createPersonalAccessToken(
        owner.api,
        { name: `token-${index}`, expiresAt: expiresInDays(1) },
        owner.verificationRecordId
      );
    }

    await expectRejects(
      createPersonalAccessToken(
        owner.api,
        { name: 'token-20', expiresAt: expiresInDays(1) },
        owner.verificationRecordId
      ),
      { code: 'user.personal_access_token_limit_exceeded', status: 422 }
    );

    await deletePersonalAccessToken(owner.api, 'token-0', owner.verificationRecordId);
    await expect(
      createPersonalAccessToken(
        owner.api,
        { name: 'token-20', expiresAt: expiresInDays(1) },
        owner.verificationRecordId
      )
    ).resolves.toMatchObject({ name: 'token-20' });
  });

  it('renames a token and keeps names unique', async () => {
    const expiresAt = expiresInDays(10);
    await createPersonalAccessToken(
      owner.api,
      { name: 'first', expiresAt },
      owner.verificationRecordId
    );
    await createPersonalAccessToken(
      owner.api,
      { name: 'second', expiresAt },
      owner.verificationRecordId
    );
    await expect(getPersonalAccessTokens(owner.api)).resolves.toMatchObject([
      { name: 'second' },
      { name: 'first' },
    ]);

    const renamed = await renamePersonalAccessToken(
      owner.api,
      { currentName: 'first', name: 'renamed' },
      owner.verificationRecordId
    );
    expect(renamed).toMatchObject({ name: 'renamed', expiresAt });
    expect(renamed).not.toHaveProperty('value');

    await expectRejects(
      renamePersonalAccessToken(
        owner.api,
        { currentName: 'renamed', name: 'second' },
        owner.verificationRecordId
      ),
      { code: 'user.personal_access_token_name_exists', status: 422 }
    );
    await expectRejects(
      createPersonalAccessToken(
        owner.api,
        { name: 'second', expiresAt },
        owner.verificationRecordId
      ),
      { code: 'user.personal_access_token_name_exists', status: 422 }
    );
    await expectRejects(
      renamePersonalAccessToken(
        owner.api,
        { currentName: 'missing', name: 'other' },
        owner.verificationRecordId
      ),
      { code: 'entity.not_exists', status: 404 }
    );

    // Newest first. Renaming does not change the creation time.
    const tokens = await getPersonalAccessTokens(owner.api);
    expect(tokens.map(({ name }) => name)).toEqual(['second', 'renamed']);
  });
});
