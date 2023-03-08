import { VerificationCodeType } from '@logto/connector-kit';
import { emailRegEx } from '@logto/core-kit';
import { literal, object, string, union } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { RouterInitArgs } from '#src/routes/types.js';
import assertThat from '#src/utils/assert-that.js';
import { convertCookieToMap } from '#src/utils/cookie.js';

import type { AuthedMeRouter } from './types.js';

export default function verificationCodeRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const codeType = VerificationCodeType.Generic;
  const {
    queries: {
      users: { findUserById },
    },
    libraries: {
      passcodes: { createPasscode, sendPasscode, verifyPasscode },
      verificationStatuses: { createVerificationStatus },
    },
  } = tenant;

  router.post(
    '/verification-codes',
    koaGuard({
      body: object({ email: string().regex(emailRegEx) }),
      status: 204,
    }),
    async (ctx, next) => {
      const code = await createPasscode(undefined, codeType, ctx.guard.body);
      await sendPasscode(code);

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/verification-codes/verify',
    koaGuard({
      body: object({
        email: string().regex(emailRegEx),
        verificationCode: string().min(1),
        action: union([literal('changeEmail'), literal('changePassword')]),
      }),
      status: 204,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { verificationCode, action, ...identifier } = ctx.guard.body;
      await verifyPasscode(undefined, codeType, verificationCode, identifier);

      if (action === 'changePassword') {
        // Store password verification status
        const cookieMap = convertCookieToMap(ctx.request.headers.cookie);
        const sessionId = cookieMap.get('_session');

        assertThat(sessionId, new RequestError({ code: 'session.not_found', status: 401 }));

        const user = await findUserById(userId);
        assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

        await createVerificationStatus(userId, sessionId);
      }

      ctx.status = 204;

      return next();
    }
  );
}
