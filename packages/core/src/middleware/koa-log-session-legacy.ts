import type { MiddlewareType } from 'koa';
import type Provider from 'oidc-provider';

import type { WithLogContextLegacy } from '#src/middleware/koa-audit-log-legacy.js';

/** @deprecated This will be removed soon. Use `kua-log-session.js` instead. */
export default function koaLogSessionLegacy<
  StateT,
  ContextT extends WithLogContextLegacy,
  ResponseBodyT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    await next();

    try {
      const {
        jti,
        params: { client_id },
      } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.addLogContext({ sessionId: jti, applicationId: String(client_id) });
    } catch (error: unknown) {
      console.error(`Failed to get oidc provider interaction`, error);
    }
  };
}
