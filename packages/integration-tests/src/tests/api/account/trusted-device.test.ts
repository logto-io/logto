import { createHash, randomBytes } from 'node:crypto';

import { UserScope } from '@logto/core-kit';
import {
  AccountCenterControlValue,
  defaultTenantId,
  type AccountTrustedDeviceResponse,
  type User,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assert, assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
import { type KyInstance } from 'ky';

import { updateAccountCenter } from '#src/api/account-center.js';
import { baseApi } from '#src/api/api.js';
import {
  deleteTrustedDevice,
  getSessions,
  getTrustedDevices,
  getTrustedDevicesResponse,
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
  password: string;
  accessToken: string;
  api: KyInstance;
  verificationRecordId: string;
}>;

const getTrustedDeviceCookieName = (userId: string) => {
  const subjectHash = createHash('sha256')
    .update(`${defaultTenantId}:${userId}`)
    .digest('base64url');

  return `__Host-logto-trusted-device-${subjectHash}`;
};

const createCredential = (id: string) => {
  const secret = randomBytes(32).toString('base64url');
  const secretHash = createHash('sha256').update(Buffer.from(secret, 'base64url')).digest();

  return { id, secret, secretHash };
};

const buildApiWithCredential = (accessToken: string, userId: string, id: string, secret: string) =>
  baseApi.extend({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `${getTrustedDeviceCookieName(userId)}=${id}.${secret}`,
      'X-Forwarded-Proto': 'https',
    },
  });

const createTestUser = async (
  scopes: UserScope[] = [UserScope.TrustedDevices]
): Promise<TestUser> => {
  const { user, username, password } = await createDefaultTenantUserWithPassword();
  const client = await initClientAndSignInForDefaultTenant(username, password, { scopes });
  const accessToken = await client.getAccessToken();
  const api = baseApi.extend({ headers: { Authorization: `Bearer ${accessToken}` } });
  const verificationRecordId = await createVerificationRecordByPassword(api, password);

  return { user, password, accessToken, api, verificationRecordId };
};

devFeatureTest.describe('account trusted device management', () => {
  /* eslint-disable @silverhand/fp/no-let -- Integration setup resources are initialized in hooks. */
  let pool: DatabasePool;
  let owner: TestUser;
  let anotherUser: TestUser;
  let ownerWithoutTrustedDevicesScope: TestUser;
  let currentCredential: ReturnType<typeof createCredential>;
  let remoteCredential: ReturnType<typeof createCredential>;
  /* eslint-enable @silverhand/fp/no-let */

  const insertTrustedDevice = async ({
    id,
    secretHash,
    userId,
    createdAt,
  }: Readonly<{
    id: string;
    secretHash: Uint8Array;
    userId: string;
    createdAt: number;
  }>) => {
    await pool.query(sql`
      insert into trusted_devices (
        tenant_id,
        id,
        user_id,
        secret_hash,
        user_agent,
        ip,
        country,
        city,
        created_at,
        last_used_at,
        expires_at
      ) values (
        ${defaultTenantId},
        ${id},
        ${userId},
        ${sql.binary(Buffer.from(secretHash))},
        ${'Integration test browser'},
        ${'192.0.2.1'},
        ${'US'},
        ${'San Francisco'},
        to_timestamp(${createdAt}::double precision / 1000),
        to_timestamp(${createdAt + 100}::double precision / 1000),
        to_timestamp(${Date.now() + 24 * 60 * 60 * 1000}::double precision / 1000)
      )
    `);
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();

    /* eslint-disable @silverhand/fp/no-mutation -- Initialize integration resources once. */
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    owner = await createTestUser([UserScope.TrustedDevices, UserScope.Sessions]);
    anotherUser = await createTestUser();
    ownerWithoutTrustedDevicesScope = await createTestUser([]);
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  beforeEach(async () => {
    await updateAccountCenter({
      enabled: true,
      fields: { trustedDevice: AccountCenterControlValue.Edit },
    });
    await pool.query(sql`
      delete from trusted_devices
      where user_id in (${owner.user.id}, ${anotherUser.user.id})
    `);

    const now = Date.now();
    /* eslint-disable @silverhand/fp/no-mutation -- Refresh per-test credentials and records. */
    currentCredential = createCredential(generateStandardId());
    remoteCredential = createCredential(generateStandardId());
    /* eslint-enable @silverhand/fp/no-mutation */

    await Promise.all([
      insertTrustedDevice({
        ...currentCredential,
        userId: owner.user.id,
        createdAt: now,
      }),
      insertTrustedDevice({
        ...remoteCredential,
        userId: owner.user.id,
        createdAt: now - 1000,
      }),
    ]);
  });

  afterAll(async () => {
    await pool.query(sql`
      delete from trusted_devices
      where user_id in (${owner.user.id}, ${anotherUser.user.id})
    `);
    await Promise.all([
      deleteDefaultTenantUser(owner.user.id),
      deleteDefaultTenantUser(anotherUser.user.id),
      deleteDefaultTenantUser(ownerWithoutTrustedDevicesScope.user.id),
    ]);
    await pool.end();
  });

  it('returns paginated redacted records and marks only a fully validated credential as current', async () => {
    const api = buildApiWithCredential(
      owner.accessToken,
      owner.user.id,
      currentCredential.id,
      currentCredential.secret
    );
    const firstPageResponse = await getTrustedDevicesResponse(
      api,
      owner.verificationRecordId,
      new URLSearchParams({ page: '1', page_size: '1' })
    );
    const firstPage = await firstPageResponse.json<AccountTrustedDeviceResponse[]>();
    const [firstDevice] = firstPage;
    assert(firstDevice, new Error('Expected the first trusted-device page'));

    expect(firstPageResponse.headers.get('total-number')).toBe('2');
    expect(firstPageResponse.headers.get('link')).toContain('rel="next"');
    expect(firstPage).toEqual([
      expect.objectContaining({ id: currentCredential.id, isCurrent: true }),
    ]);
    expect(firstDevice).toMatchObject({
      id: currentCredential.id,
      userAgent: 'Integration test browser',
      country: 'US',
      city: 'San Francisco',
      isCurrent: true,
    });
    expect(typeof firstDevice.createdAt).toBe('number');
    expect(typeof firstDevice.lastUsedAt).toBe('number');
    expect(typeof firstDevice.expiresAt).toBe('number');
    expect(JSON.stringify(firstPage)).not.toContain('192.0.2.1');
    expect(JSON.stringify(firstPage)).not.toContain('secretHash');

    const secondPage = await getTrustedDevices(
      api,
      owner.verificationRecordId,
      new URLSearchParams({ page: '2', page_size: '1' })
    );
    expect(secondPage).toEqual([
      expect.objectContaining({ id: remoteCredential.id, isCurrent: false }),
    ]);
  });

  it('never marks a record current when the cookie ID matches but the secret is invalid', async () => {
    const api = buildApiWithCredential(
      owner.accessToken,
      owner.user.id,
      currentCredential.id,
      randomBytes(32).toString('base64url')
    );

    const devices = await getTrustedDevices(api, owner.verificationRecordId);

    expect(devices).toHaveLength(2);
    expect(devices.every(({ isCurrent }) => !isCurrent)).toBeTruthy();
  });

  it('requires identity verification and the trusted-devices scope', async () => {
    await expectRejects(getTrustedDevices(owner.api, ''), {
      code: 'verification_record.permission_denied',
      status: 401,
    });
    await expectRejects(
      getTrustedDevices(
        ownerWithoutTrustedDevicesScope.api,
        ownerWithoutTrustedDevicesScope.verificationRecordId
      ),
      { code: 'auth.unauthorized', status: 401 }
    );
  });

  it('enforces independent Off, ReadOnly, and Edit permissions', async () => {
    await updateAccountCenter({
      fields: { trustedDevice: AccountCenterControlValue.Off },
    });
    await expectRejects(getTrustedDevices(owner.api, owner.verificationRecordId), {
      code: 'account_center.field_not_enabled',
      status: 400,
    });

    await updateAccountCenter({
      fields: { trustedDevice: AccountCenterControlValue.ReadOnly },
    });
    await expect(getTrustedDevices(owner.api, owner.verificationRecordId)).resolves.toHaveLength(2);
    await expectRejects(
      deleteTrustedDevice(owner.api, remoteCredential.id, owner.verificationRecordId),
      { code: 'account_center.field_not_editable', status: 400 }
    );

    await updateAccountCenter({
      fields: { trustedDevice: AccountCenterControlValue.Edit },
    });
    await expect(
      deleteTrustedDevice(owner.api, remoteCredential.id, owner.verificationRecordId)
    ).resolves.toHaveProperty('status', 204);
  });

  it('constrains removal to the authenticated owner', async () => {
    await expectRejects(
      deleteTrustedDevice(anotherUser.api, remoteCredential.id, anotherUser.verificationRecordId),
      { code: 'entity.not_found', status: 404 }
    );

    const devices = await getTrustedDevices(owner.api, owner.verificationRecordId);
    expect(devices.map(({ id }) => id)).toContain(remoteCredential.id);
  });

  it('clears the credential but preserves the login session when removing the current record', async () => {
    await updateAccountCenter({
      fields: {
        session: AccountCenterControlValue.ReadOnly,
        trustedDevice: AccountCenterControlValue.Edit,
      },
    });
    const api = buildApiWithCredential(
      owner.accessToken,
      owner.user.id,
      currentCredential.id,
      currentCredential.secret
    );

    const response = await deleteTrustedDevice(
      api,
      currentCredential.id,
      owner.verificationRecordId
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('set-cookie')).toContain(
      `${getTrustedDeviceCookieName(owner.user.id)}=;`
    );
    await expect(getSessions(owner.api, owner.verificationRecordId)).resolves.toHaveProperty(
      'sessions'
    );
  });

  it('leaves a remote cookie untouched on removal and clears it when it is later presented', async () => {
    const currentApi = buildApiWithCredential(
      owner.accessToken,
      owner.user.id,
      currentCredential.id,
      currentCredential.secret
    );

    const deletionResponse = await deleteTrustedDevice(
      currentApi,
      remoteCredential.id,
      owner.verificationRecordId
    );
    expect(deletionResponse.headers.get('set-cookie')).toBeNull();

    const removedDeviceApi = buildApiWithCredential(
      owner.accessToken,
      owner.user.id,
      remoteCredential.id,
      remoteCredential.secret
    );
    const listResponse = await getTrustedDevicesResponse(
      removedDeviceApi,
      owner.verificationRecordId
    );
    const devices = await listResponse.json<Array<{ isCurrent: boolean }>>();

    assert(devices.length > 0, new Error('Expected the remaining trusted device'));
    expect(devices.every(({ isCurrent }) => !isCurrent)).toBeTruthy();
    expect(listResponse.headers.get('set-cookie')).toContain(
      `${getTrustedDeviceCookieName(owner.user.id)}=;`
    );
  });
});
