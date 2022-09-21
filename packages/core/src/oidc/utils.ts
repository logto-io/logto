import {
  ApplicationType,
  CustomClientMetadata,
  customClientMetadataGuard,
  GrantType,
  OidcClientMetadata,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { AllClientMetadata, ClientAuthMethod, errors } from 'oidc-provider';

export const getConstantClientMetadata = (
  type: ApplicationType
): Pick<
  AllClientMetadata,
  'application_type' | 'grant_types' | 'token_endpoint_auth_method' | 'response_types'
> => {
  const getTokenEndpointAuthMethod = (): ClientAuthMethod => {
    switch (type) {
      case ApplicationType.Native:
      case ApplicationType.SPA:
        return 'none';
      default:
        return 'client_secret_basic';
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
