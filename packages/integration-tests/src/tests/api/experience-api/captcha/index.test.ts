import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { setAlwaysFailCaptcha, setAlwaysPassCaptcha } from '#src/helpers/captcha.js';
import { signInWithPassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  disableCaptcha,
  enableAllPasswordSignInMethods,
  enableCaptcha,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('captcha', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableCaptcha();
    await setAlwaysPassCaptcha();
  });

  afterAll(async () => {
    await disableCaptcha();
  });

  it('should sign-in successfully with captcha token', async () => {
    await setAlwaysPassCaptcha();
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
