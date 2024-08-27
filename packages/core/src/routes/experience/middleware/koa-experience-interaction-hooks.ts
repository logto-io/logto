import { InteractionEvent } from '@logto/schemas';
import { conditionalString, noop, trySafe } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import {
  DataHookContextManager,
  InteractionHookContextManager,
} from '#src/libraries/hook/context-manager.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type Libraries from '#src/tenants/Libraries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

const interactionEventGuard = z.object({
  interactionEvent: z.nativeEnum(InteractionEvent),
});

export type WithExperienceInteractionHooksContext<
  ContextT extends IRouterParamContext = IRouterParamContext,
> = ContextT & {
  assignInteractionHookResult: InteractionHookContextManager['assignInteractionHookResult'];
  appendDataHookContext: DataHookContextManager['appendContext'];
};

export function koaExperienceInteractionHooks<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseT,
>({
  hooks: { triggerInteractionHooks, triggerDataHooks },
}: Libraries): MiddlewareType<StateT, WithExperienceInteractionHooksContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const {
      interactionDetails,
      header: { 'user-agent': userAgent },
      ip,
    } = ctx;

    // Get the interaction event from the interaction details
    const result = interactionEventGuard.safeParse(interactionDetails.result ?? {});

    if (!result.success) {
      ctx.assignInteractionHookResult = noop;
      ctx.appendDataHookContext = noop;
      return next();
    }

    const { interactionEvent } = result.data;
    const interactionApiMetadata = {
      interactionEvent,
      userAgent,
      applicationId: conditionalString(interactionDetails.params.client_id),
      sessionId: interactionDetails.jti,
    };
    const interactionHookContext = new InteractionHookContextManager({
      ...interactionApiMetadata,
      userIp: ip,
    });

    ctx.assignInteractionHookResult =
      interactionHookContext.assignInteractionHookResult.bind(interactionHookContext);

    const dataHookContext = new DataHookContextManager({
      ...interactionApiMetadata,
      ip,
    });

    ctx.appendDataHookContext = dataHookContext.appendContext.bind(dataHookContext);

    await next();

    if (interactionHookContext.interactionHookResult) {
      // Hooks should not crash the app
      void trySafe(triggerInteractionHooks(getConsoleLogFromContext(ctx), interactionHookContext));
    }

    if (dataHookContext.contextArray.length > 0) {
      // Hooks should not crash the app
      void trySafe(triggerDataHooks(getConsoleLogFromContext(ctx), dataHookContext));
    }
  };
}
