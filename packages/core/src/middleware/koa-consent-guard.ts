import { experience } from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import { type Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * Guard before allowing auto-consent.
 * E.g. Check if the active session matches the upcoming one-time token auth request.
 */
export default function koaConsentGuard<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT,
>(provider: Provider, query: Queries): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    const {
      params: { one_time_token: token, login_hint: loginHint },
      session,
    } = interactionDetails;

    assertThat(session, new RequestError({ code: 'session.not_found' }));

    if (token && loginHint && typeof token === 'string' && typeof loginHint === 'string') {
      const { primaryEmail } = await query.users.findUserById(session.accountId);

      assertThat(primaryEmail, 'user.email_not_exist');

      if (primaryEmail !== loginHint) {
        const searchParams = new URLSearchParams({ login_hint: loginHint, one_time_token: token });
        ctx.redirect(`${experience.routes.switchAccount}?${searchParams.toString()}`);
        return;
      }
    }

    return next();
  };
}
