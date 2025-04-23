import { fullSignInExperienceGuard } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type Libraries from '#src/tenants/Libraries.js';

import { type AnonymousRouter } from '../types.js';

export default function experienceRoutes<T extends AnonymousRouter>(
  router: T,
  { signInExperiences: { getFullSignInExperience } }: Libraries
) {
  router.get(
    '/.well-known/experience',
    koaGuard({
      query: z.object({ organizationId: z.string(), appId: z.string() }).partial(),
      response: fullSignInExperienceGuard,
      status: 200,
    }),
    async (ctx, next) => {
      const { organizationId, appId } = ctx.guard.query;
      ctx.body = await getFullSignInExperience({ locale: ctx.locale, organizationId, appId });

      return next();
    }
  );
}
