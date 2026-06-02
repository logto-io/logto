import { buildBuiltInApplicationDataForTenant, isBuiltInApplicationId } from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import type { Provider } from 'oidc-provider';
import { errors } from 'oidc-provider';

import { consent, getMissingScopes } from '#src/libraries/session/index.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * Automatically consent for the first party apps.
 */

const shouldAutoConsentApplication = async (clientId: string, query: Queries) => {
  const {
    applications: { findApplicationById },
  } = query;

  const application = isBuiltInApplicationId(clientId)
    ? buildBuiltInApplicationDataForTenant('', clientId)
    : await findApplicationById(clientId);

  return !application.isThirdParty;
};

export default function koaAutoConsent<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseBodyT,
>(provider: Provider, query: Queries): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const { interactionDetails } = ctx;
    const {
      params: { client_id: clientId },
      prompt,
    } = interactionDetails;

    assertThat(
      clientId && typeof clientId === 'string',
      new errors.InvalidClient('client must be available')
    );

    const shouldAutoConsent = await shouldAutoConsentApplication(clientId, query);

    if (shouldAutoConsent) {
      const { missingOIDCScope: missingOIDCScopes, missingResourceScopes: resourceScopesToGrant } =
        getMissingScopes(prompt);

      const redirectTo = await consent({
        ctx,
        provider,
        queries: query,
        interactionDetails,
        missingOIDCScopes,
        resourceScopesToGrant,
        markAppLevelAccessControlChecked: true,
      });

      ctx.redirect(redirectTo);
      return;
    }

    return next();
  };
}
