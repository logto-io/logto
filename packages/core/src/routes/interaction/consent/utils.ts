import { ReservedResource } from '@logto/core-kit';
import { type MissingResourceScopes, type Scope, missingResourceScopesGuard } from '@logto/schemas';
import { errors } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import { findResourceScopes } from '#src/oidc/resource.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const { InvalidTarget } = errors;

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

/**
 * The missingResourceScopes in the prompt details are from `getResourceServerInfo`,
 * which contains resource scopes and organization resource scopes.
 * We need to separate the organization resource scopes from the resource scopes.
 * The "scopes" in `missingResourceScopes` do not have "id", so we have to rebuild the scopes list first.
 */
export const filterAndParseMissingResourceScopes = async ({
  resourceScopes,
  queries,
  libraries,
  userId,
  organizationId,
}: {
  resourceScopes: Record<string, string[]>;
  queries: Queries;
  libraries: Libraries;
  userId: string;
  organizationId?: string;
}) => {
  const filteredResourceScopes = Object.fromEntries(
    await Promise.all(
      Object.entries(resourceScopes).map(
        async ([resourceIndicator, missingScopes]): Promise<[string, string[]]> => {
          if (!EnvSet.values.isDevFeaturesEnabled) {
            return [resourceIndicator, missingScopes];
          }

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

          return [
            resourceIndicator,
            missingScopes.filter((scope) => scopes.some(({ name }) => name === scope)),
          ];
        }
      )
    )
  );

  return parseMissingResourceScopesInfo(queries, filteredResourceScopes);
};
