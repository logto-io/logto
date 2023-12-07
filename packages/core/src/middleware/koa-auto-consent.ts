import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import type Provider from 'oidc-provider';

import { consent } from '#src/libraries/session.js';
import type Queries from '#src/tenants/Queries.js';

const consentPath = '/consent';

export default function koaAutoConsent<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  provider: Provider,
  query: Queries
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;
    const isConsentPath = requestPath.startsWith(consentPath);

    if (!isConsentPath) {
      return next();
    }

    const shouldAutoConsent = true;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Update later. Third party app should not auto consent
    if (!shouldAutoConsent) {
      return next();
    }

    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
    const redirectTo = await consent(ctx, provider, query, interactionDetails);

    ctx.redirect(redirectTo);
  };
}
