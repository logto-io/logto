import type { MiddlewareType } from 'koa';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import InteractionSession from '../classes/interaction-session.js';

export type WithInteractionSessionContext<ContextT extends WithLogContext = WithLogContext> =
  ContextT & {
    interactionSession: InteractionSession;
  };

/**
 * @overview This middleware initializes the InteractionSession for the current request.
 * The InteractionSession instance is used to manage all the data related to the current interaction.
 * All the interaction data is stored using the oidc-provider's interaction session
 * @see {@link https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#user-flows}
 */
export default function koaInteractionSession<StateT, ContextT extends WithLogContext, ResponseT>(
  tenant: TenantContext
): MiddlewareType<StateT, WithInteractionSessionContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    ctx.interactionSession = await InteractionSession.create(ctx, tenant);

    return next();
  };
}
