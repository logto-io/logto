import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import { triggerInteractionHooksIfNeeded } from '#src/libraries/hook.js';

import type { WithInteractionPayloadContext } from './koa-interaction-body-guard.js';
import type { WithInteractionDetailsContext } from './koa-interaction-details.js';

export default function koaInteractionHooks<
  StateT,
  ContextT extends WithInteractionPayloadContext<
    WithInteractionDetailsContext<IRouterParamContext>
  >,
  ResponseT
>(): MiddlewareType<StateT, ContextT, ResponseT> {
  return async (ctx, next) => {
    await next();

    void triggerInteractionHooksIfNeeded(
      ctx.interactionPayload,
      ctx.interactionDetails,
      ctx.header['user-agent']
    );
  };
}
