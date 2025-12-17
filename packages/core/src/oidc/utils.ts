import path from 'node:path';

import { GoogleConnector } from '@logto/connector-kit';
import type { CustomClientMetadata, ExtraParamsObject, OidcClientMetadata } from '@logto/schemas';
import {
  ApplicationType,
  customClientMetadataGuard,
  GrantType,
  ExtraParamsKey,
  FirstScreen,
  experience,
} from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
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
        ? [GrantType.ClientCredentials, GrantType.TokenExchange]
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
  if (corsAllowedOrigins.includes(origin)) {
    return true;
  }

  for (const uri of redirectUris) {
    if (!uri.includes('*')) {
      try {
        if (new URL(uri).origin === origin) {
          return true;
        }
      } catch {
        continue;
      }

      continue;
    }

    if (matchesOriginAgainstRedirectUriPattern(origin, uri)) {
      return true;
    }
  }

  return false;
};

const getEffectivePort = (protocol: string, port: string) => {
  if (port) {
    return port;
  }

  switch (protocol) {
    case 'http:': {
      return '80';
    }

    case 'https:': {
      return '443';
    }

    default: {
      return '';
    }
  }
};

const escapeRegExp = (value: string) => value.replaceAll(/[\\^$.*+?()[\]{}|]/g, '\\$&');

const matchHostnameLabel = (pattern: string, actual: string) => {
  if (!pattern.includes('*')) {
    return pattern === actual;
  }

  const regex = new RegExp(`^${pattern.split('*').map(escapeRegExp).join('[^.]+')}$`, 'i');
  return regex.test(actual);
};

const matchHostnamePattern = (patternHostname: string, actualHostname: string) => {
  const patternLabels = patternHostname.toLowerCase().split('.');
  const actualLabels = actualHostname.toLowerCase().split('.');

  if (patternLabels.length !== actualLabels.length) {
    return false;
  }

  return patternLabels.every((patternLabel, index) =>
    matchHostnameLabel(patternLabel, actualLabels[index] ?? '')
  );
};

const parseRedirectUriOriginPattern = (patternUrl: string) => {
  const schemeSeparatorIndex = patternUrl.indexOf('://');
  if (schemeSeparatorIndex <= 0) {
    return;
  }

  // Parse a placeholder URL to validate scheme/port and other basic URL parts.
  const parsed = trySafe(() => new URL(patternUrl.replaceAll('*', 'wildcard')));
  if (!parsed) {
    return;
  }

  const rest = patternUrl.slice(schemeSeparatorIndex + 3);
  const authority = rest.split(/[/?#]/)[0] ?? '';
  if (!authority || authority.includes('@') || authority.startsWith('[')) {
    return;
  }

  const lastColonIndex = authority.lastIndexOf(':');
  const hasPort = lastColonIndex > -1 && authority.indexOf(':') === lastColonIndex;
  const hostnamePattern = hasPort ? authority.slice(0, lastColonIndex) : authority;

  return {
    protocol: parsed.protocol,
    hostnamePattern,
    port: parsed.port,
  };
};

const matchesOriginAgainstRedirectUriPattern = (origin: string, redirectUriPattern: string) => {
  const pattern = parseRedirectUriOriginPattern(redirectUriPattern);
  if (!pattern) {
    return false;
  }

  const parsedOrigin = trySafe(() => new URL(origin));
  if (!parsedOrigin) {
    return false;
  }

  if (parsedOrigin.protocol !== pattern.protocol) {
    return false;
  }

  if (
    getEffectivePort(parsedOrigin.protocol, parsedOrigin.port) !==
    getEffectivePort(pattern.protocol, pattern.port)
  ) {
    return false;
  }

  return matchHostnamePattern(pattern.hostnamePattern, parsedOrigin.hostname);
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

// eslint-disable-next-line complexity
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
  const googleOneTapCredential = params[ExtraParamsKey.GoogleOneTapCredential];

  const searchParams = new URLSearchParams();
  const getSearchParamString = () => (searchParams.size > 0 ? `?${searchParams.toString()}` : '');

  const appendExtraParam = (key: keyof ExtraParamsObject) => {
    if (params[key]) {
      searchParams.append(key, params[key]);
    }
  };

  if (appId) {
    searchParams.append('app_id', String(appId));
  }

  appendExtraParam(ExtraParamsKey.OrganizationId);
  appendExtraParam(ExtraParamsKey.OneTimeToken);
  appendExtraParam(ExtraParamsKey.LoginHint);
  appendExtraParam(ExtraParamsKey.Identifier);
  appendExtraParam(ExtraParamsKey.UiLocales);

  // Reuse DirectSignIn page to handle Google One Tap credential.
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (directSignIn || googleOneTapCredential) {
    searchParams.append('fallback', firstScreen);
    const [method, target] =
      directSignIn?.split(':') ??
      // Only add Google connector fallback when Google One Tap credential is present.
      conditional(googleOneTapCredential && ['social', GoogleConnector.target]) ??
      [];
    return path.join('direct', method ?? '', target ?? '') + getSearchParamString();
  }

  return firstScreen + getSearchParamString();
};

export const buildConsentPromptUrl = (appId?: unknown): string => {
  const searchParams = new URLSearchParams();
  if (appId) {
    searchParams.append('app_id', String(appId));
  }
  const searchParamString = searchParams.size > 0 ? `?${searchParams.toString()}` : '';

  return experience.routes.consent + searchParamString;
};
