import { trySafe } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import { DataHookContextManager } from '#src/libraries/hook/context-manager.js';
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
    const {
      header: { 'user-agent': userAgent },
      ip,
    } = ctx;

    const dataHooksContextManager = new DataHookContextManager({ userAgent, ip });

    /**
     * Append a hook context to trigger management hooks. If multiple contexts are appended, all of
     * them will be triggered.
     */
    ctx.appendDataHookContext = dataHooksContextManager.appendContext.bind(dataHooksContextManager);

    await next();

    // Auto append pre-registered management API hooks if any
    const registeredHookEventContext =
      dataHooksContextManager.getRegisteredDataHookEventContext(ctx);

    if (registeredHookEventContext) {
      dataHooksContextManager.appendContext(registeredHookEventContext);
    }

    // Trigger data hooks
    if (dataHooksContextManager.contextArray.length > 0) {
      // Hooks should not crash the app
      void trySafe(hooks.triggerDataHooks(getConsoleLogFromContext(ctx), dataHooksContextManager));
    }
  };
};
