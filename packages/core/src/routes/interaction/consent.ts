import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';

import { consent } from '#src/libraries/session.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { interactionPrefix } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';

export default function consentRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<T>>,
  { provider, queries }: TenantContext
) {
  router.post(`${interactionPrefix}/consent`, async (ctx, next) => {
    const { interactionDetails } = ctx;

    const redirectTo = await consent(ctx, provider, queries, interactionDetails);

    ctx.body = { redirectTo };

    return next();
  });
}
