import { passwordRegEx, usernameRegEx } from '@logto/core-kit';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import {
  assignInteractionResults,
  getApplicationIdFromInteraction,
} from '#src/libraries/session.js';
import { getSignInExperienceForApplication } from '#src/libraries/sign-in-experience/index.js';
import { encryptUserPassword } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import {
  findUserById,
  hasUser,
  hasUserWithEmail,
  hasUserWithPhone,
  updateUserById,
} from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouter } from '../types.js';
import { continueEmailSessionResultGuard, continueSmsSessionResultGuard } from './types.js';
import {
  checkRequiredProfile,
  getContinueSignInResult,
  getRoutePrefix,
  getVerificationStorageFromInteraction,
  isUserPasswordSet,
} from './utils.js';

export const continueRoute = getRoutePrefix('sign-in', 'continue');

export default function continueRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.post(
    `${continueRoute}/password`,
    koaGuard({
      body: object({
        password: string().regex(passwordRegEx),
      }),
    }),
    async (ctx, next) => {
      const { password } = ctx.guard.body;
      const { userId } = await getContinueSignInResult(ctx, provider);
      const user = await findUserById(userId);

      // Social identities can take place the role of password
      assertThat(
        !isUserPasswordSet(user),
        new RequestError({
          code: 'user.password_exists_in_profile',
        })
      );

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      const updatedUser = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });
      const signInExperience = await getSignInExperienceForApplication(
        await getApplicationIdFromInteraction(ctx, provider)
      );
      await checkRequiredProfile(ctx, provider, updatedUser, signInExperience);
      await assignInteractionResults(ctx, provider, { login: { accountId: updatedUser.id } });

      return next();
    }
  );

  router.post(
    `${continueRoute}/username`,
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
      }),
    }),
    async (ctx, next) => {
      const { username } = ctx.guard.body;
      const { userId } = await getContinueSignInResult(ctx, provider);
      const user = await findUserById(userId);

      assertThat(
        !user.username,
        new RequestError({
          code: 'user.username_exists_in_profile',
        })
      );

      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_already_in_use',
          status: 422,
        })
      );

      const updatedUser = await updateUserById(userId, {
        username,
      });
      const signInExperience = await getSignInExperienceForApplication(
        await getApplicationIdFromInteraction(ctx, provider)
      );
      await checkRequiredProfile(ctx, provider, updatedUser, signInExperience);
      await assignInteractionResults(ctx, provider, { login: { accountId: updatedUser.id } });

      return next();
    }
  );

  router.post(`${continueRoute}/email`, async (ctx, next) => {
    const { userId } = await getContinueSignInResult(ctx, provider);
    const { email } = await getVerificationStorageFromInteraction(
      ctx,
      provider,
      continueEmailSessionResultGuard
    );
    const user = await findUserById(userId);

    assertThat(
      !user.primaryEmail,
      new RequestError({
        code: 'user.email_exists_in_profile',
      })
    );

    assertThat(
      !(await hasUserWithEmail(email)),
      new RequestError({
        code: 'user.email_already_in_use',
        status: 422,
      })
    );

    const updatedUser = await updateUserById(userId, {
      primaryEmail: email,
    });
    const signInExperience = await getSignInExperienceForApplication(
      await getApplicationIdFromInteraction(ctx, provider)
    );
    await checkRequiredProfile(ctx, provider, updatedUser, signInExperience);
    await assignInteractionResults(ctx, provider, { login: { accountId: updatedUser.id } });

    return next();
  });

  router.post(`${continueRoute}/sms`, async (ctx, next) => {
    const { userId } = await getContinueSignInResult(ctx, provider);
    const { phone } = await getVerificationStorageFromInteraction(
      ctx,
      provider,
      continueSmsSessionResultGuard
    );
    const user = await findUserById(userId);

    assertThat(
      !user.primaryPhone,
      new RequestError({
        code: 'user.phone_exists_in_profile',
      })
    );

    assertThat(
      !(await hasUserWithPhone(phone)),
      new RequestError({
        code: 'user.phone_already_in_use',
        status: 422,
      })
    );

    const updatedUser = await updateUserById(userId, {
      primaryPhone: phone,
    });
    const signInExperience = await getSignInExperienceForApplication(
      await getApplicationIdFromInteraction(ctx, provider)
    );
    await checkRequiredProfile(ctx, provider, updatedUser, signInExperience);
    await assignInteractionResults(ctx, provider, { login: { accountId: updatedUser.id } });

    return next();
  });
}
