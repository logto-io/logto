import { trySafe } from '@logto/shared';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import type { Provider } from 'oidc-provider';

import { triggerInteractionHooksIfNeeded } from '#src/libraries/hook.js';

import { getInteractionStorage } from '../utils/interaction.js';
import type { WithInteractionDetailsContext } from './koa-interaction-details.js';

export default function koaInteractionHooks<
  StateT,
  ContextT extends WithInteractionDetailsContext<IRouterParamContext>,
  ResponseT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseT> {
  return async (ctx, next) => {
    const { event } = getInteractionStorage(ctx.interactionDetails.result);

    await next();

    // Get up-to-date interaction details
    const details = await trySafe(provider.interactionDetails(ctx.req, ctx.res));
    // Hooks should not crash the app
    void trySafe(triggerInteractionHooksIfNeeded(event, details, ctx.header['user-agent']));
  };
}
