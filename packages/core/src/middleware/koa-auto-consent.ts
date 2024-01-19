import { demoAppApplicationId } from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';
import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import { consent } from '#src/libraries/session.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

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

    const {
      applications: { findApplicationById },
    } = query;

    assertThat(
      clientId && typeof clientId === 'string',
      new errors.InvalidClient('client must be available')
    );

    // Demo app not in the database
    const application =
      clientId === demoAppApplicationId ? undefined : await findApplicationById(clientId);

    // FIXME: @simeng-li remove this when the IdP is ready
    const shouldAutoConsent = !EnvSet.values.isDevFeaturesEnabled || !application?.isThirdParty;

    if (shouldAutoConsent) {
      const redirectTo = await consent(ctx, provider, query, interactionDetails);

      ctx.redirect(redirectTo);
      return;
    }

    return next();
  };
}
