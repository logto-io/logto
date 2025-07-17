import type { AccountCenter } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * Extend the context with the account center configs.
 */
export type WithAccountCenterContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & { accountCenter: AccountCenter };
/**
 * Create a middleware that injects the account center configs and ensures
 * the global config is enabled.
 */
export default function koaAccountCenter<StateT, ContextT extends IRouterParamContext, ResponseT>({
  accountCenters: { findDefaultAccountCenter },
}: Queries): MiddlewareType<StateT, WithAccountCenterContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const accountCenter = await findDefaultAccountCenter();

    assertThat(accountCenter.enabled, 'account_center.not_enabled');

    ctx.accountCenter = accountCenter;

    return next();
  };
}
