import type { CustomClientMetadata, OidcClientMetadata, Scope } from '@logto/schemas';
import { ApplicationType, customClientMetadataGuard, GrantType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { AllClientMetadata, ClientAuthMethod, KoaContextWithOIDC } from 'oidc-provider';
import { errors } from 'oidc-provider';

import type { EnvSet } from '#src/env-set/index.js';

export const getConstantClientMetadata = (
  envSet: EnvSet,
  type: ApplicationType
): AllClientMetadata => {
  const { jwkSigningAlg } = envSet.oidc;

  const getTokenEndpointAuthMethod = (): ClientAuthMethod => {
    switch (type) {
      case ApplicationType.Native:
      case ApplicationType.SPA: {
        return 'none';
      }

      default: {
        return 'client_secret_basic';
      }
    }
  };

  return {
    application_type: type === ApplicationType.Native ? 'native' : 'web',
    grant_types:
      type === ApplicationType.MachineToMachine
        ? [GrantType.ClientCredentials]
        : [GrantType.AuthorizationCode, GrantType.RefreshToken],
    token_endpoint_auth_method: getTokenEndpointAuthMethod(),
    response_types: conditional(type === ApplicationType.MachineToMachine && []),
    // https://www.scottbrady91.com/jose/jwts-which-signing-algorithm-should-i-use
    authorization_signed_response_alg: jwkSigningAlg,
    userinfo_signed_response_alg: jwkSigningAlg,
    id_token_signed_response_alg: jwkSigningAlg,
    introspection_signed_response_alg: jwkSigningAlg,
  };
};

export const buildOidcClientMetadata = (metadata?: OidcClientMetadata): OidcClientMetadata => ({
  redirectUris: [],
  postLogoutRedirectUris: [],
  ...metadata,
});

export const validateCustomClientMetadata = (key: string, value: unknown) => {
  const result = customClientMetadataGuard.pick({ [key]: true }).safeParse({ [key]: value });

  if (!result.success) {
    throw new errors.InvalidClientMetadata(key);
  }
};

export const isOriginAllowed = (
  origin: string,
  { corsAllowedOrigins = [] }: CustomClientMetadata,
  redirectUris: string[] = []
) => {
  const redirectUriOrigins = redirectUris.map((uri) => new URL(uri).origin);

  return [...corsAllowedOrigins, ...redirectUriOrigins].includes(origin);
};

/**
 * OIDC Provider by default won't revoke the pre-granted resource scopes
 * even if the scope has been remove from the target user
 */
export const rejectRevokedResourceScopesFromGrant = (
  ctx: KoaContextWithOIDC,
  resourceIndicator: string,
  resourceScopes: readonly Scope[]
) => {
  const { Grant } = ctx.oidc.entities;

  if (!Grant) {
    return;
  }

  const grantedResourceScope = Grant.getResourceScope(resourceIndicator);
  const grantedResourceScopes = conditional(
    Boolean(grantedResourceScope) && grantedResourceScope.split(' ')
  );

  const revokedScopes = grantedResourceScopes?.filter((scope) =>
    resourceScopes.every(({ name }) => name !== scope)
  );

  if (revokedScopes?.length) {
    Grant.rejectResourceScope(resourceIndicator, revokedScopes.join(' '));
  }
};
