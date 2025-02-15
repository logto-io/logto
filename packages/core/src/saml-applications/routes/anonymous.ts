import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type { AnonymousRouter, RouterInitArgs } from '#src/routes/types.js';

export default function samlApplicationAnonymousRoutes<T extends AnonymousRouter>(
  ...[router, { libraries }]: RouterInitArgs<T>
) {
  const {
    samlApplications: { getSamlIdPMetadataByApplicationId },
  } = libraries;

  router.get(
    '/saml-applications/:id/metadata',
    koaGuard({
      params: z.object({ id: z.string() }),
      status: [200, 404],
      response: z.string(),
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      const { metadata } = await getSamlIdPMetadataByApplicationId(id);

      ctx.status = 200;
      ctx.body = metadata;
      ctx.type = 'text/xml;charset=utf-8';

      return next();
    }
  );
}
