import { setTimeout } from 'node:timers/promises';

import { ApplicationType, defaultTenantId, demoAppApplicationId } from '@logto/schemas';
import { assert, assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';

import { oidcApi } from '#src/api/api.js';
import { createApplicationWithSecret, deleteApplication } from '#src/api/application.js';
import { deleteUser } from '#src/api/index.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

type TokenUsage = {
  userTokenUsage: number;
  m2mTokenUsage: number;
};

const getTokenUsage = async (pool: DatabasePool) =>
  pool.one<TokenUsage>(sql`
    select
      coalesce(sum(user_token_usage), 0)::integer as user_token_usage,
      coalesce(sum(m2m_token_usage), 0)::integer as m2m_token_usage
    from daily_token_usage
    where tenant_id = ${defaultTenantId}
  `);

const getActiveUserCount = async (pool: DatabasePool, userId: string) =>
  pool.oneFirst<number>(sql`
    select count(*)::integer
    from daily_active_users
    where tenant_id = ${defaultTenantId} and user_id = ${userId}
  `);

const waitForValue = async <T>(
  read: () => Promise<T>,
  predicate: (value: T) => boolean,
  attempts = 50
): Promise<T> => {
  const value = await read();

  if (predicate(value)) {
    return value;
  }

  if (attempts === 1) {
    throw new Error('Timed out waiting for token metering listener');
  }

  await setTimeout(100);
  return waitForValue(read, predicate, attempts - 1);
};

describe('token metering listeners', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let pool: DatabasePool;

  beforeAll(async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('records user token usage and daily active users after sign-in and refresh', async () => {
    const username = generateUsername();
    const password = generatePassword();
    const [user, resource] = await Promise.all([
      createUserByAdmin({ username, password }),
      createResource(),
    ]);
    const usageBefore = await getTokenUsage(pool);

    try {
      const client = await initExperienceClient({
        config: { resources: [resource.indicator] },
      });
      await identifyUserWithUsernamePassword(client, username, password);
      const { redirectTo } = await client.submitInteraction();
      const signedInUserId = await processSession(client, redirectTo);
      const refreshToken = await client.getRefreshToken();

      expect(signedInUserId).toBe(user.id);
      assert(refreshToken, new Error('Missing refresh token after sign-in'));

      await oidcApi.post('token', {
        body: new URLSearchParams({
          client_id: demoAppApplicationId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          resource: resource.indicator,
        }),
      });

      const [usageAfter, activeUserCount] = await Promise.all([
        waitForValue(
          async () => getTokenUsage(pool),
          ({ userTokenUsage }) => userTokenUsage >= usageBefore.userTokenUsage + 2
        ),
        waitForValue(
          async () => getActiveUserCount(pool, user.id),
          (count) => count > 0
        ),
      ]);

      expect(usageAfter.userTokenUsage).toBeGreaterThanOrEqual(usageBefore.userTokenUsage + 2);
      expect(activeUserCount).toBeGreaterThanOrEqual(2);
    } finally {
      await Promise.all([deleteUser(user.id), deleteResource(resource.id)]);
    }
  });

  it('records M2M token usage after a client credentials grant', async () => {
    const [application, resource] = await Promise.all([
      createApplicationWithSecret('token metering test', ApplicationType.MachineToMachine),
      createResource(),
    ]);
    const usageBefore = await getTokenUsage(pool);

    try {
      await oidcApi.post('token', {
        body: new URLSearchParams({
          client_id: application.id,
          client_secret: application.secret,
          grant_type: 'client_credentials',
          resource: resource.indicator,
        }),
      });

      const usageAfter = await waitForValue(
        async () => getTokenUsage(pool),
        ({ m2mTokenUsage }) => m2mTokenUsage > usageBefore.m2mTokenUsage
      );

      expect(usageAfter.m2mTokenUsage).toBe(usageBefore.m2mTokenUsage + 1);
    } finally {
      await Promise.all([deleteApplication(application.id), deleteResource(resource.id)]);
    }
  });
});
