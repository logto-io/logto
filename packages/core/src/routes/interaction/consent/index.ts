import { UserScope } from '@logto/core-kit';
import {
  consentInfoResponseGuard,
  publicApplicationGuard,
  publicUserInfoGuard,
  applicationSignInExperienceGuard,
  type ConsentInfoResponse,
  Organizations,
} from '@logto/schemas';
import { conditional, deduplicate } from '@silverhand/essentials';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { errors } from 'oidc-provider';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { consent, getMissingScopes } from '#src/libraries/session.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix } from '../const.js';
import type { WithInteractionDetailsContext } from '../middleware/koa-interaction-details.js';

import { filterAndParseMissingResourceScopes } from './utils.js';

const { InvalidClient, InvalidRedirectUri } = errors;

export default function consentRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<T>>,
  { provider, queries, libraries }: TenantContext
) {
  const {
    applications: { validateUserConsentOrganizationMembership },
  } = libraries;
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

      const {
        session,
        params: { client_id: applicationId },
        prompt,
      } = interactionDetails;

      assertThat(session, 'session.not_found');

      assertThat(
        applicationId && typeof applicationId === 'string',
        new InvalidClient('client must be available')
      );

      const { accountId: userId } = session;

      // Grant the organizations to the application if the user has selected the organizations
      if (organizationIds?.length) {
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

      const { missingOIDCScope = [], missingResourceScopes: allMissingResourceScopes = {} } =
        getMissingScopes(prompt);

      /* === Rebuild resource scopes === */
      // The resource scopes saved in the prompt details lost the organization information.
      // Instead of trust the front-end's submission, we choose to find the organizations and build the resource scopes again,
      // to ensure the scopes are correct.

      // Find the organizations granted by the user
      // The user may send consent request multiple times, so we need to find the organizations again
      const [, organizations] = EnvSet.values.isDevFeaturesEnabled
        ? await queries.applications.userConsentOrganizations.getEntities(Organizations, {
            applicationId,
            userId,
          })
        : [0, []];

      // The missingResourceScopes from the prompt details are from `getResourceServerInfo`,
      // which contains resource scopes and organization resource scopes.
      // We need to separate the organization resource scopes from the resource scopes.
      // The "scopes" in `missingResourceScopes` do not have "id", so we have to rebuild the scopes list.
      const missingResourceScopes = await filterAndParseMissingResourceScopes({
        resourceScopes: allMissingResourceScopes,
        queries,
        libraries,
        userId,
      });

      const organizationsWithMissingResourceScopes = await Promise.all(
        organizations.map(async ({ name, id }) => {
          if (!EnvSet.values.isDevFeaturesEnabled) {
            return { name, id };
          }

          const missingResourceScopes = await filterAndParseMissingResourceScopes({
            resourceScopes: allMissingResourceScopes,
            queries,
            libraries,
            userId,
            organizationId: id,
          });

          return { name, id, missingResourceScopes };
        })
      );
      /* === End rebuild resource scopes === */

      // Join the missing resource scopes from the prompt details and the missing resource scopes from the organizations
      const resourceScopesEntries: Array<[string, string[]]> = missingResourceScopes.map(
        ({ resource, scopes }) => [resource.indicator, scopes.map(({ name }) => name)]
      );
      const resourceScopesToGrant: Record<string, string[]> = Object.fromEntries(
        organizationsWithMissingResourceScopes.reduce<Array<[string, string[]]>>(
          (entries, { missingResourceScopes }) => {
            if (!missingResourceScopes) {
              return entries;
            }

            const organizationEntries: Array<[string, string[]]> = missingResourceScopes.map(
              ({ resource, scopes }) => [resource.indicator, scopes.map(({ name }) => name)]
            );

            // The entries whoes resource indecator is not in the prev entries
            const newEntries: Array<[string, string[]]> = organizationEntries.filter(
              ([resourceIndicator]) =>
                !entries.some(([indicator]) => indicator === resourceIndicator)
            );

            const existingEntries: Array<[string, string[]]> = entries.map(
              ([indicator, scopes]) => {
                const organizationEntry = organizationEntries.find(
                  ([resourceIndicator]) => resourceIndicator === indicator
                );

                if (!organizationEntry) {
                  return [indicator, scopes];
                }

                return [indicator, deduplicate([...scopes, ...organizationEntry[1]])];
              }
            );

            return [...newEntries, ...existingEntries];
          },
          resourceScopesEntries
        )
      );

      const resourceScopesToReject = Object.fromEntries(
        Object.entries(allMissingResourceScopes).map(([resourceIndicator, scopes]) => {
          const resource = resourceScopesToGrant[resourceIndicator];

          if (!resource) {
            return [resourceIndicator, []];
          }

          return [resourceIndicator, scopes.filter((scope) => !resource.includes(scope))];
        })
      );

      const redirectTo = await consent({
        ctx,
        provider,
        queries,
        interactionDetails,
        missingOIDCScopes: missingOIDCScope,
        resourceScopesToGrant,
        resourceScopesToReject,
      });

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

      const { missingOIDCScope, missingResourceScopes: allMissingResourceScopes = {} } =
        getMissingScopes(prompt);

      // The missingResourceScopes from the prompt details are from `getResourceServerInfo`,
      // which contains resource scopes and organization resource scopes.
      // We need to separate the organization resource scopes from the resource scopes.
      // The "scopes" in `missingResourceScopes` do not have "id", so we have to rebuild the scopes list.
      const missingResourceScopes = await filterAndParseMissingResourceScopes({
        resourceScopes: allMissingResourceScopes,
        queries,
        libraries,
        userId: accountId,
      });

      // Find the organizations if the application is requesting the organizations scope
      const organizations = missingOIDCScope?.includes(UserScope.Organizations)
        ? await queries.organizations.relations.users.getOrganizationsByUserId(accountId)
        : [];

      const organizationsWithMissingResourceScopes = await Promise.all(
        organizations.map(async ({ name, id }) => {
          if (!EnvSet.values.isDevFeaturesEnabled) {
            return { name, id };
          }

          const missingResourceScopes = await filterAndParseMissingResourceScopes({
            resourceScopes: allMissingResourceScopes,
            queries,
            libraries,
            userId: accountId,
            organizationId: id,
          });

          return { name, id, missingResourceScopes };
        })
      );

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
        organizations: organizationsWithMissingResourceScopes,
        // Filter out the OIDC scopes that are not needed for the consent page.
        missingOIDCScope: missingOIDCScope?.filter(
          (scope) => scope !== 'openid' && scope !== 'offline_access'
        ),
        missingResourceScopes,
        redirectUri,
      } satisfies ConsentInfoResponse;

      return next();
    }
  );
}
