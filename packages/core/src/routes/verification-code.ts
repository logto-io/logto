import { VerificationCodeType } from '@logto/connector-kit';
import {
  requestVerificationCodePayloadGuard,
  verifyVerificationCodePayloadGuard,
} from '@logto/schemas';

import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

const codeType = VerificationCodeType.Generic;

export default function verificationCodeRoutes<T extends AuthedRouter>(
  ...[router, { libraries }]: RouterInitArgs<T>
) {
  const {
    passcodes: { createPasscode, sendPasscode, verifyPasscode },
  } = libraries;

  router.post(
    '/verification-codes',
    koaGuard({
      body: requestVerificationCodePayloadGuard,
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
      body: verifyVerificationCodePayloadGuard,
    }),
    async (ctx, next) => {
      const { verificationCode, ...identifier } = ctx.guard.body;
      await verifyPasscode(undefined, codeType, verificationCode, identifier);

      ctx.status = 204;

      return next();
    }
  );
}
