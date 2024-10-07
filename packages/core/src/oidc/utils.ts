import path from 'node:path';

import type { CustomClientMetadata, ExtraParamsObject, OidcClientMetadata } from '@logto/schemas';
import {
  ApplicationType,
  customClientMetadataGuard,
  GrantType,
  ExtraParamsKey,
  FirstScreen,
  experience,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { type AllClientMetadata, type ClientAuthMethod, errors } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';

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
        : [GrantType.AuthorizationCode, GrantType.RefreshToken, GrantType.TokenExchange],
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

// eslint-disable-next-line @typescript-eslint/ban-types
const isKeyOf = <T extends object>(object: T, key: string | number | symbol): key is keyof T =>
  key in object;

export const validateCustomClientMetadata = (key: string, value: unknown) => {
  if (isKeyOf(customClientMetadataGuard.shape, key)) {
    const result = customClientMetadataGuard.shape[key].safeParse(value);
    if (result.success) {
      return;
    }
  }

  throw new errors.InvalidClientMetadata(key);
};

export const isOriginAllowed = (
  origin: string,
  { corsAllowedOrigins = [] }: CustomClientMetadata,
  redirectUris: string[] = []
) => {
  const redirectUriOrigins = redirectUris.map((uri) => new URL(uri).origin);

  return [...corsAllowedOrigins, ...redirectUriOrigins].includes(origin);
};

export const getUtcStartOfTheDay = (date: Date) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
  );
};

const firstScreenRouteMapping: Record<FirstScreen, keyof typeof experience.routes> = {
  [FirstScreen.SignIn]: 'signIn',
  [FirstScreen.Register]: 'register',
  [FirstScreen.ResetPassword]: 'resetPassword',
  [FirstScreen.IdentifierSignIn]: 'identifierSignIn',
  [FirstScreen.IdentifierRegister]: 'identifierRegister',
  [FirstScreen.SingleSignOn]: 'sso',
  [FirstScreen.SignInDeprecated]: 'signIn',
};

// Note: this eslint comment can be removed once the dev feature flag is removed

export const buildLoginPromptUrl = (params: ExtraParamsObject, appId?: unknown): string => {
  const firstScreenKey =
    params[ExtraParamsKey.FirstScreen] ??
    params[ExtraParamsKey.InteractionMode] ??
    FirstScreen.SignIn;

  const firstScreen =
    firstScreenKey === 'signUp'
      ? experience.routes.register
      : experience.routes[firstScreenRouteMapping[firstScreenKey]];

  const directSignIn = params[ExtraParamsKey.DirectSignIn];
  const searchParams = new URLSearchParams();
  const getSearchParamString = () => (searchParams.size > 0 ? `?${searchParams.toString()}` : '');

  if (appId) {
    searchParams.append('app_id', String(appId));
  }

  if (params[ExtraParamsKey.OrganizationId]) {
    searchParams.append(ExtraParamsKey.OrganizationId, params[ExtraParamsKey.OrganizationId]);
  }

  if (params[ExtraParamsKey.LoginHint]) {
    searchParams.append(ExtraParamsKey.LoginHint, params[ExtraParamsKey.LoginHint]);
  }

  if (params[ExtraParamsKey.Identifier]) {
    searchParams.append(ExtraParamsKey.Identifier, params[ExtraParamsKey.Identifier]);
  }

  if (directSignIn) {
    searchParams.append('fallback', firstScreen);
    const [method, target] = directSignIn.split(':');
    return path.join('direct', method ?? '', target ?? '') + getSearchParamString();
  }

  return firstScreen + getSearchParamString();
};
