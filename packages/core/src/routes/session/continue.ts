import { passwordRegEx } from '@logto/core-kit';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import { findUserById, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import type { AnonymousRouter } from '../types';
import { checkRequiredProfile, getContinueSignInResult, getRoutePrefix } from './utils';

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
        !user.passwordEncrypted && Object.keys(user.identities).length === 0,
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
}
