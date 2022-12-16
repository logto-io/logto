import type { MiddlewareType } from 'koa';
import type { Provider } from 'oidc-provider';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';

export default function koaAuditLogSession<StateT, ContextT extends WithLogContext, ResponseBodyT>(
  provider: Provider
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    await next();

    try {
      const {
        jti,
        params: { client_id },
      } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.log({ sessionId: jti, applicationId: String(client_id) });
    } catch (error: unknown) {
      console.error(`"${ctx.url}" failed to get oidc provider interaction`, error);
    }
  };
}
