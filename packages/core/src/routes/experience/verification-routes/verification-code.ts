import {
  InteractionEvent,
  VerificationType,
  verificationCodeIdentifierGuard,
} from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { CodeVerification } from '../classes/verifications/code-verification.js';
import { experienceVerificationApiRoutesPrefix } from '../const.js';
import { type WithInteractionSessionContext } from '../middleware/koa-interaction-session.js';

export default function verificationCodeRoutes<T extends WithLogContext>(
  router: Router<unknown, WithInteractionSessionContext<T>>,
  { libraries, queries }: TenantContext
) {
  router.post(
    `${experienceVerificationApiRoutesPrefix}/verification-code`,
    koaGuard({
      body: z.object({
        identifier: verificationCodeIdentifierGuard,
        interactionEvent: z.nativeEnum(InteractionEvent),
      }),
      response: z.object({
        verificationId: z.string(),
      }),
      // 501: connector not found
      status: [200, 400, 404, 501],
    }),
    async (ctx, next) => {
      const { identifier, interactionEvent } = ctx.guard.body;

      const codeVerification = await CodeVerification.create(
        libraries,
        queries,
        identifier,
        interactionEvent
      );

      ctx.interactionSession.appendVerificationRecord(codeVerification);

      await ctx.interactionSession.save();

      ctx.body = {
        verificationId: codeVerification.id,
      };

      await next();
    }
  );

  router.post(
    `${experienceVerificationApiRoutesPrefix}/verification-code/verify`,
    koaGuard({
      body: z.object({
        identifier: verificationCodeIdentifierGuard,
        verificationId: z.string(),
        code: z.string(),
      }),
      response: z.object({
        verificationId: z.string(),
      }),
      // 501: connector not found
      status: [200, 400, 404, 501],
    }),
    async (ctx, next) => {
      const { verificationId, code, identifier } = ctx.guard.body;

      const codeVerificationRecord =
        ctx.interactionSession.getVerificationRecordById(verificationId);

      assertThat(
        codeVerificationRecord &&
          // Make the Verification type checker happy
          codeVerificationRecord.type === VerificationType.VerificationCode,
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );

      await codeVerificationRecord.verify(identifier, code);

      await ctx.interactionSession.save();

      ctx.body = {
        verificationId: codeVerificationRecord.id,
      };

      return next();
    }
  );
}
