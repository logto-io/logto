import { MiddlewareType } from 'koa';
import { Provider } from 'oidc-provider';

export type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

export default function koaOidcSessionChecker<StateT, ContextT, ResponseBodyT>(
  provider: Provider
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    // If OIDC session does not exist, it will throw SessionNotFound.
    await provider.interactionDetails(ctx.req, ctx.res);

    return next();
  };
}
