import path from 'node:path';

import { GoogleConnector } from '@logto/connector-kit';
import type {
  CustomClientMetadata,
  ExtraParamsObject,
  LogtoUiCookie,
  OidcClientMetadata,
} from '@logto/schemas';
import {
  ApplicationType,
  customClientMetadataGuard,
  GrantType,
  ExtraParamsKey,
  FirstScreen,
  experience,
} from '@logto/schemas';
import { condArray, conditional, removeUndefinedKeys, trySafe } from '@silverhand/essentials';
import { type AllClientMetadata, type ClientAuthMethod, errors } from 'oidc-provider';

import type { EnvSet } from '#src/env-set/index.js';

/**
 * Build constant client metadata for an application based on its type and optional flags.
 *
 * Grant types are dynamically computed: base grant types are determined by application type,
 * and optional grant types (e.g., token exchange) are conditionally included based on the
 * provided options.
 *
 * The oidc-provider will enforce `client.grantTypeAllowed(type)` before invoking any grant handler,
 * so there's no need for additional runtime access checks in individual grant handlers.
 */
export const getConstantClientMetadata = (
  envSet: EnvSet,
  type: ApplicationType,
  options?: Pick<CustomClientMetadata, 'allowTokenExchange' | 'isDeviceFlow'>
): AllClientMetadata => {
  const { jwkSigningAlg } = envSet.oidc;

  const optionalGrantTypes = condArray(options?.allowTokenExchange && GrantType.TokenExchange);

  const applicationType: AllClientMetadata['application_type'] =
    type === ApplicationType.Native ? 'native' : 'web';

  /**
   * Native and SPA clients are public clients, so they do not authenticate at the token endpoint.
   * Traditional web apps and M2M apps are confidential clients and use client secret based auth.
   */
  const tokenEndpointAuthMethod: ClientAuthMethod =
    type === ApplicationType.Native || type === ApplicationType.SPA
      ? 'none'
      : 'client_secret_basic';

  const constantMetadata = {
    application_type: applicationType,
    token_endpoint_auth_method: tokenEndpointAuthMethod,
    // https://www.scottbrady91.com/jose/jwts-which-signing-algorithm-should-i-use
    authorization_signed_response_alg: jwkSigningAlg,
    userinfo_signed_response_alg: jwkSigningAlg,
    id_token_signed_response_alg: jwkSigningAlg,
    introspection_signed_response_alg: jwkSigningAlg,
  };

  /**
   * Device flow is a native-app-only variant. It skips authorization code
   * response handling and only allows device_code + refresh_token grants.
   *
   * `response_types` is set to an empty array on purpose to override oidc-provider's default
   * value, because device authorization does not use the `/authorize` response contract.
   */
  if (type === ApplicationType.Native && options?.isDeviceFlow) {
    return {
      ...constantMetadata,
      grant_types: [GrantType.DeviceCode, GrantType.RefreshToken, ...optionalGrantTypes],
      response_types: [],
    };
  }

  /**
   * M2M clients can only use client credentials and never participate in front-channel auth flows.
   *
   * As with device flow, we must override the default response type. Otherwise the
   * client would be treated as an authorization client and be forced to provide redirect URIs.
   */
  if (type === ApplicationType.MachineToMachine) {
    return {
      ...constantMetadata,
      grant_types: [GrantType.ClientCredentials, ...optionalGrantTypes],
      response_types: [],
    };
  }

  // Interactive applications intentionally inherit oidc-provider's default `response_types`.
  return {
    ...constantMetadata,
    grant_types: [GrantType.AuthorizationCode, GrantType.RefreshToken, ...optionalGrantTypes],
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

const escapeRegExp = (value: string) => value.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');

const matchHostnameLabel = (pattern: string, actual: string) => {
  if (!pattern.includes('*')) {
    return pattern === actual;
  }

  const regex = new RegExp(
    `^${pattern
      .split('*')
      .map((part) => escapeRegExp(part))
      .join('[^.]+')}$`,
    'i'
  );
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
  const authority = rest.split(/[#/?]/)[0] ?? '';
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

export type SharedExperienceParams = Readonly<{
  appId?: string;
  organizationId?: string;
  uiLocales?: string;
}>;

/**
 * Read a single query value as a non-empty string or `undefined`. Safely ignores
 * arrays (repeated query keys) and empty strings so callers never see a 500 from
 * an object-level parser when a query key is duplicated.
 */
export const readOptionalQueryString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

export const parseSharedExperienceParams = (
  source: Record<string, unknown>
): SharedExperienceParams =>
  removeUndefinedKeys({
    appId: readOptionalQueryString(source.app_id),
    organizationId: readOptionalQueryString(source.organization_id),
    uiLocales: readOptionalQueryString(source.ui_locales),
  });

/**
 * Only a small subset of Experience parameters is shared across multiple page families such as
 * login and device flow: app, organization, and locale. Keep this helper intentionally narrow so
 * login-only parameters like `identifier`, `login_hint`, or `one_time_token` stay colocated with
 * the login prompt builder instead of being silently inherited by unrelated pages.
 */
export const appendSharedExperienceSearchParams = (
  searchParams: URLSearchParams,
  { appId, organizationId, uiLocales }: SharedExperienceParams
) => {
  if (appId) {
    searchParams.append('app_id', appId);
  }

  if (organizationId) {
    searchParams.append(ExtraParamsKey.OrganizationId, organizationId);
  }

  if (uiLocales) {
    searchParams.append(ExtraParamsKey.UiLocales, uiLocales);
  }
};

/**
 * The Experience SSR middleware reads `_logto` before the client bootstraps. Reusing the same
 * cookie payload for the shared app / organization / locale params keeps device pages aligned
 * with login pages without broadening the cookie to route-specific prompt parameters.
 */
export const buildSharedExperienceCookie = ({
  appId,
  organizationId,
  uiLocales,
}: SharedExperienceParams): LogtoUiCookie =>
  removeUndefinedKeys({
    appId,
    organizationId,
    uiLocales,
  });

// eslint-disable-next-line complexity
export const buildLoginPromptUrl = (
  params: ExtraParamsObject,
  sharedParams?: SharedExperienceParams
): string => {
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

  if (sharedParams) {
    appendSharedExperienceSearchParams(searchParams, sharedParams);
  }

  appendExtraParam(ExtraParamsKey.OneTimeToken);
  appendExtraParam(ExtraParamsKey.LoginHint);
  appendExtraParam(ExtraParamsKey.Identifier);
  appendExtraParam(ExtraParamsKey.UiLocales);
  appendExtraParam(ExtraParamsKey.BackUrl);
  appendExtraParam(ExtraParamsKey.Theme);

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
