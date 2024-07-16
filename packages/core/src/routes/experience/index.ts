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

import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';

import { type AnonymousRouter, type RouterInitArgs } from '../types.js';

import ExperienceInteraction from './classes/experience-interaction.js';
import { experienceRoutes } from './const.js';
import koaExperienceInteraction, {
  type WithExperienceInteractionContext,
} from './middleware/koa-experience-interaction.js';
import backupCodeVerificationRoutes from './verification-routes/backup-code-verification.js';
import enterpriseSsoVerificationRoutes from './verification-routes/enterprise-sso-verification.js';
import newPasswordIdentityVerificationRoutes from './verification-routes/new-password-identity-verification.js';
import passwordVerificationRoutes from './verification-routes/password-verification.js';
import socialVerificationRoutes from './verification-routes/social-verification.js';
import totpVerificationRoutes from './verification-routes/totp-verification.js';
import verificationCodeRoutes from './verification-routes/verification-code.js';

type RouterContext<T> = T extends Router<unknown, infer Context> ? Context : never;

export default function experienceApiRoutes<T extends AnonymousRouter>(
  ...[anonymousRouter, tenant]: RouterInitArgs<T>
) {
  const { queries } = tenant;

  const router =
    // @ts-expect-error for good koa types
    // eslint-disable-next-line no-restricted-syntax
    (anonymousRouter as Router<unknown, WithExperienceInteractionContext<RouterContext<T>>>).use(
      koaAuditLog(queries),
      koaExperienceInteraction(tenant)
    );

  router.put(
    experienceRoutes.prefix,
    koaGuard({
      body: z.object({
        interactionEvent: z.nativeEnum(InteractionEvent),
      }),
      status: [204, 403],
    }),
    async (ctx, next) => {
      const { interactionEvent } = ctx.guard.body;
      const { createLog } = ctx;

      createLog(`Interaction.${interactionEvent}.Update`);

      const experienceInteraction = new ExperienceInteraction(ctx, tenant);

      await experienceInteraction.setInteractionEvent(interactionEvent);

      await experienceInteraction.save();

      ctx.experienceInteraction = experienceInteraction;
      ctx.status = 204;

      return next();
    }
  );

  router.put(
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

      const eventLog = createLog(
        `Interaction.${experienceInteraction.interactionEvent ?? interactionEvent}.Update`
      );

      await experienceInteraction.setInteractionEvent(interactionEvent);

      eventLog.append({
        interactionEvent,
      });

      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    experienceRoutes.identification,
    koaGuard({
      body: identificationApiPayloadGuard,
      status: [201, 204, 400, 401, 404, 409, 422],
    }),
    async (ctx, next) => {
      const { verificationId, linkSocialIdentity } = ctx.guard.body;
      const { experienceInteraction } = ctx;

      await experienceInteraction.identifyUser(verificationId, linkSocialIdentity);

      await experienceInteraction.save();

      // Return 201 if a new user is created
      ctx.status = experienceInteraction.interactionEvent === InteractionEvent.Register ? 201 : 204;

      return next();
    }
  );

  router.post(
    `${experienceRoutes.prefix}/submit`,
    koaGuard({
      status: [200, 400],
      response: z.object({
        redirectTo: z.string(),
      }),
    }),
    async (ctx, next) => {
      await ctx.experienceInteraction.submit();
      ctx.status = 200;
      return next();
    }
  );

  passwordVerificationRoutes(router, tenant);
  verificationCodeRoutes(router, tenant);
  socialVerificationRoutes(router, tenant);
  enterpriseSsoVerificationRoutes(router, tenant);
  totpVerificationRoutes(router, tenant);
  backupCodeVerificationRoutes(router, tenant);
  newPasswordIdentityVerificationRoutes(router, tenant);
}
