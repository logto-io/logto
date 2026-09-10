import { TemplateType } from '@logto/connector-kit';
import {
  AlternativeSignUpIdentifier,
  InteractionEvent,
  subjectVerificationCodeIdentifierGuard,
  SignInIdentifier,
  verificationCodeIdentifierGuard,
  verificationCodeIdentifierPayloadGuard,
} from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { codeVerificationIdentifierRecordTypeMap } from '../classes/utils.js';
import {
  createNewCodeVerificationRecord,
  createNewMfaCodeVerificationRecord,
  createSubjectCodeVerificationRecord,
  getTemplateTypeByEvent,
} from '../classes/verifications/code-verification.js';
import { experienceRoutes } from '../const.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

import {
  getSubjectCodeRecordIdentifier,
  getSubjectIdentifier,
} from './subject-verification-code-helpers.js';
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
  // The subject-bound variant is part of the unreleased step-up feature: outside it the request
  // contract keeps requiring an identifier with a value, and the OpenAPI document omits the
  // variant.
  const stableBodyGuard = z.object({
    identifier: verificationCodeIdentifierGuard,
    interactionEvent: z.nativeEnum(InteractionEvent),
  });
  const subjectBodyGuard = z.object({
    identifier: subjectVerificationCodeIdentifierGuard,
    interactionEvent: z.literal(InteractionEvent.SignIn),
  });
  const bodyGuard = EnvSet.values.isDevFeaturesEnabled
    ? z.union([stableBodyGuard, subjectBodyGuard])
    : stableBodyGuard;
  const verifyIdentifierGuard = EnvSet.values.isDevFeaturesEnabled
    ? verificationCodeIdentifierPayloadGuard
    : verificationCodeIdentifierGuard;

  router.post(
    `${experienceRoutes.verification}/verification-code`,
    koaGuard({
      body: bodyGuard,
      response: z.object({
        verificationId: z.string(),
      }),
      // 403: a pure step-up supplied a raw identifier
      // 404: subject-bound variant without a subject; 429: rate limited; 501: connector not found
      status: [200, 400, 403, 404, 422, 429, 501],
    }),
    async (ctx, next) => {
      const { identifier: identifierPayload, interactionEvent } = ctx.guard.body;
      const { experienceInteraction } = ctx;

      assertThat(
        !experienceInteraction.isStepUp || identifierPayload.value === undefined,
        new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
      );

      // The subject is already authenticated, so no captcha applies
      if (identifierPayload.value === undefined) {
        const { userId, identifier } = await getSubjectIdentifier({
          identifierType: identifierPayload.type,
          experienceInteraction,
          queries,
        });

        ctx.body = await sendCode({
          identifier,
          interactionEvent,
          createVerificationRecord: () =>
            createSubjectCodeVerificationRecord(libraries, queries, identifier, userId),
          libraries,
          queries,
          ctx,
        });

        await next();
        return;
      }

      const identifier = identifierPayload;

      // Require captcha if the user is not identified.
      if (!ctx.experienceInteraction.identifiedUserId) {
        await ctx.experienceInteraction.guardCaptcha();
      }

      // Check if email/phone is in sign up identifiers, to determine if it's binding email/phone for MFA
      const { signUp } =
        await ctx.experienceInteraction.signInExperienceValidator.getSignInExperienceData();
      // If the interaction already identified a user, and email/phone is not in sign up identifiers,
      // then the sign-up/sign-in flow is complete and we are binding a new MFA verification
      const isBindingEmailForMfa =
        ctx.experienceInteraction.identifiedUserId &&
        !signUp.identifiers.includes(identifier.type) &&
        !signUp.secondaryIdentifiers?.some(
          ({ identifier: id }) =>
            id === identifier.type || id === AlternativeSignUpIdentifier.EmailOrPhone
        );

      ctx.body = await sendCode({
        identifier,
        interactionEvent,
        createVerificationRecord: () =>
          createNewCodeVerificationRecord(
            libraries,
            queries,
            identifier,
            // If the interaction already identified a user, we are binding a new MFA verification
            isBindingEmailForMfa ? TemplateType.BindMfa : getTemplateTypeByEvent(interactionEvent)
          ),
        libraries,
        queries,
        ctx,
      });

      await next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/verification-code/verify`,
    koaGuard({
      body: z.object({
        identifier: verifyIdentifierGuard,
        verificationId: z.string(),
        code: z.string(),
      }),
      response: z.object({
        verificationId: z.string(),
      }),
      // 403: a pure step-up supplied a raw identifier; 501: connector not found
      status: [200, 400, 403, 404, 501],
    }),
    async (ctx, next) => {
      const { verificationId, code, identifier: identifierPayload } = ctx.guard.body;
      const verificationType = codeVerificationIdentifierRecordTypeMap[identifierPayload.type];

      assertThat(
        !ctx.experienceInteraction.isStepUp || identifierPayload.value === undefined,
        new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
      );

      const identifier =
        identifierPayload.value === undefined
          ? getSubjectCodeRecordIdentifier({
              verificationType,
              verificationId,
              experienceInteraction: ctx.experienceInteraction,
            })
          : identifierPayload;

      ctx.body = await verifyCode({
        verificationId,
        code,
        identifier,
        verificationType,
        sentinel,
        queries,
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
      // 429: rate limited; 501: connector not found
      status: [200, 400, 404, 429, 501],
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
        queries,
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
        queries,
        ctx,
      });

      return next();
    }
  );
}
