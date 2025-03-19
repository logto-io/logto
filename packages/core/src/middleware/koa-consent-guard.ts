import { experience } from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import { errors, type Provider } from 'oidc-provider';

import RequestError from '../errors/RequestError/index.js';
import type Libraries from '../tenants/Libraries.js';
import type Queries from '../tenants/Queries.js';
import assertThat from '../utils/assert-that.js';

/**
 * Guard before allowing auto-consent
 */
export default function koaConsentGuard<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT,
>(
  provider: Provider,
  libraries: Libraries,
  query: Queries
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    const {
      params: { token, login_hint: loginHint },
      session,
    } = interactionDetails;

    assertThat(session, new errors.SessionNotFound('session not found'));

    if (token && loginHint && typeof token === 'string' && typeof loginHint === 'string') {
      const user = await query.users.findUserById(session.accountId);

      assertThat(user.primaryEmail, 'user.email_not_exist');

      if (user.primaryEmail !== loginHint) {
        const searchParams = new URLSearchParams({
          account: user.primaryEmail,
        });
        ctx.redirect(`${experience.routes.switchAccount}?${searchParams.toString()}`);
        return;
      }

      try {
        await libraries.oneTimeTokens.verifyOneTimeToken(token, loginHint);
      } catch (error: unknown) {
        if (error instanceof RequestError) {
          if (error.code === 'one_time_token.email_mismatch') {
            const searchParams = new URLSearchParams({
              account: user.primaryEmail,
            });
            ctx.redirect(`${experience.routes.switchAccount}?${searchParams.toString()}`);
            return;
          }
          const searchParams = new URLSearchParams({
            code: error.code,
            status: error.status.toString(),
            message: error.message,
          });
          ctx.redirect(`${experience.routes.error}?${searchParams.toString()}`);
          return;
        }

        throw error;
      }
    }

    return next();
  };
}
