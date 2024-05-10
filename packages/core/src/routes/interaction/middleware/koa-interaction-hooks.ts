import { userInfoSelectFields, type DataHookEvent, type User } from '@logto/schemas';
import { conditional, conditionalString, noop, pick, trySafe } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
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
    const { isDevFeaturesEnabled } = EnvSet.values;
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
    const assignDataHookContext: AssignDataHookContext = ({ event, user, data }) => {
      dataHookContext.appendContext({
        event,
        data: {
          // Only return the selected user fields
          ...conditional(user && { user: pick(user, ...userInfoSelectFields) }),
          ...data,
        },
      });
    };

    // TODO: remove dev features check
    ctx.assignDataHookContext = isDevFeaturesEnabled ? assignDataHookContext : noop;

    await next();

    if (interactionHookContext.interactionHookResult) {
      // Hooks should not crash the app
      void trySafe(triggerInteractionHooks(getConsoleLogFromContext(ctx), interactionHookContext));
    }

    // TODO: remove dev features check
    if (isDevFeaturesEnabled && dataHookContext.contextArray.length > 0) {
      // Hooks should not crash the app
      void trySafe(triggerDataHooks(getConsoleLogFromContext(ctx), dataHookContext));
    }
  };
}
