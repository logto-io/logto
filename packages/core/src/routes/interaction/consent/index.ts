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
import { conditional, deduplicate } from '@silverhand/essentials';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { errors } from 'oidc-provider';
import { z } from 'zod';

import { consent, getMissingScopes } from '#src/libraries/session/index.js';
import koaAppAccessControl from '#src/middleware/koa-app-access-control.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import { isCimdClientId } from '#src/oidc/cimd/client-id.js';
import { isCimdEffectivelyEnabled } from '#src/oidc/cimd/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix } from '../const.js';

import { filterAndParseMissingResourceScopes } from './utils.js';

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
        params: { client_id: applicationId, redirect_uri: redirectUri },
        prompt,
      } = interactionDetails;

      assertThat(session, 'session.not_found');

      assertThat(
        applicationId && typeof applicationId === 'string',
        new InvalidClient('client must be available')
      );

      const { accountId: userId } = session;

      // DEV: CIMD (client ID metadata document) support
      const isCimdClient = isCimdEffectivelyEnabled(envSet) && isCimdClientId(applicationId);

      if (isCimdClient) {
        /**
         * The oidc-provider resume path re-runs `checkClient` (re-fetching the metadata
         * document when its cache has expired) but not `check_redirect_uri`, so a URI removed
         * from the current document would still receive the authorization code. Re-assert it
         * here: the document resolved now is the one resume reads moments later.
         */
        const client = await provider.Client.find(applicationId);
        assertThat(client, new InvalidClient('client must be available'));
        assertThat(
          typeof redirectUri === 'string' && client.redirectUriAllowed(redirectUri),
          new InvalidRedirectUri(
            'redirect_uri must still be allowed by the client metadata document'
          )
        );
      }

      // Grant the organizations to the application if the user has selected the organizations
      if (organizationIds?.length) {
        /**
         * Organization grants are keyed to registered applications
         * (`application_user_consent_organizations`); the grant-scoped counterpart for CIMD
         * clients lands with LOG-13930, so a CIMD consent submission must not carry any
         * organization selection.
         */
        assertThat(
          !isCimdClient,
          new InvalidRequest('organization consent is not available for CIMD clients')
        );

        // Assert that user is a member of all organizations
        await validateUserConsentOrganizationMembership(userId, organizationIds);

        await queries.applications.userConsentOrganizations.insert(
          ...organizationIds.map((organizationId) => ({
            applicationId,
            userId,
            organizationId,
          }))
        );
      }

      const { missingOIDCScope = [], missingResourceScopes: allMissingResourceScopes = {} } =
        getMissingScopes(prompt);

      /* === Rebuild resource scopes === */
      // The resource scopes saved in the prompt details lost the organization information.
      // Instead of trust the front-end's submission, we choose to find the organizations and build the resource scopes again,
      // to ensure the scopes are correct.

      // Find the organizations granted by the user
      // The user may send consent request multiple times, so we need to find the organizations again.
      // A CIMD client can hold none until LOG-13930 lands the grant-scoped storage.
      const organizations = isCimdClient
        ? []
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

      const resourceScopesToReject = Object.fromEntries(
        Object.entries(allMissingResourceScopes).map(([resourceIndicator, scopes]) => {
          const resource = resourceScopesToGrant[resourceIndicator];

          if (!resource) {
            /**
             * With the organization rebuild closed for CIMD (until LOG-13930), a scope held
             * only through organization roles can end up neither granted nor rejected; the
             * provider would then see it still missing on resume and restart the consent
             * prompt indefinitely. Reject the whole group instead — consistent with the
             * consent page, which never displayed these scopes.
             *
             * The rejection persists on the grant (rejected counts as encountered), so the
             * scope stays withheld even if the user becomes eligible later — accepted as an
             * interim state: CIMD ships together with LOG-13930, whose grant-scoped
             * organization support reopens the rebuild and retires this branch.
             * TODO: @xiaoyijun reopen the organization rebuild for CIMD (LOG-13930).
             */
            return [resourceIndicator, isCimdClient ? scopes : []];
          }

          return [resourceIndicator, scopes.filter((scope) => !resource.includes(scope))];
        })
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

      // DEV: CIMD (client ID metadata document) support
      const isCimdClient = isCimdEffectivelyEnabled(envSet) && isCimdClientId(clientId);

      /**
       * CIMD clients are unregistered: display data comes from the provider-resolved metadata
       * document (cache-backed) instead of the applications table, and no application-level
       * sign-in experience or device-flow variant exists for them.
       */
      const getApplicationDisplayData = async (): Promise<{
        application: ConsentInfoResponse['application'];
        isDeviceFlowApplication: boolean;
      }> => {
        // DEV: CIMD (client ID metadata document) support
        if (isCimdClient) {
          assertThat(
            await provider.Client.find(clientId),
            new InvalidClient('client must be available')
          );

          /**
           * The document's `client_name` is fully controlled by the remote, unregistered
           * client, and the consent page renders the name as the only identity signal — so
           * showing it verbatim invites phishing (CIMD draft-02 §8.5). Until the identifier
           * hostname is rendered alongside it, the unforgeable identifier URL is the name.
           * TODO: @xiaoyijun display the fetched name with the identifier hostname (LOG-13990).
           */
          return {
            application: { id: clientId, name: clientId },
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
      /**
       * Organization grants are keyed to registered applications
       * (`application_user_consent_organizations`); the grant-scoped counterpart for CIMD
       * clients lands with LOG-13930, so a CIMD consent offers no organization selection yet.
       */
      const organizations =
        !isCimdClient && missingOIDCScope?.includes(UserScope.Organizations)
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
