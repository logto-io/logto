import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { setAlwaysFailCaptcha, setAlwaysPassCaptcha } from '#src/helpers/captcha.js';
import {
  registerNewUserUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  disableCaptcha,
  enableAllPasswordSignInMethods,
  enableCaptcha,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('captcha', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      passwordPolicy: {},
    });
    await enableCaptcha();
    await setAlwaysPassCaptcha();
  });

  afterEach(async () => {
    await setAlwaysPassCaptcha();
  });

  afterAll(async () => {
    await disableCaptcha();
  });

  describe('basic sign in and captcha verification failure', () => {
    it('should sign-in successfully with captcha token', async () => {
      const { userProfile, user } = await generateNewUser({
        username: true,
        password: true,
      });

      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Username,
          value: userProfile.username,
        },
        password: userProfile.password,
        captchaToken: 'captcha-token',
      });

      await deleteUser(user.id);
    });

    it('should fail to sign-in if no captcha token', async () => {
      const { userProfile, user } = await generateNewUser({
        username: true,
        password: true,
      });

      await expectRejects(
        signInWithPassword({
          identifier: {
            type: SignInIdentifier.Username,
            value: userProfile.username,
          },
          password: userProfile.password,
        }),
        {
          code: 'session.captcha_required',
          status: 422,
        }
      );

      await deleteUser(user.id);
    });

    it('should fail to sign-in if captcha token is invalid', async () => {
      await setAlwaysFailCaptcha();
      const { userProfile, user } = await generateNewUser({
        username: true,
        password: true,
      });

      await expectRejects(
        signInWithPassword({
          identifier: { type: SignInIdentifier.Username, value: userProfile.username },
          password: userProfile.password,
          captchaToken: 'captcha-token',
        }),
        {
          code: 'session.captcha_failed',
          status: 422,
        }
      );

      await deleteUser(user.id);
    });
  });

  describe('register', () => {
    it('should register successfully with captcha token', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const userId = await registerNewUserUsernamePassword(username, password, 'captcha-token');

      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
        captchaToken: 'captcha-token',
      });

      await deleteUser(userId);
    });

    it('should fail to register if no captcha token is provided', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await expectRejects(registerNewUserUsernamePassword(username, password), {
        code: 'session.captcha_required',
        status: 422,
      });

      // Register again with the same username, ensure the user is not created
      const userId = await registerNewUserUsernamePassword(username, password, 'captcha-token');
      await deleteUser(userId);
    });
  });
});
