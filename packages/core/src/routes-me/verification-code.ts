import { VerificationCodeType } from '@logto/connector-kit';
import { emailRegEx } from '@logto/core-kit';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type { RouterInitArgs } from '#src/routes/types.js';

import type { AuthedMeRouter } from './types.js';

export default function verificationCodeRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const codeType = VerificationCodeType.Generic;
  const {
    passcodes: { createPasscode, sendPasscode, verifyPasscode },
  } = tenant.libraries;

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
      body: object({ email: string().regex(emailRegEx), verificationCode: string().min(1) }),
    }),
    async (ctx, next) => {
      const { verificationCode, ...identifier } = ctx.guard.body;
      await verifyPasscode(undefined, codeType, verificationCode, identifier);

      ctx.status = 204;

      return next();
    }
  );
}
