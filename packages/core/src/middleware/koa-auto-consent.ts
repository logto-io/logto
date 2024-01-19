import { trySafe } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import type Provider from 'oidc-provider';

import { consent } from '#src/libraries/session.js';
import type Queries from '#src/tenants/Queries.js';

/**
 * Automatically consent for the first party apps.
 */
export default function koaAutoConsent<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  provider: Provider,
  query: Queries
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    const { client_id: clientId } = interactionDetails.params;

    const application = await trySafe(async () =>
      query.applications.findApplicationById(String(clientId))
    );

    const shouldAutoConsent = !application?.isThirdParty;

    if (!shouldAutoConsent) {
      return next();
    }

    const redirectTo = await consent(ctx, provider, query, interactionDetails);

    ctx.redirect(redirectTo);
  };
}
