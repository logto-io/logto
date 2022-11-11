import { passwordRegEx, usernameRegEx } from '@logto/core-kit';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import {
  findUserById,
  hasUser,
  hasUserWithEmail,
  hasUserWithPhone,
  updateUserById,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import type { AnonymousRouter } from '../types';
import { continueEmailSessionResultGuard, continueSmsSessionResultGuard } from './types';
import {
  checkRequiredProfile,
  getContinueSignInResult,
  getRoutePrefix,
  getVerificationStorageFromInteraction,
  isUserPasswordSet,
} from './utils';

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
          code: 'user.password_exists',
        })
      );

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      const updatedUser = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });
      const signInExperience = await findDefaultSignInExperience();
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
          code: 'user.username_exists',
        })
      );

      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_exists_register',
          status: 422,
        })
      );

      const updatedUser = await updateUserById(userId, {
        username,
      });
      const signInExperience = await findDefaultSignInExperience();
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
        code: 'user.email_exists',
      })
    );

    assertThat(
      !(await hasUserWithEmail(email)),
      new RequestError({
        code: 'user.email_exists_register',
        status: 422,
      })
    );

    const updatedUser = await updateUserById(userId, {
      primaryEmail: email,
    });
    const signInExperience = await findDefaultSignInExperience();
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
        code: 'user.sms_exists',
      })
    );

    assertThat(
      !(await hasUserWithPhone(phone)),
      new RequestError({
        code: 'user.phone_exists_register',
        status: 422,
      })
    );

    const updatedUser = await updateUserById(userId, {
      primaryPhone: phone,
    });
    const signInExperience = await findDefaultSignInExperience();
    await checkRequiredProfile(ctx, provider, updatedUser, signInExperience);
    await assignInteractionResults(ctx, provider, { login: { accountId: updatedUser.id } });

    return next();
  });
}
