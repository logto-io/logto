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

import { InteractionEvent, signInPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';

import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';

import { type AnonymousRouter, type RouterInitArgs } from '../types.js';

import koaInteractionSession, {
  type WithInteractionSessionContext,
} from './middleware/koa-interaction-session.js';
import { PasswordVerification } from './verifications/password-verification.js';

const experienceApiRoutesPrefix = '/experience';

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

      // TODO: Add support for other verification types
      const { password } = verification;
      const passwordVerification = PasswordVerification.create(libraries, queries, identifier);
      await passwordVerification.verify(password);
      ctx.interactionSession.appendVerificationRecord(passwordVerification);

      ctx.interactionSession.identifyUser(passwordVerification.id);

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
}
