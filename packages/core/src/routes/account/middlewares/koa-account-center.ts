import type { AccountCenter } from '@logto/schemas';
import type { Context, MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { accountApiPrefix } from '../constants.js';

/**
 * Extend the context with the account center configs.
 */
export type WithAccountCenterContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & { accountCenter: AccountCenter };

const getThirdPartyTokenRequestPathRegex = new RegExp(
  `^${accountApiPrefix}/(identities|sso-identities)/[^/]+/access-token$`
);

const isGetThirdPartyTokenRequest = <ContextT extends Context>({
  request: { method, path },
}: ContextT) => {
  return method === 'GET' && getThirdPartyTokenRequestPathRegex.test(path);
};

/**
 * Create a middleware that injects the account center configs and ensures
 * the global config is enabled.
 */
export default function koaAccountCenter<StateT, ContextT extends IRouterParamContext, ResponseT>({
  accountCenters: { findDefaultAccountCenter },
}: Queries): MiddlewareType<StateT, WithAccountCenterContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const accountCenter = await findDefaultAccountCenter();

    // Whitelist the request to get third-party token,
    // as it does not require the account center to be enabled.
    if (!isGetThirdPartyTokenRequest(ctx)) {
      assertThat(accountCenter.enabled, 'account_center.not_enabled');
    }

    ctx.accountCenter = accountCenter;

    return next();
  };
}
