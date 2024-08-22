import { TemplateType } from '@logto/connector-kit';
import { emailRegEx } from '@logto/core-kit';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type { RouterInitArgs } from '#src/routes/types.js';

import RequestError from '../errors/RequestError/index.js';
import assertThat from '../utils/assert-that.js';

import type { AuthedMeRouter } from './types.js';

export default function verificationCodeRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const codeType = TemplateType.Generic;
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
      }),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { verificationCode, ...identifier } = ctx.guard.body;

      const user = await findUserById(userId);
      assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      await verifyPasscode(undefined, codeType, verificationCode, identifier);

      await createVerificationStatus(userId, identifier.email);

      ctx.status = 204;

      return next();
    }
  );
}
