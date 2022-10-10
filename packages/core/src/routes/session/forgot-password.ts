import { passwordRegEx } from '@logto/core-kit';
import { argon2Verify } from 'hash-wasm';
import { Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findUserById, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { forgotPasswordSessionResultGuard } from './types';
import {
  getRoutePrefix,
  getVerificationStorageFromInteraction,
  validateAndCheckWhetherVerificationExpires,
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
      const { password } = ctx.guard.body;

      const verificationStorage = await getVerificationStorageFromInteraction(
        ctx,
        provider,
        forgotPasswordSessionResultGuard
      );

      const type = 'ForgotPasswordReset';
      ctx.log(type, verificationStorage);

      const { id, expiresAt } = verificationStorage;

      validateAndCheckWhetherVerificationExpires(expiresAt);

      const { passwordEncrypted: oldPasswordEncrypted } = await findUserById(id);

      assertThat(
        !oldPasswordEncrypted ||
          (oldPasswordEncrypted && !(await argon2Verify({ password, hash: oldPasswordEncrypted }))),
        new RequestError({ code: 'user.same_password', status: 400 })
      );

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      ctx.log(type, { userId: id });

      await updateUserById(id, { passwordEncrypted, passwordEncryptionMethod });
      ctx.status = 204;

      return next();
    }
  );
}
