import { emailRegEx, passwordRegEx, usernameRegEx } from '@logto/core-kit';
import type { PasswordVerificationData } from '@logto/schemas';
import { passwordVerificationGuard, arbitraryObjectGuard } from '@logto/schemas';
import { literal, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword, verifyUserPassword } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { convertCookieToMap } from '#src/utils/cookie.js';

import type { RouterInitArgs } from '../routes/types.js';
import type { AuthedMeRouter } from './types.js';

export default function userRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: {
      users: { findUserById, updateUserById },
    },
    libraries: {
      users: { checkIdentifierCollision },
    },
  } = tenant;

  router.patch(
    '/user',
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
        primaryEmail: string().regex(emailRegEx),
        name: string().or(literal('')).nullable(),
        avatar: string().url().or(literal('')).nullable(),
      }).partial(),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { body } = ctx.guard;

      const user = await findUserById(userId);
      assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      await checkIdentifierCollision(body, userId);
      await updateUserById(userId, body);
      ctx.status = 204;

      return next();
    }
  );

  router.get('/custom-data', async (ctx, next) => {
    const { id: userId } = ctx.auth;
    const user = await findUserById(userId);

    ctx.body = user.customData;

    return next();
  });

  router.patch(
    '/custom-data',
    koaGuard({
      body: arbitraryObjectGuard,
      response: arbitraryObjectGuard,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { body: customData } = ctx.guard;

      await findUserById(userId);

      const user = await updateUserById(userId, {
        customData,
      });

      ctx.body = user.customData;

      return next();
    }
  );

  router.post(
    '/password/verify',
    koaGuard({
      body: object({ password: string().regex(passwordRegEx) }),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password } = ctx.guard.body;
      const cookieMap = convertCookieToMap(ctx.request.headers.cookie);
      const sessionId = cookieMap.get('_session');

      assertThat(Boolean(sessionId), new RequestError({ code: 'session.not_found', status: 401 }));

      const user = await findUserById(userId);
      assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      await verifyUserPassword(user, password);

      const customData: PasswordVerificationData = {
        passwordVerifiedAt: Date.now(),
        passwordVerifiedWithSessionId: sessionId,
      };

      await updateUserById(userId, { customData });

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/password',
    koaGuard({ body: object({ password: string().regex(passwordRegEx) }) }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password } = ctx.guard.body;

      const { customData, isSuspended } = await findUserById(userId);
      assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      const cookieMap = convertCookieToMap(ctx.request.headers.cookie);
      const sessionId = cookieMap.get('_session');
      const parsed = passwordVerificationGuard.safeParse(customData);

      // The password verification status is considered valid if:
      // 1. The password is verified within 10 minutes.
      // 2. The password is verified with the same session.
      const isValid =
        parsed.success &&
        Date.now() - parsed.data.passwordVerifiedAt < 1000 * 60 * 10 &&
        Boolean(sessionId) &&
        parsed.data.passwordVerifiedWithSessionId === sessionId;

      assertThat(isValid, new RequestError({ code: 'session.verification_failed', status: 401 }));

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      await updateUserById(userId, { passwordEncrypted, passwordEncryptionMethod });

      ctx.status = 204;

      return next();
    }
  );
}
