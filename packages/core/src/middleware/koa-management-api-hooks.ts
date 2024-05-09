import { managementApiHooksRegistration } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import { DataHookContextManager } from '#src/libraries/hook/context-manager.js';
import {
  buildManagementApiDataHookRegistrationKey,
  hasRegisteredDataHookEvent,
} from '#src/libraries/hook/utils.js';
import type Libraries from '#src/tenants/Libraries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

export type WithHookContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & { appendDataHookContext: DataHookContextManager['appendContext'] };

/**
 * The factory to create a new management hook middleware function.
 *
 * To trigger management hooks, use `appendDataHookContext` to append the context.
 *
 * @param hooks The hooks library.
 * @returns The middleware function.
 */
export const koaManagementApiHooks = <StateT, ContextT extends IRouterParamContext, ResponseT>(
  hooks: Libraries['hooks']
): MiddlewareType<StateT, WithHookContext<ContextT>, ResponseT> => {
  return async (ctx, next) => {
    // TODO: Remove dev feature guard
    const { isDevFeaturesEnabled } = EnvSet.values;
    if (!isDevFeaturesEnabled) {
      return;
    }

    const {
      header: { 'user-agent': userAgent },
      ip,
    } = ctx;

    const dataHooks = new DataHookContextManager({ userAgent, ip });

    /**
     * Append a hook context to trigger management hooks. If multiple contexts are appended, all of
     * them will be triggered.
     */
    ctx.appendDataHookContext = dataHooks.appendContext.bind(dataHooks);

    await next();

    // Auto append pre-registered management API hooks if any
    const { path, method, body, status, _matchedRoute } = ctx;
    const hookRegistrationKey = buildManagementApiDataHookRegistrationKey(method, _matchedRoute);

    // TODO: @simeng-li do we need to insert the request body to the hook context?
    if (hasRegisteredDataHookEvent(hookRegistrationKey)) {
      const event = managementApiHooksRegistration[hookRegistrationKey];
      dataHooks.appendContext({ event, data: { path, method, body, status } });
    }

    if (dataHooks.contextArray.length > 0) {
      // Hooks should not crash the app
      void trySafe(hooks.triggerDataHooks(getConsoleLogFromContext(ctx), dataHooks));
    }
  };
};
