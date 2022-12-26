import type { MiddlewareType } from 'koa';
import type { Provider } from 'oidc-provider';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';

export type WithInteractionDetailsContext<ContextT = WithLogContext> = ContextT & {
  interactionDetails: Awaited<ReturnType<Provider['interactionDetails']>>;
};

export default function koaInteractionDetails<StateT, ContextT>(
  provider: Provider
): MiddlewareType<StateT, WithInteractionDetailsContext<ContextT>> {
  return async (ctx, next) => {
    ctx.interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);

    return next();
  };
}
