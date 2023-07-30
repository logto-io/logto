import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { interactionPrefix, verificationPath } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import { socialAuthorizationUrlPayloadGuard } from './types/guard.js';
import { getInteractionStorage } from './utils/interaction.js';
import { createSocialAuthorizationUrl } from './utils/social-verification.js';

export default function socialRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithLogContext<WithInteractionDetailsContext<T>>>,
  tenant: TenantContext
) {
  // Create social authorization url interaction verification
  router.post(
    `${interactionPrefix}/${verificationPath}/social-authorization-uri`,
    koaGuard({ body: socialAuthorizationUrlPayloadGuard }),
    async (ctx, next) => {
      // Check interaction exists
      const { event } = getInteractionStorage(ctx.interactionDetails.result);
      const log = ctx.createLog(`Interaction.${event}.Identifier.Social.Create`);

      const { body: payload } = ctx.guard;

      log.append(payload);

      const redirectTo = await createSocialAuthorizationUrl(ctx, tenant, payload);

      ctx.body = { redirectTo };

      return next();
    }
  );
}
