import { ReservedResource, UserScope } from '@logto/core-kit';
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
import { z } from 'zod';

import { consent, getMissingScopes } from '#src/libraries/session.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';

const { InvalidClient, InvalidTarget, InvalidRedirectUri } = errors;

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
      // Organization resources are reserved resources, we don't need to find the resource details
      if (resourceIndicator === ReservedResource.Organization) {
        const [_, organizationScopes] = await queries.organizations.scopes.findAll();
        const scopes = scopeNames.map((scopeName) => {
          const scope = organizationScopes.find((scope) => scope.name === scopeName);

          // Will be guarded by OIDC provider, should not happen
          assertThat(
            scope,
            new InvalidTarget(`scope with name ${scopeName} not found for organization resource`)
          );

          return scope;
        });

        return {
          resource: {
            id: resourceIndicator,
            name: resourceIndicator,
          },
          scopes,
        };
      }

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
  {
    provider,
    queries,
    libraries: {
      applications: { validateUserConsentOrganizationMembership },
    },
  }: TenantContext
) {
  const consentPath = `${interactionPrefix}/consent`;

  router.post(
    consentPath,
    koaGuard({
      body: z.object({
        organizationIds: z.string().array().optional(),
      }),
      status: [200],
    }),
    async (ctx, next) => {
      const {
        interactionDetails,
        guard: {
          body: { organizationIds },
        },
      } = ctx;

      // Grant the organizations to the application if the user has selected the organizations
      if (organizationIds?.length) {
        const {
          session,
          params: { client_id: applicationId },
        } = interactionDetails;

        assertThat(session, 'session.not_found');

        assertThat(
          applicationId && typeof applicationId === 'string',
          new InvalidClient('client must be available')
        );

        const { accountId: userId } = session;

        // Assert that user is a member of all organizations
        await validateUserConsentOrganizationMembership(userId, organizationIds);

        await queries.applications.userConsentOrganizations.insert(
          ...organizationIds.map<[string, string, string]>((organizationId) => [
            applicationId,
            userId,
            organizationId,
          ])
        );
      }

      const redirectTo = await consent(ctx, provider, queries, interactionDetails);

      ctx.body = { redirectTo };

      return next();
    }
  );

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
        params: { client_id: clientId, redirect_uri: redirectUri },
        prompt,
      } = interactionDetails;

      assertThat(session, 'session.not_found');

      assertThat(
        clientId && typeof clientId === 'string',
        new InvalidClient('client must be available')
      );

      assertThat(
        redirectUri && typeof redirectUri === 'string',
        new InvalidRedirectUri('redirect_uri must be available')
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
        redirectUri,
      } satisfies ConsentInfoResponse;

      return next();
    }
  );
}
