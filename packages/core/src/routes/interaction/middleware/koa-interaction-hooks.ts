import { userInfoSelectFields, type DataHookEvent, type User } from '@logto/schemas';
import { conditional, conditionalString, pick, trySafe } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import {
  DataHookContextManager,
  InteractionHookContextManager,
} from '#src/libraries/hook/context-manager.js';
import type Libraries from '#src/tenants/Libraries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import { getInteractionStorage } from '../utils/interaction.js';

import type { WithInteractionDetailsContext } from './koa-interaction-details.js';

type AssignDataHookContext = (payload: {
  event: DataHookEvent;
  user?: User;
  data?: Record<string, unknown>;
}) => void;

export type WithInteractionHooksContext<
  ContextT extends IRouterParamContext = IRouterParamContext,
> = ContextT & {
  assignInteractionHookResult: InteractionHookContextManager['assignInteractionHookResult'];
  assignDataHookContext: AssignDataHookContext;
};

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
  hooks: { triggerInteractionHooks, triggerDataHooks },
}: Libraries): MiddlewareType<StateT, WithInteractionHooksContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const { event: interactionEvent } = getInteractionStorage(ctx.interactionDetails.result);

    const {
      interactionDetails,
      header: { 'user-agent': userAgent },
      ip,
    } = ctx;

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

    // Assign user and event data to the data hook context
    ctx.assignDataHookContext = ({ event, user, data: extraData }) => {
      dataHookContext.appendContext({
        event,
        data: {
          // Only return the selected user fields
          ...conditional(user && pick(user, ...userInfoSelectFields)),
          ...extraData,
        },
      });
    };

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
