import { InteractionEvent } from '@logto/schemas';
import { conditionalString, noop, trySafe } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import {
  HookContextManager,
  InteractionHookContextManager,
} from '#src/libraries/hook/context-manager.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type Libraries from '#src/tenants/Libraries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import {
  createInteractionHookContext,
  shouldReleaseInteractionHookAnyway,
} from './interaction-hook-dispatch.js';

const interactionEventGuard = z.object({
  interactionEvent: z.nativeEnum(InteractionEvent),
});

export type WithExperienceInteractionHooksContext<
  ContextT extends IRouterParamContext = IRouterParamContext,
> = ContextT & {
  assignInteractionHookResult: InteractionHookContextManager['assignInteractionHookResult'];
  appendDataHookContext: HookContextManager['appendDataHookContext'];
  appendExceptionHookContext: HookContextManager['appendExceptionHookContext'];
};

export function koaExperienceInteractionHooks<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseT,
>({
  hooks: { triggerInteractionHooks, triggerDataHooks, triggerExceptionHooks },
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

    const dataHookContext = new HookContextManager({
      ...interactionApiMetadata,
      ip,
    });

    ctx.appendDataHookContext = dataHookContext.appendDataHookContext.bind(dataHookContext);
    ctx.appendExceptionHookContext =
      dataHookContext.appendExceptionHookContext.bind(dataHookContext);

    try {
      await next();

      const releaseOnSuccessInteractionHookContext = createInteractionHookContext(
        {
          ...interactionApiMetadata,
          userIp: ip,
        },
        interactionHookContext.interactionHookResults.filter(
          (interactionHookResult) => !shouldReleaseInteractionHookAnyway(interactionHookResult)
        )
      );

      if (releaseOnSuccessInteractionHookContext.interactionHookResults.length > 0) {
        // Hooks should not crash the app
        void trySafe(
          triggerInteractionHooks(
            getConsoleLogFromContext(ctx),
            releaseOnSuccessInteractionHookContext
          )
        );
      }

      if (dataHookContext.dataHookContextArray.length > 0) {
        // Data hooks represent successful data mutations and should only be dispatched
        // after the interaction flow completes without throwing.
        // Hooks should not crash the app
        void trySafe(triggerDataHooks(getConsoleLogFromContext(ctx), dataHookContext));
      }
    } finally {
      const releaseAnywayInteractionHookContext = createInteractionHookContext(
        {
          ...interactionApiMetadata,
          userIp: ip,
        },
        interactionHookContext.interactionHookResults.filter((interactionHookResult) =>
          shouldReleaseInteractionHookAnyway(interactionHookResult)
        )
      );

      if (releaseAnywayInteractionHookContext.interactionHookResults.length > 0) {
        // Interaction hooks are queued when the corresponding interaction event is known to
        // have happened. `PostSignInAdaptiveMfaTriggered` is assigned before the MFA
        // challenge error is thrown, so dispatch must happen in `finally`.
        // Hooks should not crash the app
        void trySafe(
          triggerInteractionHooks(
            getConsoleLogFromContext(ctx),
            releaseAnywayInteractionHookContext
          )
        );
      }

      if (dataHookContext.exceptionHookContextArray.length > 0) {
        // Hooks should not crash the app
        void trySafe(triggerExceptionHooks(getConsoleLogFromContext(ctx), dataHookContext));
      }
    }
  };
}
