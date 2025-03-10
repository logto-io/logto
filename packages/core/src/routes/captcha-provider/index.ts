import { CaptchaProviders, captchaConfigGuard } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function captchaProviderRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { queries }] = args;
  const { findCaptchaProvider, upsertCaptchaProvider, deleteCaptchaProvider } =
    queries.captchaProviders;
  router.get(
    '/captcha-provider',
    koaGuard({
      response: CaptchaProviders.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const provider = await findCaptchaProvider();

      if (!provider) {
        ctx.status = 404;

        return next();
      }

      return next();
    }
  );

  router.put(
    '/captcha-provider',
    koaGuard({
      body: z.object({
        config: captchaConfigGuard,
      }),
      response: CaptchaProviders.guard,
      status: [200],
    }),

    async (ctx, next) => {
      const { config } = ctx.guard.body;
      await upsertCaptchaProvider({
        config,
      });

      ctx.body = await findCaptchaProvider();

      return next();
    }
  );

  router.delete(
    '/captcha-provider',
    koaGuard({
      status: [204],
    }),
    async (ctx, next) => {
      await deleteCaptchaProvider();

      ctx.status = 204;

      return next();
    }
  );
}
