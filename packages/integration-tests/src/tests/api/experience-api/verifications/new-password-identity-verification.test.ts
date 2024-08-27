import { SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, randomString } from '#src/utils.js';

devFeatureTest.describe('password verifications', () => {
  const username = 'test_' + randomString();
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await updateSignInExperience({
      passwordPolicy: {
        length: { min: 8, max: 32 },
        characterTypes: { min: 3 },
        rejects: {
          pwned: true,
          repetitionAndSequence: true,
          userInfo: true,
          words: [username],
        },
      },
    });
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  afterAll(async () => {
    await updateSignInExperience({
      // Need to reset password policy to default value otherwise it will affect other tests.
      passwordPolicy: {},
    });
  });

  describe('invalid identifier check', () => {
    it('should throw error if username is registered', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      const client = await initExperienceClient();

      await expectRejects(
        client.createNewPasswordIdentityVerification({
          identifier: {
            type: SignInIdentifier.Username,
            value: username,
          },
          password,
        }),
        {
          code: 'user.username_already_in_use',
          status: 422,
        }
      );
    });

    it('email password is not supported', async () => {
      const { primaryEmail, password } = generateNewUserProfile({
        primaryEmail: true,
        password: true,
      });

      await userApi.create({ primaryEmail, password });

      const client = await initExperienceClient();

      await expectRejects(
        client.createNewPasswordIdentityVerification({
          identifier: {
            type: SignInIdentifier.Email,
            value: primaryEmail,
          },
          password,
        }),
        {
          code: 'guard.invalid_input',
          status: 400,
        }
      );
    });
  });

  describe('password policy check', () => {
    const invalidPasswords: Array<[string, string | RegExp]> = [
      ['123', 'minimum length'],
      ['12345678', 'at least 3 types'],
      ['123456aA', 'simple password'],
      ['defghiZ@', 'sequential characters'],
      ['TTTTTT@z', 'repeated characters'],
      [username, 'userInfo'],
    ];

    it.each(invalidPasswords)('should reject invalid password %p', async (password) => {
      const client = await initExperienceClient();

      await expectRejects(
        client.createNewPasswordIdentityVerification({
          identifier: {
            type: SignInIdentifier.Username,
            value: username,
          },
          password,
        }),
        {
          code: `password.rejected`,
          status: 422,
        }
      );
    });
  });

  it('should create new password identity verification successfully', async () => {
    const client = await initExperienceClient();

    const { verificationId } = await client.createNewPasswordIdentityVerification({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password: '?sy8Q3z3_G',
    });

    expect(verificationId).toBeTruthy();
  });
});
