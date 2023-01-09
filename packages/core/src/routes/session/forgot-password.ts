import { passwordRegEx } from '@logto/core-kit';
import { argon2Verify } from 'hash-wasm';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { findUserById, updateUserById } from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouterLegacy } from '../types.js';
import { forgotPasswordSessionResultGuard } from './types.js';
import {
  clearVerificationResult,
  getRoutePrefix,
  getVerificationStorageFromInteraction,
  checkValidateExpiration,
} from './utils.js';

export const forgotPasswordRoute = getRoutePrefix('forgot-password');

export default function forgotPasswordRoutes<T extends AnonymousRouterLegacy>(
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

      const { userId, expiresAt } = verificationStorage;

      checkValidateExpiration(expiresAt);

      const { passwordEncrypted: oldPasswordEncrypted } = await findUserById(userId);

      assertThat(
        !oldPasswordEncrypted || !(await argon2Verify({ password, hash: oldPasswordEncrypted })),
        new RequestError({ code: 'user.same_password', status: 422 })
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
