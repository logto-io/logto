import { TemplateType } from '@logto/connector-kit';
import {
  requestVerificationCodePayloadGuard,
  SentinelActivityAction,
  verifyVerificationCodePayloadGuard,
} from '@logto/schemas';

import koaGuard from '#src/middleware/koa-guard.js';
import { buildMessageRateGuard, withMessageRateGuard } from '#src/sentinel/message-rate-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

const codeType = TemplateType.Generic;

export default function verificationCodeRoutes<T extends ManagementApiRouter>(
  ...[router, { libraries, queries }]: RouterInitArgs<T>
) {
  const {
    passcodes: { createPasscode, sendPasscode, verifyPasscode },
  } = libraries;

  router.post(
    '/verification-codes',
    koaGuard({
      body: requestVerificationCodePayloadGuard,
      status: [204, 400, 429, 501],
    }),
    async (ctx, next) => {
      const recipient = 'email' in ctx.guard.body ? ctx.guard.body.email : ctx.guard.body.phone;
      // Create the passcode inside `send` so a rate-limited request neither creates a passcode nor
      // deletes the recipient's existing unconsumed one (createPasscode replaces prior codes).
      const send = async () => {
        const code = await createPasscode(undefined, codeType, ctx.guard.body);
        return sendPasscode(code, { ip: ctx.request.ip });
      };

      await withMessageRateGuard(
        await buildMessageRateGuard(queries),
        { action: SentinelActivityAction.VerificationCodeSend, recipient },
        send
      );

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/verification-codes/verify',
    koaGuard({
      body: verifyVerificationCodePayloadGuard,
      status: [204, 400],
    }),
    async (ctx, next) => {
      const { verificationCode, ...identifier } = ctx.guard.body;
      await verifyPasscode(undefined, codeType, verificationCode, identifier);

      ctx.status = 204;

      return next();
    }
  );
}
