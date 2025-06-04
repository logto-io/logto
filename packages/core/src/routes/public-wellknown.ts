import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import type { AnonymousRouter } from './types.js';

/**
 * Initialize public well-known APIs.
 * The target path is `/.well-known`. Without the `/api` prefix, which is not designed for our internal use.
 * This is used for other parties to get the well-known information,
 * for example, webauthn related origins for Browser. The protocol is fixed to `https://{domain}/.well-known/webauthn`,
 * @see https://passkeys.dev/docs/advanced/related-origins/
 *
 * So this route is not conflict with the routes in `./well-known/index.ts`.
 */
export default function publicWellKnownRoutes<T extends AnonymousRouter>(
  router: T,
  { queries }: TenantContext
) {
  const {
    accountCenters: { findDefaultAccountCenter },
  } = queries;

  router.get(
    '/webauthn',
    koaGuard({
      response: z.object({ origins: z.string().array() }),
      status: 200,
    }),
    async (ctx, next) => {
      const { webauthnRelatedOrigins } = await findDefaultAccountCenter();
      ctx.body = { origins: webauthnRelatedOrigins };
      ctx.status = 200;

      return next();
    }
  );
}
