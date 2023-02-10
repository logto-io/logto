import {
  adminConsoleApplicationId,
  defaultTenantId,
  getManagementApiResourceIndicator,
  managementApiScopeAll,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { assignInteractionResults, saveUserFirstConsentedAppId } from '#src/libraries/session.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';

export default function consentRoutes<T>(
  router: Router<unknown, WithInteractionDetailsContext<T>>,
  { provider, libraries, queries }: TenantContext
) {
  router.post(`${interactionPrefix}/consent`, async (ctx, next) => {
    const { interactionDetails } = ctx;

    const {
      session,
      grantId,
      params: { client_id },
      prompt,
    } = interactionDetails;

    assertThat(session, 'session.not_found');

    const { accountId } = session;

    // Block non-admin user from consenting to admin console
    if (String(client_id) === adminConsoleApplicationId) {
      const scopes = await libraries.users.findUserScopesForResourceIndicator(
        accountId,
        getManagementApiResourceIndicator(defaultTenantId)
      );

      assertThat(
        scopes.some(({ name }) => name === managementApiScopeAll),
        new RequestError({ code: 'auth.forbidden', status: 401 })
      );
    }

    const grant =
      conditional(grantId && (await provider.Grant.find(grantId))) ??
      new provider.Grant({ accountId, clientId: String(client_id) });

    await saveUserFirstConsentedAppId(queries, accountId, String(client_id));

    // V2: fulfill missing claims / resources
    const PromptDetailsBody = z.object({
      missingOIDCScope: z.string().array().optional(),
      missingResourceScopes: z.object({}).catchall(z.string().array()).optional(),
    });
    const { missingOIDCScope, missingResourceScopes } = PromptDetailsBody.parse(prompt.details);

    if (missingOIDCScope) {
      grant.addOIDCScope(missingOIDCScope.join(' '));
    }

    if (missingResourceScopes) {
      for (const [indicator, scope] of Object.entries(missingResourceScopes)) {
        grant.addResourceScope(indicator, scope.join(' '));
      }
    }

    const finalGrantId = await grant.save();

    // V2: configure consent
    await assignInteractionResults(ctx, provider, { consent: { grantId: finalGrantId } }, true);

    return next();
  });
}
