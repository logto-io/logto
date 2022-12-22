import type { MiddlewareType } from 'koa';
import type { Provider } from 'oidc-provider';

export type WithInteractionDetailsContext<ContextT> = ContextT & {
  interactionDetails: Awaited<ReturnType<Provider['interactionDetails']>>;
};

export default function koaInteractionDetails<StateT, ContextT, ResponseBodyT>(
  provider: Provider
): MiddlewareType<StateT, WithInteractionDetailsContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    ctx.interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);

    return next();
  };
}
