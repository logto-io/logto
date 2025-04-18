import { SignInIdentifier } from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { signInWithPassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { generateUsername } from '#src/utils.js';

describe('basic sentinel', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    /**
     * The default policy settings is way too big for the test.
     * We need to override it to make the test.
     * Update the sign-in experience to use the legacy policy settings:
     *
     * - maxAttempts: 5
     * - lockoutDuration: 10 minutes
     */
    await updateSignInExperience({
      sentinelPolicy: {
        maxAttempts: 5,
        lockoutDuration: 10,
      },
    });
  });

  describe('sign-in with non-existing username and password', () => {
    const fakeUsername = generateUsername();
    it('should block a non-existing identifier after 4 failed attempts', async () => {
      const client = await initExperienceClient();

      for (const i of [1, 2, 3, 4]) {
        // eslint-disable-next-line no-await-in-loop
        await expectRejects(
          client.verifyPassword({
            identifier: {
              type: SignInIdentifier.Username,
              value: fakeUsername,
            },
            password: 'account or password',
          }),
          {
            code: 'session.invalid_credentials',
            status: 422,
          }
        );
      }

      // The 5th attempt should be blocked
      await expectRejects(
        client.verifyPassword({
          identifier: {
            type: SignInIdentifier.Username,
            value: fakeUsername,
          },
          password: 'account or password',
        }),
        {
          code: 'session.verification_blocked_too_many_attempts',
          status: 400,
        }
      );
    });

    it('should unblock the identifier by calling management API', async () => {
      await authedAdminApi.post('sentinel-activities/delete', {
        json: {
          targetType: 'User',
          targets: [fakeUsername],
        },
      });

      const client = await initExperienceClient();

      await expectRejects(
        client.verifyPassword({
          identifier: {
            type: SignInIdentifier.Username,
            value: fakeUsername,
          },
          password: 'account or password',
        }),
        {
          code: 'session.invalid_credentials',
          status: 422,
        }
      );
    });
  });

  describe('sign-in with wrong password', () => {
    const userApi = new UserApiTest();
    const { username, password } = generateNewUserProfile({
      username: true,
      password: true,
    });

    beforeAll(async () => {
      await userApi.create({
        username,
        password,
      });
    });

    afterAll(async () => {
      await userApi.cleanUp();
    });

    it('should block password verification after 5 failed attempts ', async () => {
      const client = await initExperienceClient();

      for (const i of [1, 2, 3, 4]) {
        // eslint-disable-next-line no-await-in-loop
        await expectRejects(
          client.verifyPassword({
            identifier: {
              type: SignInIdentifier.Username,
              value: username,
            },
            password: 'account or password',
          }),
          {
            code: 'session.invalid_credentials',
            status: 422,
          }
        );
      }

      // The 5th attempt should be blocked
      await expectRejects(
        client.verifyPassword({
          identifier: {
            type: SignInIdentifier.Username,
            value: username,
          },
          password: 'account or password',
        }),
        {
          code: 'session.verification_blocked_too_many_attempts',
          status: 400,
        }
      );

      // The 6th success attempt should be blocked
      await expectRejects(
        client.verifyPassword({
          identifier: {
            type: SignInIdentifier.Username,
            value: username,
          },
          password,
        }),
        {
          code: 'session.verification_blocked_too_many_attempts',
          status: 400,
        }
      );
    });

    it('should unblock the identifier by calling management API', async () => {
      await authedAdminApi.post('sentinel-activities/delete', {
        json: {
          targetType: 'User',
          targets: [username],
        },
      });

      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
      });
    });
  });
});
