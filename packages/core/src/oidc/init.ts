/* eslint-disable max-lines */
/* istanbul ignore file */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import querystring from 'node:querystring';

import { logtoGoogleOneTapCookieKey } from '@logto/connector-kit';
import { userClaims } from '@logto/core-kit';
import type { I18nKey } from '@logto/phrases';
import {
  customClientMetadataDefault,
  CustomClientMetadataKey,
  extraParamsObjectGuard,
  inSeconds,
  logtoCookieKey,
  ExtraParamsKey,
  type Json,
} from '@logto/schemas';
import { trySafe, tryThat } from '@silverhand/essentials';
import { type i18n } from 'i18next';
import { type KoaContextWithOIDC, Provider, type ResourceServer, errors } from 'oidc-provider';
import getRawBody from 'raw-body';
import snakecaseKeys from 'snakecase-keys';

import { EnvSet } from '#src/env-set/index.js';
import { addOidcEventListeners } from '#src/event-listeners/index.js';
import { type LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import koaAppSecretTranspilation from '#src/middleware/koa-app-secret-transpilation.js';
import koaAuditLog, { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaBodyEtag from '#src/middleware/koa-body-etag.js';
import koaJwksCacheControl from '#src/middleware/koa-jwks-cache-control.js';
import koaOidcCookies from '#src/middleware/koa-oidc-cookies.js';
import koaOidcPostToGet from '#src/middleware/koa-oidc-post-to-get.js';
import koaOidcUnrecognizedRoute from '#src/middleware/koa-oidc-unrecognized-route.js';
import koaResourceParam from '#src/middleware/koa-resource-param.js';
import postgresAdapter from '#src/oidc/adapter.js';
import {
  buildSharedExperienceCookie,
  buildConsentPromptUrl,
  buildLoginPromptUrl,
  isOriginAllowed,
  readOptionalQueryString,
  validateCustomClientMetadata,
} from '#src/oidc/utils.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { i18next } from '#src/utils/i18n.js';

import { type SubscriptionLibrary } from '../libraries/subscription.js';
import koaTokenUsageGuard from '../middleware/koa-token-usage-guard.js';

import {
  appLevelAccessControlMetadataKey,
  assertUserHasApplicationAccessForOidc,
  hasAppLevelAccessControlChecked,
  markAppLevelAccessControlCheckedForOidcContext,
} from './application-access-control.js';
import defaults from './defaults.js';
import { deviceFlowConfig, defaultDeviceCodeTtl } from './device-flow.js';
import {
  getExtraTokenClaimsForJwtCustomization,
  getExtraTokenClaimsForOrganizationApiResource,
  getExtraTokenClaimsForTokenExchange,
} from './extra-token-claims.js';
import { getProviderFetchConfig } from './fetch.js';
import { registerGrants } from './grants/index.js';
import {
  findResource,
  findResourceScopes,
  getSharedResourceServerData,
  isThirdPartyApplication,
  filterResourceScopesForTheThirdPartyApplication,
} from './resource.js';
import { getAcceptedUserClaims, getUserClaimsData } from './scope.js';
import { installWildcardRedirectUriMatching } from './wildcard-redirect-uri.js';

// Temporarily removed 'EdDSA' since it's not supported by browser yet
const supportedSigningAlgs = Object.freeze(['RS256', 'PS256', 'ES256', 'ES384', 'ES512'] as const);

export default function initOidc(
  tenantId: string,
  envSet: EnvSet,
  queries: Queries,
  libraries: Libraries,
  logtoConfigs: LogtoConfigLibrary,
  subscription: SubscriptionLibrary
): Provider {
  const {
    resources: { findDefaultResource },
    users: { findUserById },
    organizations,
  } = queries;
  const logoutSource = readFileSync('static/html/logout.html', 'utf8');
  const logoutSuccessSource = readFileSync('static/html/post-logout/index.html', 'utf8');

  const cookieConfig = Object.freeze({
    sameSite: 'lax',
    path: '/',
    signed: true,
    overwrite: true,
  } as const);

  const getResourceServerInfoCore = async (
    indicator: string,
    clientId: string | undefined,
    userId: string | undefined,
    organizationId: string | undefined
  ): Promise<Pick<ResourceServer, 'accessTokenFormat' | 'jwt' | 'accessTokenTTL' | 'scope'>> => {
    const resourceServer = await findResource(queries, indicator);

    if (!resourceServer) {
      throw new errors.InvalidTarget();
    }

    const { accessTokenTtl: accessTokenTTL } = resourceServer;

    const scopes = await findResourceScopes({
      queries,
      libraries,
      indicator,
      findFromOrganizations: true,
      organizationId,
      applicationId: clientId,
      userId,
    });

    if (clientId && (await isThirdPartyApplication(queries, clientId))) {
      const filteredScopes = await filterResourceScopesForTheThirdPartyApplication(
        libraries,
        clientId,
        indicator,
        scopes
      );

      return {
        ...getSharedResourceServerData(envSet),
        accessTokenTTL,
        scope: filteredScopes.map(({ name }) => name).join(' '),
      };
    }

    return {
      ...getSharedResourceServerData(envSet),
      accessTokenTTL,
      scope: scopes.map(({ name }) => name).join(' '),
    };
  };

  // Do NOT deconstruct variables from `envSet` earlier, since we might reload `envSet` on the fly,
  // and keeping the reference of the `envSet` object helps dynamically update oidc provider configs.
  const oidc = new Provider(envSet.oidc.issuer, {
    adapter: postgresAdapter.bind(null, envSet, queries),
    // Align the error response regardless of the request format. It will be `application/json` by default.
    // Rendering different error response based on the request format is okay, but it brought more trouble
    // since `renderError` will be only called when the request prefers `text/html` format.
    //
    // See https://github.com/panva/node-oidc-provider/blob/37d0a6cfb3c618141a44cbb904ce45659438f821/lib/shared/error_handler.js#L48-L55
    //
    // Since we prefer a more consistent error response, we will handle it in `koaOidcErrorHandler` middleware.
    renderError: (ctx, out, _error) => {
      ctx.body = out;
    },
    cookies: {
      keys: envSet.oidc.cookieKeys,
      long: cookieConfig,
      short: cookieConfig,
    },
    jwks: {
      keys: envSet.oidc.privateJwks,
    },
    enabledJWA: {
      authorizationSigningAlgValues: [...supportedSigningAlgs],
      userinfoSigningAlgValues: [...supportedSigningAlgs],
      idTokenSigningAlgValues: [...supportedSigningAlgs],
      introspectionSigningAlgValues: [...supportedSigningAlgs],
    },
    conformIdTokenClaims: false,
    ...getProviderFetchConfig(),
    features: {
      userinfo: { enabled: true },
      revocation: { enabled: true },
      introspection: { enabled: true },
      devInteractions: { enabled: false },
      clientCredentials: { enabled: true },
      /**
       * The upstream enables DPoP by default since v9. Keep it off to preserve the behavior of
       * the previous oidc-provider version until Logto officially supports DPoP.
       */
      dPoP: { enabled: false },
      backchannelLogout: { enabled: true },
      deviceFlow: deviceFlowConfig,
      rpInitiatedLogout: {
        logoutSource: (ctx, form) => {
          // eslint-disable-next-line no-template-curly-in-string
          ctx.body = logoutSource.replace('${form}', form);
        },
        postLogoutSuccessSource(ctx) {
          // eslint-disable-next-line no-restricted-syntax -- detect if i18n is available in the context @see {koaI18next middleware}
          const i18n = 'i18n' in ctx ? (ctx.i18n as i18n) : i18next;

          ctx.body = logoutSuccessSource.replace(
            // eslint-disable-next-line no-template-curly-in-string
            '${message}',
            i18n.t<string, I18nKey>('oidc.logout_success')
          );
        },
      },
      // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#featuresresourceindicators
      resourceIndicators: {
        enabled: true,
        defaultResource: async () => {
          const resource = await findDefaultResource();
          // The default implementation returns `undefined` - https://github.com/panva/node-oidc-provider/blob/0c52469f08b0a4a1854d90a96546a3f7aa090e5e/lib/helpers/defaults.js#L195
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return resource?.indicator ?? undefined!;
        },
        // Disable the auto use of authorization_code granted resource feature
        useGrantedResource: () => false,
        getResourceServerInfo: async (ctx, indicator) => {
          const { client, params, session, entities } = ctx.oidc;
          const userId = session?.accountId ?? entities.Account?.accountId;
          const organizationId =
            typeof params?.organization_id === 'string' ? params.organization_id : undefined;

          return getResourceServerInfoCore(indicator, client?.clientId, userId, organizationId);
        },
      },
    },
    issueRefreshToken: (_, client, code) => {
      if (!client.grantTypeAllowed('refresh_token')) {
        return false;
      }

      return (
        code.scopes.has('offline_access') ||
        (client.applicationType === 'web' && Boolean(client.metadata().alwaysIssueRefreshToken))
      );
    },
    interactions: {
      url: (ctx, { params: { client_id: appId }, prompt }) => {
        const params = trySafe(() => extraParamsObjectGuard.parse(ctx.oidc.params ?? {})) ?? {};
        const sharedParams = {
          appId: readOptionalQueryString(appId),
          organizationId: params.organization_id,
          uiLocales: params.ui_locales,
        };

        // Cookies are required to apply the correct server-side rendering
        ctx.cookies.set(logtoCookieKey, JSON.stringify(buildSharedExperienceCookie(sharedParams)), {
          sameSite: 'lax',
          overwrite: true,
          httpOnly: false,
        });

        if (params[ExtraParamsKey.GoogleOneTapCredential]) {
          ctx.cookies.set(
            logtoGoogleOneTapCookieKey,
            params[ExtraParamsKey.GoogleOneTapCredential],
            {
              sameSite: 'lax',
              overwrite: true,
              httpOnly: false,
              maxAge: 10 * 1000, // 10s
            }
          );
        }

        switch (prompt.name) {
          case 'login': {
            return '/' + buildLoginPromptUrl(params, sharedParams);
          }

          case 'consent': {
            return '/' + buildConsentPromptUrl(appId);
          }

          default: {
            throw new Error(`Prompt not supported: ${prompt.name}`);
          }
        }
      },
    },
    loadExistingGrant: async (ctx) => {
      const { account, client, provider, result, session } = ctx.oidc;
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Keep oidc-provider's default loadExistingGrant fallback semantics.
      const grantId = result?.consent?.grantId || (client && session?.grantIdFor(client.clientId));
      const shouldCheckApplicationAccess =
        account &&
        client &&
        !hasAppLevelAccessControlChecked(result, client.clientId, account.accountId);

      if (grantId && shouldCheckApplicationAccess) {
        await assertUserHasApplicationAccessForOidc(
          libraries.applicationAccessControl,
          client.clientId,
          account.accountId,
          client.metadata().appLevelAccessControlEnabled
        );
        markAppLevelAccessControlCheckedForOidcContext(
          ctx.oidc,
          client.clientId,
          account.accountId
        );
      }

      if (grantId) {
        return provider.Grant.find(String(grantId));
      }
    },
    extraParams: Object.values(ExtraParamsKey),
    extraTokenClaims: async (ctx, token) => {
      const [tokenExchangeClaims, organizationApiResourceClaims, jwtCustomizedClaims] =
        await Promise.all([
          getExtraTokenClaimsForTokenExchange(ctx, token),
          getExtraTokenClaimsForOrganizationApiResource(ctx, token),
          getExtraTokenClaimsForJwtCustomization(
            // eslint-disable-next-line no-restricted-syntax -- see `oidc.use(koaAuditLog(queries))` below;
            ctx as KoaContextWithOIDC & WithLogContext,
            token,
            {
              envSet,
              queries,
              libraries,
              logtoConfigs,
            }
          ),
        ]);

      if (!organizationApiResourceClaims && !jwtCustomizedClaims && !tokenExchangeClaims) {
        return;
      }

      return {
        ...tokenExchangeClaims,
        ...organizationApiResourceClaims,
        ...jwtCustomizedClaims,
      };
    },
    extraClientMetadata: {
      properties: [...Object.values(CustomClientMetadataKey), appLevelAccessControlMetadataKey],
      validator: (_, key, value) => {
        if (key === appLevelAccessControlMetadataKey) {
          if (value === undefined) {
            return;
          }

          if (typeof value !== 'boolean') {
            throw new errors.InvalidClientMetadata(appLevelAccessControlMetadataKey);
          }

          return;
        }

        validateCustomClientMetadata(key, value);
      },
    },
    // https://github.com/panva/node-oidc-provider/blob/main/recipes/client_based_origins.md
    /**
     * Use `ctx.URL.origin` (`protocol://host`) instead of `ctx.request.origin` — in Koa 3 the
     * latter returns the request's `Origin` header, which would degenerate this check into
     * allow-all. `ctx.URL.origin` behaves identically on both Koa majors.
     */
    clientBasedCORS: (ctx, origin, client) =>
      ctx.URL.origin === origin || isOriginAllowed(origin, client.metadata(), client.redirectUris),
    // https://github.com/panva/node-oidc-provider/blob/main/recipes/claim_configuration.md
    // Note node-provider will append `claims` here to the default claims instead of overriding
    claims: userClaims,
    // https://github.com/panva/node-oidc-provider/tree/main/docs#findaccount
    findAccount: async (_ctx, sub) => {
      // The user may be deleted after the token is issued
      const user = await tryThat(findUserById(sub), () => {
        throw new errors.InvalidGrant('user not found');
      });

      return {
        accountId: sub,
        /**
         * The third argument `_claims` is not used since
         * [Claims Parameter](https://github.com/panva/node-oidc-provider/tree/main/docs#featuresclaimsparameter)
         * is not enabled.
         */
        claims: async (use, scope, _claims, rejected) => {
          assert(
            use === 'id_token' || use === 'userinfo',
            'use should be either `id_token` or `userinfo`'
          );

          // Get the ID token config to determine which extended claims are enabled
          const idTokenConfig =
            use === 'id_token' ? await queries.logtoConfigs.getIdTokenConfig() : undefined;

          const acceptedClaims = getAcceptedUserClaims({
            use,
            scope,
            rejected,
            enabledExtendedIdTokenClaims: idTokenConfig?.enabledExtendedClaims,
          });

          return snakecaseKeys(
            {
              /**
               * The manual `sub` assignment is required because:
               * 1. TypeScript will complain since `Object.fromEntries()` has a fixed key type `string`
               * 2. Scope `openid` is removed from `UserScope` enum
               */
              sub,
              ...Object.fromEntries(
                await getUserClaimsData(user, acceptedClaims, libraries.users, organizations)
              ),
            },
            {
              deep: false,
            }
          );
        },
      };
    },
    ttl: {
      /**
       * [OIDC Provider Default Settings](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#ttl)
       */
      IdToken: (_ctx, _token, client) => {
        const { idTokenTtl } = client.metadata();

        return idTokenTtl ?? customClientMetadataDefault.idTokenTtl;
      },
      RefreshToken: (ctx, token, client) => {
        const defaultTtl = defaults.refreshTokenTtl(ctx, token, client);

        if (defaultTtl !== undefined) {
          return defaultTtl;
        }

        /** Customized logic for Refresh Token TTL */
        const { refreshTokenTtlInDays, refreshTokenTtl } = client.metadata();

        if (refreshTokenTtlInDays !== undefined) {
          return refreshTokenTtlInDays * inSeconds.oneDay;
        }

        return (
          refreshTokenTtl ?? customClientMetadataDefault.refreshTokenTtlInDays * inSeconds.oneDay
        );
      },
      AccessToken: (ctx, token) => {
        if (token.resourceServer) {
          return token.resourceServer.accessTokenTTL ?? 60 * 60; // 1 hour in seconds
        }

        return 60 * 60; // 1 hour in seconds
      },
      DeviceCode: defaultDeviceCodeTtl,
      Interaction: 3600 /* 1 hour in seconds */,
      Session: envSet.oidc.sessionTtl ?? defaults.sessionTtl /* 14 days in seconds */,
      // Set this to the longest allowed duration of the refresh token
      Grant: 180 * 3600 * 24 /* 180 days in seconds */,
    },
    rotateRefreshToken: (ctx) => {
      const { Client: client } = ctx.oidc.entities;

      // Directly return false only when `rotateRefreshToken` has been explicitly set to `false`.
      if (
        !(client?.metadata().rotateRefreshToken ?? customClientMetadataDefault.rotateRefreshToken)
      ) {
        return false;
      }

      return defaults.rotateRefreshToken(ctx);
    },
    pkce: {
      required: (ctx, client) => {
        return client.clientAuthMethod !== 'client_secret_basic';
      },
    },
  });

  installWildcardRedirectUriMatching(oidc);
  addOidcEventListeners(tenantId, oidc, queries, libraries.hooks.triggerEvent);
  registerGrants(oidc, envSet, queries, libraries);

  // Register first so all downstream cookie operations go through the rebound instance
  oidc.use(koaOidcCookies(oidc));

  // Provide audit log context for event listeners
  oidc.use(koaAuditLog(queries));
  /**
   * `oidc-provider` [strictly checks](https://github.com/panva/node-oidc-provider/blob/6a0bcbcd35ed3e6179e81f0ab97a45f5e4e58f48/lib/shared/selective_body.js#L11)
   * the `content-type` header for further processing.
   *
   * It will [directly use the `ctx.req.body` or `ctx.request.body` for parsing](https://github.com/panva/node-oidc-provider/blob/6a0bcbcd35ed3e6179e81f0ab97a45f5e4e58f48/lib/shared/selective_body.js#L39)
   * so there's no need to change the raw request body if we parse the JSON here.
   *
   * However, this is not recommended for other routes rather since it causes a header-body format mismatch.
   */
  oidc.use(async (ctx, next) => {
    const jsonContentType = 'application/json';
    const formUrlEncodedContentType = 'application/x-www-form-urlencoded';
    const nullByte = String.fromCodePoint(0);

    // Replicate the behavior of `oidc-provider` for parsing the request body
    if (ctx.req.readable) {
      const charset = ctx.headers['content-type']
        ?.split(';')
        .map((part) => part.trim().split('='))
        .find(([key]) => key?.trim() === 'charset')?.[1];

      const body = await getRawBody(ctx.req, {
        length: ctx.request.length,
        limit: '56kb',
        encoding: charset ?? 'utf8',
      });

      // Reject null bytes: they are invalid in request bodies and, once parsed, a value can reach
      // the `jsonb` audit log column, which PostgreSQL rejects (error `22P05`) and surfaces as a 500
      // instead of a clean client error. `InvalidRequest` is rendered as a 400 by `koaOidcErrorHandler`.
      if (body.includes(nullByte)) {
        throw new errors.InvalidRequest('null bytes are not allowed in the request body');
      }

      // WARNING: [Registration actions](https://github.com/panva/node-oidc-provider/blob/6a0bcbcd35ed3e6179e81f0ab97a45f5e4e58f48/lib/actions/registration.js#L4) are using
      // 'application/json' for body parsing. Update relatively when we enable that feature.
      if (ctx.is(jsonContentType)) {
        ctx.headers['content-type'] = formUrlEncodedContentType;
        // eslint-disable-next-line no-restricted-syntax
        ctx.request.body = trySafe(() => JSON.parse(body) as Json);
      } else if (ctx.is(formUrlEncodedContentType)) {
        /**
         * `querystring.parse()` only produces string/string[] values at runtime — its
         * `ParsedUrlQuery` return type marks values as possibly `undefined` merely by the
         * index-signature convention. Narrow that away so the JSON-typed `Request.body`
         * (from koa-body) accepts the assignment.
         */
        // eslint-disable-next-line no-restricted-syntax
        ctx.request.body = querystring.parse(body) as Record<string, string | string[]>;
      }
    }

    return next();
  });

  /**
   * Register before `koaOidcPostToGet()` so it observes the restored POST method and keeps
   * ETag/304 semantics off forwarded POST requests — they only apply to real GET requests.
   */
  oidc.use(koaBodyEtag());
  oidc.use(koaOidcPostToGet());
  /**
   * Check if the request URL contains comma separated `resource` query parameter. If yes, split the values and
   * reconstruct the URL with multiple `resource` query parameters.
   * E.g. `?resource=foo,bar` => `?resource=foo&resource=bar`
   */
  oidc.use(koaResourceParam());

  oidc.use(koaAppSecretTranspilation(queries));
  oidc.use(koaJwksCacheControl());

  if (EnvSet.values.isCloud) {
    oidc.use(koaTokenUsageGuard(subscription));
  }

  // Register last so it splices directly around the provider's internal router
  oidc.use(koaOidcUnrecognizedRoute());

  return oidc;
}
/* eslint-enable max-lines */
