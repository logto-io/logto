import { passwordRegEx } from '@logto/core-kit';
import { argon2Verify } from 'hash-wasm';
import type { Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import { findUserById, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import type { AnonymousRouter } from '../types';
import { forgotPasswordSessionResultGuard } from './types';
import {
  clearVerificationResult,
  getRoutePrefix,
  getVerificationStorageFromInteraction,
  checkValidateExpiration,
} from './utils';

export const forgotPasswordRoute = getRoutePrefix('forgot-password');

export default function forgotPasswordRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.post(
    `${forgotPasswordRoute}/reset`,
    koaGuard({ body: z.object({ password: z.string().regex(passwordRegEx) }) }),
    async (ctx, next) => {
      const signInExperience = await findDefaultSignInExperience();
      assertThat(
        signInExperience.forgotPassword,
        new RequestError({ code: 'session.forgot_password_not_enabled', status: 422 })
      );

      const { password } = ctx.guard.body;

      const verificationStorage = await getVerificationStorageFromInteraction(
        ctx,
        provider,
        forgotPasswordSessionResultGuard
      );

      const type = 'ForgotPasswordReset';
      ctx.log(type, verificationStorage);

      const { userId, expiresAt } = verificationStorage;

      checkValidateExpiration(expiresAt);

      const { passwordEncrypted: oldPasswordEncrypted } = await findUserById(userId);

      assertThat(
        !oldPasswordEncrypted ||
          (oldPasswordEncrypted && !(await argon2Verify({ password, hash: oldPasswordEncrypted }))),
        new RequestError({ code: 'user.same_password', status: 400 })
      );

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      ctx.log(type, { userId });

      await updateUserById(userId, { passwordEncrypted, passwordEncryptionMethod });
      await clearVerificationResult(ctx, provider);
      ctx.status = 204;

      return next();
    }
  );
}
