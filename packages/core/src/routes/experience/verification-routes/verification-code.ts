import { InteractionEvent, verificationCodeIdentifierGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { codeVerificationIdentifierRecordTypeMap } from '../classes/utils.js';
import { createNewCodeVerificationRecord } from '../classes/verifications/code-verification.js';
import { experienceRoutes } from '../const.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function verificationCodeRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  { libraries, queries }: TenantContext
) {
  router.post(
    `${experienceRoutes.verification}/verification-code`,
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

      const codeVerification = createNewCodeVerificationRecord(
        libraries,
        queries,
        identifier,
        interactionEvent
      );

      await codeVerification.sendVerificationCode();

      ctx.experienceInteraction.setVerificationRecord(codeVerification);

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: codeVerification.id,
      };

      await next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/verification-code/verify`,
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

      const codeVerificationRecord = ctx.experienceInteraction.getVerificationRecordByTypeAndId(
        codeVerificationIdentifierRecordTypeMap[identifier.type],
        verificationId
      );

      await codeVerificationRecord.verify(identifier, code);

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: codeVerificationRecord.id,
      };

      return next();
    }
  );
}
