import { TemplateType } from '@logto/connector-kit';
import {
  InteractionEvent,
  SignInIdentifier,
  verificationCodeIdentifierGuard,
} from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { codeVerificationIdentifierRecordTypeMap } from '../classes/utils.js';
import {
  createNewCodeVerificationRecord,
  createNewMfaCodeVerificationRecord,
  getTemplateTypeByEvent,
} from '../classes/verifications/code-verification.js';
import { experienceRoutes } from '../const.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

import {
  sendCode,
  verifyCode,
  getMfaIdentifier,
  getMfaVerificationType,
} from './verification-code-helpers.js';

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
      status: [200, 400, 404, 422, 501],
    }),
    async (ctx, next) => {
      const { identifier, interactionEvent } = ctx.guard.body;
      // Require captcha if the user is not identified.
      if (!ctx.experienceInteraction.identifiedUserId) {
        await ctx.experienceInteraction.guardCaptcha();
      }

      ctx.body = await sendCode({
        identifier,
        interactionEvent,
        createVerificationRecord: () =>
          createNewCodeVerificationRecord(
            libraries,
            queries,
            identifier,
            // If the interaction already identified a user, we are binding a new identifier
            ctx.experienceInteraction.identifiedUserId
              ? TemplateType.BindNewIdentifier
              : getTemplateTypeByEvent(interactionEvent)
          ),
        libraries,
        ctx,
      });

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

      ctx.body = await verifyCode({
        verificationId,
        code,
        identifier,
        verificationType: codeVerificationIdentifierRecordTypeMap[identifier.type],
        sentinel,
        ctx,
      });

      return next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/mfa-verification-code`,
    koaGuard({
      body: z.object({
        identifierType: z.enum([SignInIdentifier.Email, SignInIdentifier.Phone]),
      }),
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404, 501],
    }),
    async (ctx, next) => {
      const { identifierType } = ctx.guard.body;
      const { experienceInteraction } = ctx;

      const identifier = await getMfaIdentifier({
        identifierType,
        experienceInteraction,
        queries,
      });

      ctx.body = await sendCode({
        identifier,
        createVerificationRecord: () =>
          createNewMfaCodeVerificationRecord(libraries, queries, identifier),
        libraries,
        ctx,
      });

      await next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/mfa-verification-code/verify`,
    koaGuard({
      body: z.object({
        verificationId: z.string(),
        code: z.string(),
        identifierType: z.enum([SignInIdentifier.Email, SignInIdentifier.Phone]),
      }),
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404, 501],
    }),
    async (ctx, next) => {
      const { verificationId, code, identifierType } = ctx.guard.body;
      const { experienceInteraction } = ctx;

      const mfaVerificationType = getMfaVerificationType(identifierType);

      // Get the verification record to extract the identifier value
      const codeVerificationRecord = experienceInteraction.getVerificationRecordByTypeAndId(
        mfaVerificationType,
        verificationId
      );

      const identifier = {
        type: identifierType,
        value: codeVerificationRecord.identifier.value,
      };

      ctx.body = await verifyCode({
        verificationId,
        code,
        identifier,
        verificationType: mfaVerificationType,
        sentinel,
        ctx,
      });

      return next();
    }
  );
}
