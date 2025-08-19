/**
 * @overview This file implements the routes for the user interaction experience (RFC 0004).
 *
 * Note the experience APIs also known as interaction APIs v2,
 * are the new version of the interaction APIs with design improvements.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0004.
 *
 * @remarks
 * The experience APIs can be used by developers to build custom user interaction experiences.
 */

import { identificationApiPayloadGuard, InteractionEvent } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaInteractionDetails from '#src/middleware/koa-interaction-details.js';
import assertThat from '#src/utils/assert-that.js';

import { type AnonymousRouter, type RouterInitArgs } from '../types.js';

import experienceAnonymousRoutes from './anonymous-routes/index.js';
import ExperienceInteraction from './classes/experience-interaction.js';
import { experienceRoutes } from './const.js';
import { koaExperienceInteractionHooks } from './middleware/koa-experience-interaction-hooks.js';
import koaExperienceInteraction from './middleware/koa-experience-interaction.js';
import profileRoutes from './profile-routes.js';
import {
  sanitizedInteractionStorageGuard,
  type ExperienceInteractionRouterContext,
} from './types.js';
import backupCodeVerificationRoutes from './verification-routes/backup-code-verification.js';
import enterpriseSsoVerificationRoutes from './verification-routes/enterprise-sso-verification.js';
import newPasswordIdentityVerificationRoutes from './verification-routes/new-password-identity-verification.js';
import oneTimeTokenRoutes from './verification-routes/one-time-token.js';
import passwordVerificationRoutes from './verification-routes/password-verification.js';
import socialVerificationRoutes from './verification-routes/social-verification.js';
import totpVerificationRoutes from './verification-routes/totp-verification.js';
import verificationCodeRoutes from './verification-routes/verification-code.js';
import webAuthnVerificationRoute from './verification-routes/web-authn-verification.js';

type RouterContext<T> = T extends Router<unknown, infer Context> ? Context : never;

export default function experienceApiRoutes<T extends AnonymousRouter>(
  ...[anonymousRouter, tenant]: RouterInitArgs<T>
) {
  const { provider, libraries } = tenant;

  const experienceRouter =
    // @ts-expect-error for good koa types
    // eslint-disable-next-line no-restricted-syntax
    (anonymousRouter as Router<unknown, ExperienceInteractionRouterContext<RouterContext<T>>>).use(
      koaInteractionDetails(provider),
      koaExperienceInteractionHooks(libraries),
      koaExperienceInteraction(tenant)
    );

  experienceRouter.put(
    experienceRoutes.prefix,
    koaGuard({
      body: z.object({
        interactionEvent: z.nativeEnum(InteractionEvent),
        captchaToken: z.string().optional(),
      }),
      // 422 is returned if the captcha verification fails
      status: [204, 422],
    }),
    async (ctx, next) => {
      const { interactionEvent, captchaToken } = ctx.guard.body;
      const { createLog } = ctx;

      createLog(`Interaction.${interactionEvent}.Create`);

      const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionEvent);

      // Verify the captcha if provided, this is optional,
      // whether the captcha is required is determined and guarded when submitting the interaction.
      if (captchaToken) {
        await experienceInteraction.verifyCaptcha(captchaToken);
      }

      // Save new experience interaction instance.
      // This will overwrite any existing interaction data in the storage.
      await experienceInteraction.save();

      ctx.experienceInteraction = experienceInteraction;

      ctx.status = 204;

      return next();
    }
  );

  experienceRouter.put(
    `${experienceRoutes.prefix}/interaction-event`,
    koaGuard({
      body: z.object({
        interactionEvent: z.nativeEnum(InteractionEvent),
      }),
      status: [204, 400, 403],
    }),
    async (ctx, next) => {
      const { interactionEvent } = ctx.guard.body;
      const { createLog, experienceInteraction } = ctx;

      const eventLog = createLog(`Interaction.${experienceInteraction.interactionEvent}.Update`);
      eventLog.append({
        interactionEvent,
      });

      await experienceInteraction.setInteractionEvent(interactionEvent);

      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  experienceRouter.post(
    experienceRoutes.identification,
    koaGuard({
      body: identificationApiPayloadGuard,
      status: [201, 204, 400, 401, 403, 404, 409, 422],
    }),
    async (ctx, next) => {
      const { verificationId, linkSocialIdentity } = ctx.guard.body;
      const { experienceInteraction, createLog } = ctx;

      const log = createLog(
        `Interaction.${experienceInteraction.interactionEvent}.Identifier.Submit`
      );

      log.append({
        payload: {
          verificationId,
          linkSocialIdentity,
        },
      });

      if (experienceInteraction.interactionEvent === InteractionEvent.Register) {
        await experienceInteraction.createUser(verificationId, log);
      } else {
        assertThat(
          verificationId,
          new RequestError({
            code: 'guard.invalid_input',
            status: 400,
            details: 'verificationId is missing',
          })
        );
        await experienceInteraction.identifyUser(verificationId, linkSocialIdentity, log);
      }

      await experienceInteraction.save();

      // Return 201 if a new user is created
      ctx.status = experienceInteraction.interactionEvent === InteractionEvent.Register ? 201 : 204;

      return next();
    }
  );

  experienceRouter.post(
    `${experienceRoutes.prefix}/submit`,
    koaGuard({
      status: [200, 400, 403, 404, 422],
      response: z
        .object({
          redirectTo: z.string(),
        })
        .optional(),
    }),
    async (ctx, next) => {
      const { createLog, experienceInteraction } = ctx;

      const log = createLog(`Interaction.${experienceInteraction.interactionEvent}.Submit`);

      await ctx.experienceInteraction.submit();

      log.append({
        interaction: ctx.experienceInteraction.toJson(),
        userId: ctx.experienceInteraction.identifiedUserId,
      });

      ctx.status = 200;
      return next();
    }
  );

  experienceRouter.get(
    `${experienceRoutes.interaction}`,
    koaGuard({
      status: [200],
      response: sanitizedInteractionStorageGuard,
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      ctx.body = experienceInteraction.toSanitizedJson();
      ctx.status = 200;
      return next();
    }
  );

  passwordVerificationRoutes(experienceRouter, tenant);
  verificationCodeRoutes(experienceRouter, tenant);
  socialVerificationRoutes(experienceRouter, tenant);
  enterpriseSsoVerificationRoutes(experienceRouter, tenant);
  totpVerificationRoutes(experienceRouter, tenant);
  webAuthnVerificationRoute(experienceRouter, tenant);
  backupCodeVerificationRoutes(experienceRouter, tenant);
  newPasswordIdentityVerificationRoutes(experienceRouter, tenant);
  oneTimeTokenRoutes(experienceRouter, tenant);

  profileRoutes(experienceRouter, tenant);
  experienceAnonymousRoutes(experienceRouter, tenant);
}
