import { conditionalString, trySafe } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import {
  InteractionHookContextManager,
  type InteractionHookResult,
} from '#src/libraries/hook/context-manager.js';
import type Libraries from '#src/tenants/Libraries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import { getInteractionStorage } from '../utils/interaction.js';

import type { WithInteractionDetailsContext } from './koa-interaction-details.js';

type AssignInteractionHookResult = (result: InteractionHookResult) => void;

export type WithInteractionHooksContext<
  ContextT extends IRouterParamContext = IRouterParamContext,
> = ContextT & { assignInteractionHookResult: AssignInteractionHookResult };

/**
 * The factory to create a new interaction hook middleware function.
 * Interaction related event hooks will be triggered once we got the interaction hook result.
 * Use `assignInteractionHookResult` to assign the interaction hook result.
 */
export default function koaInteractionHooks<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseT,
>({
  hooks: { triggerInteractionHooks },
}: Libraries): MiddlewareType<StateT, WithInteractionHooksContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const { event: interactionEvent } = getInteractionStorage(ctx.interactionDetails.result);

    const {
      interactionDetails,
      header: { 'user-agent': userAgent },
      ip,
    } = ctx;

    const interactionHookContext = new InteractionHookContextManager({
      interactionEvent,
      userAgent,
      userIp: ip,
      applicationId: conditionalString(interactionDetails.params.client_id),
      sessionId: interactionDetails.jti,
    });

    ctx.assignInteractionHookResult =
      interactionHookContext.assignInteractionHookResult.bind(interactionHookContext);

    // TODO: @simeng-li Add DataHookContext to the interaction hook middleware as well

    await next();

    if (interactionHookContext.interactionHookResult) {
      // Hooks should not crash the app
      void trySafe(triggerInteractionHooks(getConsoleLogFromContext(ctx), interactionHookContext));
    }
  };
}
