import { ReservedResource } from '@logto/core-kit';
import { type Resource } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { type KoaContextWithOIDC } from 'oidc-provider';
import type Provider from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

const isReservedResource = (indicator: string): indicator is ReservedResource =>
  // eslint-disable-next-line no-restricted-syntax -- it's the best way to do it
  Object.values(ReservedResource).includes(indicator as ReservedResource);

export const getSharedResourceServerData = (
  envSet: EnvSet
): Pick<Provider.ResourceServer, 'accessTokenFormat' | 'jwt'> => ({
  accessTokenFormat: 'jwt',
  jwt: {
    sign: { alg: envSet.oidc.jwkSigningAlg },
  },
});

/**
 * Find the scopes for a given resource indicator according to the subject in the
 * context. The subject can be either a user or an application.
 *
 * This function also handles the reserved resources.
 *
 * @see {@link ReservedResource} for the list of reserved resources.
 */
export const findResourceScopes = async (
  queries: Queries,
  libraries: Libraries,
  ctx: KoaContextWithOIDC,
  indicator: string
): Promise<ReadonlyArray<{ name: string }>> => {
  if (isReservedResource(indicator)) {
    switch (indicator) {
      case ReservedResource.Organization: {
        const [, rows] = await queries.organizations.scopes.findAll();
        return rows;
      }

      default: {
        return [];
      }
    }
  }

  const { oidc } = ctx;
  const {
    users: { findUserScopesForResourceIndicator },
    applications: { findApplicationScopesForResourceIndicator },
  } = libraries;
  const userId = oidc.session?.accountId ?? oidc.entities.Account?.accountId;

  if (userId) {
    return findUserScopesForResourceIndicator(userId, indicator);
  }

  const clientId = oidc.entities.Client?.clientId;

  if (clientId) {
    return findApplicationScopesForResourceIndicator(clientId, indicator);
  }

  return [];
};

/**
 * The default TTL (Time To Live) of the access token for the reversed resources.
 * It may be configurable in the future.
 */
export const reversedResourceAccessTokenTtl = 3600;

/**
 * Find the resource for a given indicator. This function also handles the reserved
 * resources.
 *
 * @see {@link ReservedResource} for the list of reserved resources.
 */
export const findResource = async (
  queries: Queries,
  indicator: string
): Promise<Nullable<Pick<Resource, 'indicator' | 'accessTokenTtl'>>> => {
  if (isReservedResource(indicator)) {
    return {
      indicator,
      accessTokenTtl: reversedResourceAccessTokenTtl,
    };
  }

  return queries.resources.findResourceByIndicator(indicator);
};
