import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import koaOidcAuth from '../../middleware/koa-auth/koa-oidc-auth.js';
import type { ProfileRouter, RouterInitArgs } from '../types.js';

/**
 * Authn stands for authentication.
 * This router will have a route `/authn` to authenticate tokens with a general manner.
 */
export default function profileRoutes<T extends ProfileRouter>(
  ...[router, { provider }]: RouterInitArgs<T>
) {
  router.use(koaOidcAuth(provider));

  // TODO: test route only, will implement a better one later
  router.get(
    '/profile',
    koaGuard({
      response: z.object({
        sub: z.string(),
      }),
      status: [200],
    }),
    async (ctx, next) => {
      ctx.body = {
        sub: ctx.auth.id,
      };
      ctx.status = 200;

      return next();
    }
  );
}
