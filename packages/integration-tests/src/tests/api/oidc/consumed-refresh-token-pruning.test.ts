import { defaultTenantId } from '@logto/schemas';
import { assert, assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { deleteUser } from '#src/api/admin-user.js';
import { deleteApplication } from '#src/api/application.js';
import {
  assertRefreshTokenInvalidGrant,
  createAppAndSignInWithPassword,
  refreshTokens,
} from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { waitFor } from '#src/utils.js';

const isConsumedRefreshTokenOf = (userId: string, clientId: string) => sql`
  tenant_id = ${defaultTenantId}
  and model_name = 'RefreshToken'
  and payload->>'accountId' = ${userId}
  and payload->>'clientId' = ${clientId}
  and consumed_at is not null
`;

/**
 * Rotation keeps a consumed refresh token so a replay can be detected. Each rotation prunes the
 * grant's consumed tokens older than the 7-day retention window, so a frequently refreshed grant
 * stays bounded. Reuse detection on a grant that has never been pruned is covered by
 * `provider-semantics.test.ts`.
 */
describe('consumed refresh token pruning on rotation', () => {
  /* eslint-disable @silverhand/fp/no-let -- fixture assigned in beforeAll */
  let pool: DatabasePool;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- fixture assigned in beforeAll
    pool = await createPool(assertEnv('DB_URL'), { interceptors: createInterceptorsPreset() });
  });

  afterAll(async () => {
    await pool.end();
  });

  const countConsumedRefreshTokens = async (userId: string, clientId: string) => {
    const { count } = await pool.one<{ count: number }>(sql`
      select count(*)::int as count from oidc_model_instances
      where ${isConsumedRefreshTokenOf(userId, clientId)}
    `);
    return count;
  };

  /** The prune runs detached from the token response, so give it a moment to land. */
  const expectConsumedRefreshTokens = async (
    userId: string,
    clientId: string,
    expected: number
  ) => {
    for (const _ of Array.from({ length: 20 })) {
      // eslint-disable-next-line no-await-in-loop -- polling until the detached prune lands
      if ((await countConsumedRefreshTokens(userId, clientId)) === expected) {
        return;
      }
      // eslint-disable-next-line no-await-in-loop -- polling until the detached prune lands
      await waitFor(250);
    }

    await expect(countConsumedRefreshTokens(userId, clientId)).resolves.toBe(expected);
  };

  it('prunes aged consumed tokens on rotation and keeps recent ones', async () => {
    const { user, userProfile } = await generateNewUser({ username: true, password: true });
    const { app, refreshToken: initial } = await createAppAndSignInWithPassword({
      username: userProfile.username,
      password: userProfile.password,
    });
    assert(initial, new Error('No refresh token issued'));
    const clientId = app.id;

    const exchange = async (refreshToken: string) => {
      const { refreshToken: rotated } = await refreshTokens({ clientId, refreshToken });
      assert(rotated, new Error('No rotated refresh token issued'));
      return rotated;
    };

    // Two rotations leave two consumed tokens behind.
    const second = await exchange(initial);
    const third = await exchange(second);
    await expect(countConsumedRefreshTokens(user.id, clientId)).resolves.toBe(2);

    // Age them past the 7-day window; the next rotation prunes them.
    await pool.query(sql`
      update oidc_model_instances set consumed_at = now() - interval '8 days'
      where ${isConsumedRefreshTokenOf(user.id, clientId)}
    `);
    const fourth = await exchange(third);

    // Only the token consumed by that rotation remains, since it is inside the window.
    await expectConsumedRefreshTokens(user.id, clientId, 1);

    // A pruned token is rejected without revoking the grant: the live chain keeps working.
    await assertRefreshTokenInvalidGrant({ clientId, refreshToken: initial });
    const fifth = await exchange(fourth);

    // The unpruned consumed token still trips reuse detection past the 3-second leeway and revokes
    // the grant. Age it past the leeway instead of sleeping.
    await pool.query(sql`
      update oidc_model_instances set consumed_at = consumed_at - interval '4 seconds'
      where ${isConsumedRefreshTokenOf(user.id, clientId)}
    `);
    await assertRefreshTokenInvalidGrant({ clientId, refreshToken: third });
    await assertRefreshTokenInvalidGrant({ clientId, refreshToken: fifth });

    await Promise.all([deleteApplication(app.id), deleteUser(user.id)]);
  });
});
