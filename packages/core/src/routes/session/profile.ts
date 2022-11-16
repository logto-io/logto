import { emailRegEx, passwordRegEx, usernameRegEx } from '@logto/core-kit';
import { userInfoSelectFields } from '@logto/schemas';
import { argon2Verify } from 'hash-wasm';
import pick from 'lodash.pick';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { checkSessionHealth } from '@/lib/session';
import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findUserById, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import type { AnonymousRouter } from '../types';
import { verificationTimeout } from './consts';
import { checkSignUpIdentifierCollision } from './utils';

export const profileRoute = '/session/profile';

export default function profileRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.get(profileRoute, async (ctx, next) => {
    const { accountId } = await provider.Session.get(ctx);

    if (!accountId) {
      throw new RequestError('auth.unauthorized');
    }

    const user = await findUserById(accountId);

    ctx.body = pick(user, ...userInfoSelectFields);

    return next();
  });

  router.patch(
    `${profileRoute}/username`,
    koaGuard({
      body: object({ username: string().regex(usernameRegEx) }),
    }),
    async (ctx, next) => {
      const userId = await checkSessionHealth(ctx, provider, verificationTimeout);

      assertThat(userId, new RequestError('auth.unauthorized'));

      const { username } = ctx.guard.body;

      await checkSignUpIdentifierCollision({ username }, userId);

      const user = await updateUserById(userId, { username }, 'replace');

      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.patch(
    `${profileRoute}/password`,
    koaGuard({
      body: object({ password: string().regex(passwordRegEx) }),
    }),
    async (ctx, next) => {
      const userId = await checkSessionHealth(ctx, provider, verificationTimeout);

      assertThat(userId, new RequestError('auth.unauthorized'));

      const { password } = ctx.guard.body;
      const { passwordEncrypted: oldPasswordEncrypted } = await findUserById(userId);

      assertThat(
        !oldPasswordEncrypted || !(await argon2Verify({ password, hash: oldPasswordEncrypted })),
        new RequestError({ code: 'user.same_password', status: 422 })
      );

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      await updateUserById(userId, { passwordEncrypted, passwordEncryptionMethod });

      ctx.status = 204;

      return next();
    }
  );

  router.patch(
    `${profileRoute}/email`,
    koaGuard({
      body: object({ primaryEmail: string().regex(emailRegEx) }),
    }),
    async (ctx, next) => {
      const userId = await checkSessionHealth(ctx, provider, verificationTimeout);

      assertThat(userId, new RequestError('auth.unauthorized'));

      const { primaryEmail } = ctx.guard.body;

      await checkSignUpIdentifierCollision({ primaryEmail });
      await updateUserById(userId, { primaryEmail });

      ctx.status = 204;

      return next();
    }
  );

  router.delete(`${profileRoute}/email`, async (ctx, next) => {
    const userId = await checkSessionHealth(ctx, provider, verificationTimeout);

    assertThat(userId, new RequestError('auth.unauthorized'));

    const { primaryEmail } = await findUserById(userId);

    assertThat(primaryEmail, new RequestError({ code: 'user.email_not_exists', status: 422 }));

    await updateUserById(userId, { primaryEmail: null });

    ctx.status = 204;

    return next();
  });
}
