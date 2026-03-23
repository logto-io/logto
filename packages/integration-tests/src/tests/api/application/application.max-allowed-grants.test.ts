import { ApplicationType } from '@logto/schemas';

import {
  createApplication,
  deleteApplication,
  getApplication,
  getUserApplicationGrants,
  updateApplication,
} from '#src/api/index.js';
import {
  assertRefreshTokenInvalidGrant,
  assertRefreshTokenValid,
  createAppAndSignInWithPassword,
} from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

devFeatureTest.describe('application maxAllowedGrants', () => {
  const userApi = new UserApiTest();

  afterEach(async () => {
    await userApi.cleanUp();
  });

  devFeatureTest.it('should create application with maxAllowedGrants and get it', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional, {
      customClientMetadata: { maxAllowedGrants: 2 },
    });

    try {
      expect(application.customClientMetadata.maxAllowedGrants).toBe(2);

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedGrants).toBe(2);
    } finally {
      await deleteApplication(application.id);
    }
  });

  devFeatureTest.it('should update maxAllowedGrants and get updated value', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional);

    try {
      await updateApplication(application.id, {
        customClientMetadata: { maxAllowedGrants: 5 },
      });

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedGrants).toBe(5);
    } finally {
      await deleteApplication(application.id);
    }
  });

  devFeatureTest.it('should remove maxAllowedGrants after update without the field', async () => {
    const application = await createApplication(generateTestName(), ApplicationType.Traditional, {
      customClientMetadata: { maxAllowedGrants: 4 },
    });

    try {
      await updateApplication(application.id, {
        customClientMetadata: { idTokenTtl: 3600 },
      });

      const fetched = await getApplication(application.id);
      expect(fetched.customClientMetadata.maxAllowedGrants).toBeUndefined();
    } finally {
      await deleteApplication(application.id);
    }
  });

  devFeatureTest.it(
    'should not trigger revocation if no maxAllowedGrants config is found',
    async () => {
      await enableAllPasswordSignInMethods();

      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });
      const { app, signIn } = await createAppAndSignInWithPassword({ username, password });

      try {
        await signIn();

        const { grants } = await getUserApplicationGrants(user.id);
        const appGrants = grants.filter((grant) => grant.payload.clientId === app.id);

        expect(appGrants.length).toBeGreaterThan(1);
      } finally {
        await deleteApplication(app.id);
      }
    }
  );

  devFeatureTest.it(
    'should not trigger revocation if maxAllowedGrants is not exceeded',
    async () => {
      await enableAllPasswordSignInMethods();

      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });
      const { app, signIn } = await createAppAndSignInWithPassword({ username, password });

      try {
        await updateApplication(app.id, {
          customClientMetadata: {
            alwaysIssueRefreshToken: true,
            maxAllowedGrants: 2,
          },
        });

        await signIn();

        const { grants } = await getUserApplicationGrants(user.id);
        const appGrants = grants.filter((grant) => grant.payload.clientId === app.id);

        expect(appGrants).toHaveLength(2);
      } finally {
        await deleteApplication(app.id);
      }
    }
  );

  devFeatureTest.it(
    'should revoke the oldest grant when maxAllowedGrants is exceeded',
    async () => {
      await enableAllPasswordSignInMethods();

      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });
      const {
        app,
        signIn,
        refreshToken: oldestRefreshToken,
      } = await createAppAndSignInWithPassword({
        username,
        password,
      });

      try {
        await updateApplication(app.id, {
          customClientMetadata: {
            alwaysIssueRefreshToken: true,
            maxAllowedGrants: 1,
          },
        });

        // Grant `iat` is second-level precision. Ensure the next sign-in creates
        // a strictly newer grant so oldest-grant selection stays deterministic.
        await new Promise((resolve) => {
          setTimeout(resolve, 1100);
        });

        const { refreshToken: latestRefreshToken } = await signIn();

        const { grants } = await getUserApplicationGrants(user.id);
        const appGrants = grants.filter((grant) => grant.payload.clientId === app.id);

        expect(appGrants).toHaveLength(1);

        if (!oldestRefreshToken || !latestRefreshToken) {
          throw new Error('Refresh token is missing in maxAllowedGrants revocation test');
        }

        await assertRefreshTokenInvalidGrant({
          clientId: app.id,
          refreshToken: oldestRefreshToken,
        });
        await assertRefreshTokenValid({
          clientId: app.id,
          refreshToken: latestRefreshToken,
        });
      } finally {
        await deleteApplication(app.id);
      }
    }
  );
});
