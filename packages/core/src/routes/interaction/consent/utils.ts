import { ReservedResource, ReservedScope, UserScope } from '@logto/core-kit';
import { type MissingResourceScopes, type Scope, missingResourceScopesGuard } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import { type Provider, errors } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import { isCimdClient } from '#src/oidc/cimd/index.js';
import { filterResourceScopesForTheCimdClient } from '#src/oidc/cimd/resource-scopes.js';
import {
  filterResourceScopesForTheThirdPartyApplication,
  findResourceScopes,
  isThirdPartyApplication,
} from '#src/oidc/resource.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const { InvalidClient, InvalidRedirectUri, InvalidScope, InvalidTarget } = errors;

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
            indicator: resourceIndicator,
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

/** Find the requested or snapshot OIDC scopes that the client's current scope no longer allows. */
export const findStaleOidcScopes = ({
  clientScope,
  requestedScope,
  missingOIDCScope,
}: {
  clientScope: string | undefined;
  requestedScope: unknown;
  missingOIDCScope: string[];
}): string[] => {
  /** Mirrors the provider `scopes` configuration, keeping resource scope names out of the comparison. */
  const oidcScopes = new Set<string>([
    ...Object.values(ReservedScope),
    ...Object.values(UserScope),
  ]);
  const allowedScopes = new Set(clientScope?.split(' '));
  const requestedOidcScopes =
    typeof requestedScope === 'string'
      ? requestedScope.split(' ').filter((scope) => oidcScopes.has(scope))
      : [];

  return deduplicate([...requestedOidcScopes, ...missingOIDCScope]).filter(
    (scope) => !allowedScopes.has(scope)
  );
};

/**
 * The scopes a submission grants were validated at interaction creation, up to 1 hour ago, and
 * the provider's resume stack never re-runs `checkScope` — re-assert them against the freshly
 * resolved client before anything is written. Resource scopes re-check their own source tables
 * in `filterAndParseMissingResourceScopes`.
 */
export const revalidateConsentClient = async ({
  provider,
  queries,
  applicationId,
  cimd,
  redirectUri,
  requestedScope,
  missingOIDCScope,
}: {
  provider: Provider;
  queries: Queries;
  applicationId: string;
  cimd: boolean;
  redirectUri: unknown;
  requestedScope: unknown;
  missingOIDCScope: string[];
}) => {
  /** A CIMD client is third-party by definition; only registered ids consult the classifier. */
  if (!cimd && !(await isThirdPartyApplication(queries, applicationId))) {
    return;
  }

  const client = await provider.Client.find(applicationId);
  assertThat(client, new InvalidClient('client must be available'));

  if (cimd) {
    /**
     * The oidc-provider resume path re-runs `checkClient` (re-fetching the metadata document
     * when its cache has expired) but not `check_redirect_uri`, so a URI removed from the
     * current document would still receive the authorization code. Re-assert it here against
     * whatever document the cache serves at submission time — best effort, not airtight: a
     * cache expiry between this check and resume can still swap in a changed document
     * unchecked. It narrows the exposure from the whole login-to-consent span to that
     * cache-boundary race.
     */
    assertThat(
      typeof redirectUri === 'string' && client.redirectUriAllowed(redirectUri),
      new InvalidRedirectUri('redirect_uri must still be allowed by the client metadata document')
    );
  }

  const staleOidcScopes = findStaleOidcScopes({
    clientScope: client.scope,
    requestedScope,
    missingOIDCScope,
  });

  assertThat(
    staleOidcScopes.length === 0,
    new InvalidScope(
      'requested scope is no longer allowed for the client',
      staleOidcScopes.join(' ')
    )
  );
};

/**
 * Build the resource scopes to reject on the grant — the requested-but-not-granted remainder of
 * each group.
 *
 * An empty rejection is cleaned off the grant, so an all-ineligible group would stay "missing"
 * and reopen consent forever — reject it whole for a CIMD client, where the rejection dies with
 * the per-authorization grant; a registered client's long-lived grant must stay re-askable for
 * later eligibility changes.
 */
export const buildResourceScopesToReject = (
  allMissingResourceScopes: Record<string, string[]>,
  resourceScopesToGrant: Record<string, string[]>,
  cimd: boolean
): Record<string, string[]> =>
  Object.fromEntries(
    Object.entries(allMissingResourceScopes).map(([resourceIndicator, scopes]) => {
      const resource = resourceScopesToGrant[resourceIndicator];

      if (!resource) {
        return [resourceIndicator, cimd ? scopes : []];
      }

      return [resourceIndicator, scopes.filter((scope) => !resource.includes(scope))];
    })
  );

/**
 * The missingResourceScopes in the prompt details are from `getResourceServerInfo`,
 * which contains resource scopes and organization resource scopes.
 * We need to separate the organization resource scopes from the resource scopes.
 * The "scopes" in `missingResourceScopes` do not have "id", so we have to rebuild the scopes list first.
 */
export const filterAndParseMissingResourceScopes = async ({
  resourceScopes,
  envSet,
  queries,
  libraries,
  userId,
  applicationId,
  organizationId,
}: {
  resourceScopes: Record<string, string[]>;
  envSet: EnvSet;
  queries: Queries;
  libraries: Libraries;
  userId: string;
  applicationId: string;
  organizationId?: string;
}) => {
  const filteredResourceScopes = Object.fromEntries(
    await Promise.all(
      Object.entries(resourceScopes).map(
        async ([resourceIndicator, missingScopes]): Promise<[string, string[]]> => {
          // Fetch the list of scopes, `findFromOrganizations` is set to false,
          // so it will only search the user resource scopes.
          const scopes = await findResourceScopes({
            queries,
            libraries,
            indicator: resourceIndicator,
            userId,
            findFromOrganizations: Boolean(organizationId),
            organizationId,
          });

          if (isCimdClient(envSet, applicationId)) {
            /**
             * CIMD clients are unregistered: the tenant-wide ceiling replaces the
             * per-application consent configuration the third-party filter reads.
             */
            const filteredScopes = await filterResourceScopesForTheCimdClient(
              queries,
              resourceIndicator,
              scopes,
              {
                includeOrganizationResourceScopes: Boolean(organizationId),
                includeResourceScopes: !organizationId,
              }
            );

            return [
              resourceIndicator,
              missingScopes.filter((scope) => filteredScopes.some(({ name }) => name === scope)),
            ];
          }

          const isThirdPartyApp = await isThirdPartyApplication(queries, applicationId);

          // Filter the scopes for the third-party application.
          // Although the "missingResourceScopes" from the prompt details are already filtered,
          // there may be duplicated scopes from either resources or organization resources.
          const filteredScopes = isThirdPartyApp
            ? await filterResourceScopesForTheThirdPartyApplication(
                libraries,
                applicationId,
                resourceIndicator,
                scopes,
                {
                  includeOrganizationResourceScopes: Boolean(organizationId),
                  includeResourceScopes: !organizationId,
                }
              )
            : scopes;

          return [
            resourceIndicator,
            missingScopes.filter((scope) => filteredScopes.some(({ name }) => name === scope)),
          ];
        }
      )
    )
  );

  return parseMissingResourceScopesInfo(queries, filteredResourceScopes);
};
