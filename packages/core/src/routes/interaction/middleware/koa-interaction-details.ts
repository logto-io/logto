import type { MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import type Provider from 'oidc-provider';

export type WithInteractionDetailsContext<
  ContextT extends IRouterParamContext = IRouterParamContext,
> = ContextT & {
  interactionDetails: Awaited<ReturnType<Provider['interactionDetails']>>;
};

export default function koaInteractionDetails<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseT,
>(provider: Provider): MiddlewareType<StateT, WithInteractionDetailsContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    ctx.interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);

    return next();
  };
}
