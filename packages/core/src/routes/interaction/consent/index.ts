import { UserScope } from '@logto/core-kit';
import {
  ApplicationType,
  applicationSignInExperienceGuard,
  buildBuiltInApplicationDataForTenant,
  type ConsentInfoResponse,
  consentInfoResponseGuard,
  Organizations,
  publicApplicationGuard,
  publicUserInfoGuard,
  isBuiltInApplicationId,
} from '@logto/schemas';
import { conditional, conditionalString, deduplicate } from '@silverhand/essentials';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { errors } from 'oidc-provider';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { consent, getMissingScopes } from '#src/libraries/session/index.js';
import koaAppAccessControl from '#src/middleware/koa-app-access-control.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import { isCimdClient } from '#src/oidc/cimd/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix } from '../const.js';

import {
  buildResourceScopesToReject,
  filterAndParseMissingResourceScopes,
  revalidateConsentClient,
} from './utils.js';

const { InvalidClient, InvalidRedirectUri, InvalidRequest } = errors;

export default function consentRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<T>>,
  { provider, envSet, queries, libraries }: TenantContext
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
      status: [200, 400],
    }),
    koaAppAccessControl(envSet, libraries),
    async (ctx, next) => {
      const {
        interactionDetails,
        guard: {
          body: { organizationIds },
        },
      } = ctx;

      const {
        session,
        params: { client_id: applicationId, redirect_uri: redirectUri, scope },
        prompt,
      } = interactionDetails;

      assertThat(session, 'session.not_found');

      assertThat(
        applicationId && typeof applicationId === 'string',
        new InvalidClient('client must be available')
      );

      const { accountId: userId } = session;

      const cimd = isCimdClient(envSet, applicationId);

      const { missingOIDCScope = [], missingResourceScopes: allMissingResourceScopes = {} } =
        getMissingScopes(prompt);

      await revalidateConsentClient({
        provider,
        queries,
        applicationId,
        cimd,
        redirectUri,
        requestedScope: scope,
        missingOIDCScope,
      });

      // Grant the organizations to the application if the user has selected the organizations
      if (organizationIds?.length) {
        /** One grant carries one organization for a CIMD client. */
        if (cimd) {
          assertThat(
            organizationIds.length === 1,
            new InvalidRequest('at most one organization can be consented to a CIMD client')
          );
        }

        // Assert that user is a member of all organizations
        await validateUserConsentOrganizationMembership(userId, organizationIds);

        /** The CIMD counterpart is grant-keyed — `consent()` writes it after `grant.save()`. */
        if (!cimd) {
          await queries.applications.userConsentOrganizations.insert(
            ...organizationIds.map((organizationId) => ({
              applicationId,
              userId,
              organizationId,
            }))
          );
        }
      }

      /* === Rebuild resource scopes === */
      // The resource scopes saved in the prompt details lost the organization information.
      // Instead of trust the front-end's submission, we choose to find the organizations and build the resource scopes again,
      // to ensure the scopes are correct.

      /**
       * A CIMD authorization is served by its own grant alone, so the just-validated selection
       * is its whole organization set; registered applications re-query the cross-grant relation.
       */
      const organizations = cimd
        ? await Promise.all(
            (organizationIds ?? []).map(async (organizationId) =>
              queries.organizations.findById(organizationId)
            )
          )
        : await queries.applications.userConsentOrganizations
            .getEntities(Organizations, {
              applicationId,
              userId,
            })
            .then(([, entities]) => entities);

      // The missingResourceScopes from the prompt details are from `getResourceServerInfo`,
      // which contains resource scopes and organization resource scopes.
      // We need to separate the organization resource scopes from the resource scopes.
      // The "scopes" in `missingResourceScopes` do not have "id", so we have to rebuild the scopes list.
      const missingResourceScopes = await filterAndParseMissingResourceScopes({
        resourceScopes: allMissingResourceScopes,
        envSet,
        queries,
        libraries,
        userId,
        applicationId,
      });

      const organizationsWithMissingResourceScopes = await Promise.all(
        organizations.map(async ({ name, id }) => {
          const missingResourceScopes = await filterAndParseMissingResourceScopes({
            resourceScopes: allMissingResourceScopes,
            envSet,
            queries,
            libraries,
            userId,
            organizationId: id,
            applicationId,
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
            const organizationEntries: Array<[string, string[]]> = missingResourceScopes.map(
              ({ resource, scopes }) => [resource.indicator, scopes.map(({ name }) => name)]
            );

            // The entries whose resource indicator is not present in the previous entries
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

      const resourceScopesToReject = buildResourceScopesToReject(
        allMissingResourceScopes,
        resourceScopesToGrant,
        cimd
      );

      const redirectTo = await consent({
        ctx,
        provider,
        envSet,
        queries,
        interactionDetails,
        missingOIDCScopes: missingOIDCScope,
        resourceScopesToGrant,
        resourceScopesToReject,
        markAppLevelAccessControlChecked: true,
        cimdOrganizationId: conditional(cimd && organizationIds?.[0]),
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
      status: [200, 400],
      response: consentInfoResponseGuard,
    }),
    koaAppAccessControl(envSet, libraries),
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

      const { accountId } = session;

      const cimd = isCimdClient(envSet, clientId);

      /**
       * CIMD clients are unregistered: display data comes from the provider-resolved metadata
       * document (cache-backed) instead of the applications table, and no application-level
       * sign-in experience or device-flow variant exists for them.
       */
      const getApplicationDisplayData = async (): Promise<{
        application: ConsentInfoResponse['application'];
        isDeviceFlowApplication: boolean;
      }> => {
        if (cimd) {
          const client = await provider.Client.find(clientId);
          assertThat(client, new InvalidClient('client must be available'));

          /**
           * The document's `client_name` is fully controlled by the remote, unregistered client,
           * so it must never be the page's only identity signal (CIMD draft-02 §8.5) — the
           * unforgeable identifier URL rides in `id` for the consent page to render beside it.
           *
           * `client_name` is optional in the document and the provider neither requires nor
           * defaults it, so an absent name stays absent: it empties rather than borrowing another
           * value, and the consent page owns what to show in its place.
           */
          return {
            application: {
              id: clientId,
              name: conditionalString(client.clientName),
              termsOfUseUrl: client.tosUri,
              privacyPolicyUrl: client.policyUri,
              ...conditional(client.logoUri && { branding: { logoUrl: client.logoUri } }),
            },
            isDeviceFlowApplication: false,
          };
        }

        const application = isBuiltInApplicationId(clientId)
          ? buildBuiltInApplicationDataForTenant('', clientId)
          : await queries.applications.findApplicationById(clientId);

        const applicationSignInExperience =
          await queries.applicationSignInExperiences.safeFindSignInExperienceByApplicationId(
            clientId
          );

        return {
          // Merge the public application data and application sign-in-experience data
          application: {
            ...publicApplicationGuard.parse(application),
            ...conditional(
              applicationSignInExperience &&
                applicationSignInExperienceGuard.parse(applicationSignInExperience)
            ),
          },
          isDeviceFlowApplication:
            application.type === ApplicationType.Native &&
            Boolean(application.customClientMetadata.isDeviceFlow),
        };
      };

      const { application, isDeviceFlowApplication } = await getApplicationDisplayData();

      if (!isDeviceFlowApplication) {
        assertThat(
          redirectUri && typeof redirectUri === 'string',
          new InvalidRedirectUri('redirect_uri must be available')
        );
      }

      // DEV: CIMD (client ID metadata document) support
      /**
       * Authorization already validated the value against the same client, so a failing check
       * here means the registered set changed mid-flow (for CIMD clients the metadata document
       * may refetch between authorization and consent); the consent screen must not vouch for
       * a redirect target the client no longer registers. Render-time only — issuance stays
       * guarded by the consent POST re-assert.
       */
      if (EnvSet.values.isDevFeaturesEnabled && typeof redirectUri === 'string') {
        const client = await provider.Client.find(clientId);
        assertThat(client, new InvalidClient('client must be available'));
        assertThat(
          client.redirectUriAllowed(redirectUri),
          new InvalidRedirectUri('redirect_uri must match a registered redirect uri')
        );
      }

      const userInfo = await queries.users.findUserById(accountId);

      const { missingOIDCScope, missingResourceScopes: allMissingResourceScopes = {} } =
        getMissingScopes(prompt);

      // The missingResourceScopes from the prompt details are from `getResourceServerInfo`,
      // which contains resource scopes and organization resource scopes.
      // We need to separate the organization resource scopes from the resource scopes.
      // The "scopes" in `missingResourceScopes` do not have "id", so we have to rebuild the scopes list.
      const missingResourceScopes = await filterAndParseMissingResourceScopes({
        resourceScopes: allMissingResourceScopes,
        envSet,
        queries,
        libraries,
        userId: accountId,
        applicationId: clientId,
      });

      // Find the organizations if the application is requesting the organizations scope.
      const organizations = missingOIDCScope?.includes(UserScope.Organizations)
        ? await queries.organizations.relations.users.getOrganizationsByUserId(accountId)
        : [];

      const organizationsWithMissingResourceScopes = await Promise.all(
        organizations.map(async ({ name, id }) => {
          const missingResourceScopes = await filterAndParseMissingResourceScopes({
            resourceScopes: allMissingResourceScopes,
            envSet,
            queries,
            libraries,
            userId: accountId,
            organizationId: id,
            applicationId: clientId,
          });

          return { name, id, missingResourceScopes };
        })
      );

      ctx.body = {
        application,
        user: publicUserInfoGuard.parse(userInfo),
        organizations: organizationsWithMissingResourceScopes,
        // Filter out the OIDC scopes that are not needed for the consent page.
        missingOIDCScope: missingOIDCScope?.filter(
          (scope) => scope !== 'openid' && scope !== 'offline_access'
        ),
        missingResourceScopes,
        // Device flow consent does not require a redirect_uri.
        redirectUri: typeof redirectUri === 'string' ? redirectUri : undefined,
      } satisfies ConsentInfoResponse;

      return next();
    }
  );
}
