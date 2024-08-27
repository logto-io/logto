import {
  InteractionEvent,
  SentinelActivityAction,
  type VerificationCodeIdentifier,
  verificationCodeIdentifierGuard,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import { type LogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import type ExperienceInteraction from '../classes/experience-interaction.js';
import { withSentinel } from '../classes/libraries/sentinel-guard.js';
import { codeVerificationIdentifierRecordTypeMap } from '../classes/utils.js';
import { createNewCodeVerificationRecord } from '../classes/verifications/code-verification.js';
import { experienceRoutes } from '../const.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

const createVerificationCodeAuditLog = (
  { createLog }: LogContext,
  { interactionEvent }: ExperienceInteraction,
  identifier: VerificationCodeIdentifier,
  action: Action
) => {
  const verificationType = codeVerificationIdentifierRecordTypeMap[identifier.type];

  return createLog(`Interaction.${interactionEvent}.Verification.${verificationType}.${action}`);
};

export default function verificationCodeRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  { libraries, queries, sentinel }: TenantContext
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

      const log = createVerificationCodeAuditLog(
        ctx,
        ctx.experienceInteraction,
        identifier,
        Action.Create
      );

      log.append({
        payload: {
          identifier,
          interactionEvent,
        },
      });

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
      const { experienceInteraction } = ctx;

      const log = createVerificationCodeAuditLog(
        ctx,
        ctx.experienceInteraction,
        identifier,
        Action.Submit
      );

      log.append({
        payload: {
          identifier,
          verificationId,
          code,
        },
      });

      const codeVerificationRecord = ctx.experienceInteraction.getVerificationRecordByTypeAndId(
        codeVerificationIdentifierRecordTypeMap[identifier.type],
        verificationId
      );

      await withSentinel(
        {
          sentinel,
          action: SentinelActivityAction.VerificationCode,
          identifier,
          payload: {
            event: experienceInteraction.interactionEvent,
            verificationId: codeVerificationRecord.id,
          },
        },
        codeVerificationRecord.verify(identifier, code)
      );

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: codeVerificationRecord.id,
      };

      return next();
    }
  );
}
