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

import { InteractionEvent, VerificationType, signInPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';

import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';

import { type AnonymousRouter, type RouterInitArgs } from '../types.js';

import { PasswordVerification } from './classes/verifications/index.js';
import { experienceApiRoutesPrefix } from './const.js';
import koaInteractionSession, {
  type WithInteractionSessionContext,
} from './middleware/koa-interaction-session.js';
import verificationCodeRoutes from './verification-code.js';

type RouterContext<T> = T extends Router<unknown, infer Context> ? Context : never;

export default function experienceApiRoutes<T extends AnonymousRouter>(
  ...[anonymousRouter, tenant]: RouterInitArgs<T>
) {
  const { queries, libraries } = tenant;

  const router =
    // @ts-expect-error for good koa types
    // eslint-disable-next-line no-restricted-syntax
    (anonymousRouter as Router<unknown, WithInteractionSessionContext<RouterContext<T>>>).use(
      koaAuditLog(queries),
      koaInteractionSession(tenant)
    );

  router.post(
    `${experienceApiRoutesPrefix}/sign-in`,
    koaGuard({
      body: signInPayloadGuard,
      status: [204, 400, 404, 422],
    }),
    async (ctx, next) => {
      const { identifier, verification } = ctx.guard.body;

      ctx.interactionSession.setInteractionEvent(InteractionEvent.SignIn);

      switch (verification.type) {
        case VerificationType.Password: {
          const { value } = verification;

          const passwordVerification = PasswordVerification.create(libraries, queries, identifier);

          await passwordVerification.verify(value);

          ctx.interactionSession.appendVerificationRecord(passwordVerification);
          ctx.interactionSession.identifyUser(passwordVerification.id);

          break;
        }
        case VerificationType.VerificationCode: {
          // TODO: Implement verification code verification
          break;
        }
      }

      await ctx.interactionSession.save();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    `${experienceApiRoutesPrefix}/submit`,
    koaGuard({
      status: [200],
    }),
    async (ctx, next) => {
      await ctx.interactionSession.submit();
      ctx.status = 200;
      return next();
    }
  );

  verificationCodeRoutes(router, tenant);
}
