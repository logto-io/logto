import { defaultTenantId } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { deleteUser, deleteUserTrustedDevice, getUserTrustedDevices } from '#src/api/admin-user.js';
import { createUserByAdmin } from '#src/helpers/index.js';

const insertTrustedDevice = async (
  pool: DatabasePool,
  {
    id,
    userId,
    createdAt,
    expiresAt,
  }: Readonly<{ id: string; userId: string; createdAt: number; expiresAt: number }>
) =>
  pool.query(sql`
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
      ${sql.binary(Buffer.alloc(32, 1))},
      ${'Mozilla/5.0 integration test'},
      ${'192.0.2.1'},
      ${'US'},
      ${'San Francisco'},
      to_timestamp(${createdAt}::double precision / 1000),
      to_timestamp(${createdAt}::double precision / 1000),
      to_timestamp(${expiresAt}::double precision / 1000)
    )
  `);

describe('admin user trusted devices', () => {
  // eslint-disable-next-line @silverhand/fp/no-let -- Initialized in this suite's setup.
  let pool: DatabasePool;

  beforeAll(async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- The matching afterAll closes this suite-scoped pool.
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('lists all active owned records and deletes only owned records', async () => {
    const [user, otherUser] = await Promise.all([createUserByAdmin(), createUserByAdmin()]);
    const now = Date.now();
    const olderDeviceId = generateStandardId();
    const newerDeviceId = generateStandardId();
    const expiredDeviceId = generateStandardId();
    const otherUserDeviceId = generateStandardId();

    try {
      await Promise.all([
        insertTrustedDevice(pool, {
          id: olderDeviceId,
          userId: user.id,
          createdAt: now - 2000,
          expiresAt: now + 60_000,
        }),
        insertTrustedDevice(pool, {
          id: newerDeviceId,
          userId: user.id,
          createdAt: now - 1000,
          expiresAt: now + 60_000,
        }),
        insertTrustedDevice(pool, {
          id: expiredDeviceId,
          userId: user.id,
          createdAt: now - 3000,
          expiresAt: now - 1000,
        }),
        insertTrustedDevice(pool, {
          id: otherUserDeviceId,
          userId: otherUser.id,
          createdAt: now,
          expiresAt: now + 60_000,
        }),
      ]);

      const trustedDevices = await getUserTrustedDevices(user.id);

      expect(trustedDevices).toEqual([
        {
          id: newerDeviceId,
          userAgent: 'Mozilla/5.0 integration test',
          country: 'US',
          city: 'San Francisco',
          createdAt: now - 1000,
          lastUsedAt: now - 1000,
          expiresAt: now + 60_000,
        },
        {
          id: olderDeviceId,
          userAgent: 'Mozilla/5.0 integration test',
          country: 'US',
          city: 'San Francisco',
          createdAt: now - 2000,
          lastUsedAt: now - 2000,
          expiresAt: now + 60_000,
        },
      ]);
      expect(JSON.stringify(trustedDevices)).not.toContain('192.0.2.1');
      expect(JSON.stringify(trustedDevices)).not.toContain('secretHash');

      await expect(deleteUserTrustedDevice(user.id, otherUserDeviceId)).rejects.toHaveProperty(
        'response.status',
        404
      );
      expect(await getUserTrustedDevices(otherUser.id)).toHaveLength(1);

      await expect(deleteUserTrustedDevice(user.id, newerDeviceId)).resolves.toHaveProperty(
        'status',
        204
      );
      expect(await getUserTrustedDevices(user.id)).toEqual([
        expect.objectContaining({ id: olderDeviceId }),
      ]);
      await expect(deleteUserTrustedDevice(user.id, newerDeviceId)).rejects.toHaveProperty(
        'response.status',
        404
      );
    } finally {
      await Promise.all([deleteUser(user.id), deleteUser(otherUser.id)]);
    }
  });

  it('returns 404 for an unknown user', async () => {
    await expect(getUserTrustedDevices('missing')).rejects.toHaveProperty('response.status', 404);
  });
});
