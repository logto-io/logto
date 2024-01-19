import { UserScope } from '@logto/core-kit';
import {
  consentInfoResponseGuard,
  publicApplicationGuard,
  publicUserInfoGuard,
  applicationSignInExperienceGuard,
  publicOrganizationGuard,
  missingResourceScopesGuard,
  type ConsentInfoResponse,
  type MissingResourceScopes,
  type Scope,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { errors } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import { consent, getMissingScopes } from '#src/libraries/session.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';

const { InvalidClient, InvalidTarget } = errors;

/**
 * Parse the missing resource scopes info with details. We need to display the resource name and scope details on the consent page.
 */
const parseMissingResourceScopesInfo = async (
  queries: Queries,
  missingResourceScopes?: Record<string, string[]>
): Promise<MissingResourceScopes[]> => {
  if (!missingResourceScopes) {
    return [];
  }

  const resourcesWithScopes = await Promise.all(
    Object.entries(missingResourceScopes).map(async ([resourceIndicator, scopeNames]) => {
      const resource = await queries.resources.findResourceByIndicator(resourceIndicator);

      // Will be guarded by OIDC provider, should not happen
      assertThat(
        resource,
        new InvalidTarget(`resource with indicator ${resourceIndicator} not found`)
      );

      // Find the scopes details
      const scopes = await Promise.all(
        scopeNames.map(async (scopeName) =>
          queries.scopes.findScopeByNameAndResourceId(scopeName, resource.id)
        )
      );

      return {
        resource,
        scopes: scopes
          // eslint-disable-next-line no-implicit-coercion -- filter out not found scopes (should not happen)
          .filter((scope): scope is Scope => !!scope),
      };
    })
  );

  return (
    resourcesWithScopes
      // Filter out if all resource scopes are not found (should not happen)
      .filter(({ scopes }) => scopes.length > 0)
      .map((resourceWithGroups) => missingResourceScopesGuard.parse(resourceWithGroups))
  );
};

export default function consentRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<T>>,
  { provider, queries }: TenantContext
) {
  const consentPath = `${interactionPrefix}/consent`;

  router.post(consentPath, async (ctx, next) => {
    const { interactionDetails } = ctx;

    const redirectTo = await consent(ctx, provider, queries, interactionDetails);

    ctx.body = { redirectTo };

    return next();
  });

  // FIXME: @simeng-li remove this when the IdP is ready
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  /**
   * Get the consent info for the experience consent page.
   */
  router.get(
    consentPath,
    koaGuard({
      status: [200],
      response: consentInfoResponseGuard,
    }),
    async (ctx, next) => {
      const { interactionDetails } = ctx;

      const {
        session,
        params: { client_id: clientId },
        prompt,
      } = interactionDetails;

      assertThat(session, 'session.not_found');

      assertThat(
        clientId && typeof clientId === 'string',
        new InvalidClient('client must be available')
      );

      const { accountId } = session;

      const application = await queries.applications.findApplicationById(clientId);

      const applicationSignInExperience =
        await queries.applicationSignInExperiences.safeFindSignInExperienceByApplicationId(
          clientId
        );

      const userInfo = await queries.users.findUserById(accountId);

      const { missingOIDCScope, missingResourceScopes } = getMissingScopes(prompt);

      // Find the organizations if the application is requesting the organizations scope
      const organizations = missingOIDCScope?.includes(UserScope.Organizations)
        ? await queries.organizations.relations.users.getOrganizationsByUserId(accountId)
        : undefined;

      ctx.body = {
        // Merge the public application data and application sign-in-experience data
        application: {
          ...publicApplicationGuard.parse(application),
          ...conditional(
            applicationSignInExperience &&
              applicationSignInExperienceGuard.parse(applicationSignInExperience)
          ),
        },
        user: publicUserInfoGuard.parse(userInfo),
        organizations: organizations?.map((organization) =>
          publicOrganizationGuard.parse(organization)
        ),
        // Filter out the OIDC scopes that are not needed for the consent page.
        missingOIDCScope: missingOIDCScope?.filter(
          (scope) => scope !== 'openid' && scope !== 'offline_access'
        ),
        // Parse the missing resource scopes info with details.
        missingResourceScopes: await parseMissingResourceScopesInfo(queries, missingResourceScopes),
      } satisfies ConsentInfoResponse;

      return next();
    }
  );
}
