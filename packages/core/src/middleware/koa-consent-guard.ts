import { experience, OneTimeTokenStatus } from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import { type Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
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
>(
  provider: Provider,
  libraries: Libraries,
  queries: Queries
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    const {
      params: { one_time_token: token, login_hint: loginHint },
      session,
    } = interactionDetails;

    assertThat(session, new RequestError({ code: 'session.not_found' }));

    // Handle one-time token before auto-consent
    if (token && loginHint && typeof token === 'string' && typeof loginHint === 'string') {
      const { primaryEmail } = await queries.users.findUserById(session.accountId);

      assertThat(primaryEmail, 'user.email_not_exist');

      if (primaryEmail !== loginHint) {
        const searchParams = new URLSearchParams({ login_hint: loginHint, one_time_token: token });
        ctx.redirect(`${experience.routes.switchAccount}?${searchParams.toString()}`);
        return;
      }

      try {
        await libraries.oneTimeTokens.checkOneTimeToken(token, loginHint);
        const {
          context: { jitOrganizationIds },
        } = await libraries.oneTimeTokens.updateOneTimeTokenStatus(
          token,
          OneTimeTokenStatus.Consumed
        );

        if (jitOrganizationIds) {
          await libraries.users.provisionOrganizations({
            userId: session.accountId,
            organizationIds: jitOrganizationIds,
          });
        }
      } catch (error: unknown) {
        if (error instanceof RequestError) {
          // Green light for token in consumed state
          if (error.code === 'one_time_token.token_consumed') {
            return next();
          }
          ctx.redirect(`${experience.routes.oneTimeToken}?errorMessage=${error.message}`);
          return;
        }
        throw error;
      }
    }

    return next();
  };
}
