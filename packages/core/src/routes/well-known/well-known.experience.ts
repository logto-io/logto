import { fullSignInExperienceGuard } from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
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

      if (!EnvSet.values.isDevFeaturesEnabled) {
        // eslint-disable-next-line @silverhand/fp/no-delete
        delete ctx.body.captchaConfig;
      }

      return next();
    }
  );
}
