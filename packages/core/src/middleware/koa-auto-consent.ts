import { buildBuiltInApplicationDataForTenant, isBuiltInApplicationId } from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import type { Provider } from 'oidc-provider';
import { errors } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { consent, getMissingScopes } from '#src/libraries/session/index.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import { isCimdClient } from '#src/oidc/cimd/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * Automatically consent for the first party apps.
 */

const shouldAutoConsentApplication = async (clientId: string, query: Queries, envSet: EnvSet) => {
  const {
    applications: { findApplicationById },
  } = query;

  if (isCimdClient(envSet, clientId)) {
    /**
     * Registered application ids never take the URL shape, and authorization has already
     * resolved this client — a URL here is a CIMD client, which is never first-party.
     */
    return false;
  }

  const application = isBuiltInApplicationId(clientId)
    ? buildBuiltInApplicationDataForTenant('', clientId)
    : await findApplicationById(clientId);

  return !application.isThirdParty;
};

const isApplicationAccessDeniedError = (error: unknown) =>
  error instanceof RequestError && error.code === 'oidc.access_denied';

export default function koaAutoConsent<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseBodyT,
>(
  provider: Provider,
  envSet: EnvSet,
  query: Queries,
  libraries: Libraries
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const { interactionDetails } = ctx;
    const {
      params: { client_id: clientId },
      prompt,
      session,
    } = interactionDetails;

    assertThat(session, new RequestError({ code: 'session.not_found' }));
    assertThat(
      clientId && typeof clientId === 'string',
      new errors.InvalidClient('client must be available')
    );

    const shouldAutoConsent = await shouldAutoConsentApplication(clientId, query, envSet);

    if (shouldAutoConsent) {
      try {
        await libraries.applicationAccessControl.assertUserHasApplicationAccess(
          clientId,
          session.accountId
        );
      } catch (error: unknown) {
        if (isApplicationAccessDeniedError(error)) {
          return next();
        }

        throw error;
      }

      const { missingOIDCScope: missingOIDCScopes, missingResourceScopes: resourceScopesToGrant } =
        getMissingScopes(prompt);

      const redirectTo = await consent({
        ctx,
        provider,
        envSet,
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
