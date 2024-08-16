import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '../../../middleware/koa-guard.js';
import { type WithInteractionDetailsContext } from '../../../middleware/koa-interaction-details.js';
import type TenantContext from '../../../tenants/TenantContext.js';
import { SignInExperienceValidator } from '../classes/libraries/sign-in-experience-validator.js';
import { experienceRoutes } from '../const.js';

export default function experienceAnonymousRoutes<T extends WithInteractionDetailsContext>(
  router: Router<unknown, T>,
  tenantContext: TenantContext
) {
  const { libraries, queries } = tenantContext;

  router.get(
    `${experienceRoutes.prefix}/sso-connectors`,
    koaGuard({
      query: z.object({
        email: z.string().email(),
      }),
      status: [200, 400],
      response: z.object({
        connectorIds: z.string().array(),
      }),
    }),
    async (ctx, next) => {
      const { email } = ctx.guard.query;
      const signInExperienceValidator = new SignInExperienceValidator(libraries, queries);
      const connectors = await signInExperienceValidator.getEnabledSsoConnectorsByEmail(email);

      ctx.body = {
        connectorIds: connectors.map(({ id }) => id),
      };

      return next();
    }
  );
}
