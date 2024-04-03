/* eslint-disable max-lines */
/* istanbul ignore file */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

import { userClaims } from '@logto/core-kit';
import type { I18nKey } from '@logto/phrases';
import {
  customClientMetadataDefault,
  CustomClientMetadataKey,
  experience,
  extraParamsObjectGuard,
  inSeconds,
  logtoCookieKey,
  type LogtoUiCookie,
  LogtoJwtTokenKey,
  ExtraParamsKey,
  type Json,
  jwtCustomizer as jwtCustomizerLog,
  LogResult,
  LogtoJwtTokenKeyType,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe, tryThat } from '@silverhand/essentials';
import i18next from 'i18next';
import koaBody from 'koa-body';
import Provider, { errors } from 'oidc-provider';
import snakecaseKeys from 'snakecase-keys';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { addOidcEventListeners } from '#src/event-listeners/index.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import { type LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import koaAuditLog, { LogEntry } from '#src/middleware/koa-audit-log.js';
import koaBodyEtag from '#src/middleware/koa-body-etag.js';
import postgresAdapter from '#src/oidc/adapter.js';
import {
  buildLoginPromptUrl,
  isOriginAllowed,
  validateCustomClientMetadata,
} from '#src/oidc/utils.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import defaults from './defaults.js';
import { registerGrants } from './grants/index.js';
import {
  findResource,
  findResourceScopes,
  getSharedResourceServerData,
  isThirdPartyApplication,
  filterResourceScopesForTheThirdPartyApplication,
} from './resource.js';
import { getAcceptedUserClaims, getUserClaimsData } from './scope.js';

// Temporarily removed 'EdDSA' since it's not supported by browser yet
const supportedSigningAlgs = Object.freeze(['RS256', 'PS256', 'ES256', 'ES384', 'ES512'] as const);

export default function initOidc(
  envSet: EnvSet,
  queries: Queries,
  libraries: Libraries,
  logtoConfigs: LogtoConfigLibrary,
  cloudConnection: CloudConnectionLibrary
): Provider {
  const {
    resources: { findDefaultResource },
    users: { findUserById },
    organizations,
    logs: { insertLog },
  } = queries;
  const logoutSource = readFileSync('static/html/logout.html', 'utf8');
  const logoutSuccessSource = readFileSync('static/html/post-logout/index.html', 'utf8');

  const cookieConfig = Object.freeze({
    sameSite: 'lax',
    path: '/',
    signed: true,
  } as const);

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
    features: {
      userinfo: { enabled: true },
      revocation: { enabled: true },
      introspection: { enabled: true },
      devInteractions: { enabled: false },
      clientCredentials: { enabled: true },
      rpInitiatedLogout: {
        logoutSource: (ctx, form) => {
          // eslint-disable-next-line no-template-curly-in-string
          ctx.body = logoutSource.replace('${form}', form);
        },
        postLogoutSuccessSource(ctx) {
          ctx.body = logoutSuccessSource.replace(
            // eslint-disable-next-line no-template-curly-in-string
            '${message}',
            i18next.t<string, I18nKey>('oidc.logout_success')
          );
        },
      },
      // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#featuresresourceindicators
      resourceIndicators: {
        enabled: true,
        defaultResource: async () => {
          const resource = await findDefaultResource();
          return resource?.indicator ?? '';
        },
        // Disable the auto use of authorization_code granted resource feature
        useGrantedResource: () => false,
        getResourceServerInfo: async (ctx, indicator) => {
          const resourceServer = await findResource(queries, indicator);

          if (!resourceServer) {
            throw new errors.InvalidTarget();
          }

          const { accessTokenTtl: accessTokenTTL } = resourceServer;

          const scopes = await findResourceScopes(queries, libraries, ctx, indicator);
          const { client } = ctx.oidc;

          // Need to filter out the unsupported scopes for the third-party application.
          if (client && (await isThirdPartyApplication(queries, client.clientId))) {
            const filteredScopes = await filterResourceScopesForTheThirdPartyApplication(
              libraries,
              client.clientId,
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
        ctx.cookies.set(
          logtoCookieKey,
          JSON.stringify({
            appId: conditional(Boolean(appId) && String(appId)),
          } satisfies LogtoUiCookie),
          { sameSite: 'lax', overwrite: true, httpOnly: false }
        );

        const params = trySafe(() => extraParamsObjectGuard.parse(ctx.oidc.params ?? {})) ?? {};

        switch (prompt.name) {
          case 'login': {
            return '/' + buildLoginPromptUrl(params, appId);
          }

          case 'consent': {
            return '/' + experience.routes.consent;
          }

          default: {
            throw new Error(`Prompt not supported: ${prompt.name}`);
          }
        }
      },
    },
    extraParams: Object.values(ExtraParamsKey),
    // eslint-disable-next-line complexity
    extraTokenClaims: async (ctx, token) => {
      const { isDevFeaturesEnabled, isCloud } = EnvSet.values;

      // No cloud connection for OSS version, skip.
      if (!isDevFeaturesEnabled || !isCloud) {
        return;
      }

      const isTokenClientCredentials = token instanceof ctx.oidc.provider.ClientCredentials;

      try {
        /**
         * It is by design to use `trySafe` here to catch the error but not log it since we do not
         * want to insert an error log every time the OIDC provider issues a token when the JWT
         * customizer is not configured.
         */
        const { script, environmentVariables } =
          (await trySafe(
            logtoConfigs.getJwtCustomizer(
              isTokenClientCredentials
                ? LogtoJwtTokenKey.ClientCredentials
                : LogtoJwtTokenKey.AccessToken
            )
          )) ?? {};

        if (!script) {
          return;
        }

        const pickedFields = isTokenClientCredentials
          ? ctx.oidc.provider.ClientCredentials.IN_PAYLOAD
          : ctx.oidc.provider.AccessToken.IN_PAYLOAD;
        const readOnlyToken = Object.fromEntries(
          pickedFields
            .filter((field) => Reflect.get(token, field) !== undefined)
            .map((field) => [field, Reflect.get(token, field)])
        );

        const client = await cloudConnection.getClient();

        const commonPayload = {
          script,
          environmentVariables,
          token: readOnlyToken,
        };

        // We pass context to the cloud API only when it is a user's access token.
        const logtoUserInfo = conditional(
          !isTokenClientCredentials &&
            token.accountId &&
            (await libraries.jwtCustomizers.getUserContext(token.accountId))
        );

        // `context` parameter is only eligible for user's access token for now.
        return await client.post(`/api/services/custom-jwt`, {
          body: isTokenClientCredentials
            ? {
                ...commonPayload,
                tokenType: LogtoJwtTokenKeyType.ClientCredentials,
              }
            : {
                ...commonPayload,
                tokenType: LogtoJwtTokenKeyType.AccessToken,
                // TODO (LOG-8555): the newly added `UserProfile` type includes undefined fields and can not be directly assigned to `Json` type. And the `undefined` fields should be removed by zod guard.
                // eslint-disable-next-line no-restricted-syntax
                context: { user: logtoUserInfo as Record<string, Json> },
              },
        });
      } catch (error: unknown) {
        const entry = new LogEntry(
          `${jwtCustomizerLog.prefix}.${
            isTokenClientCredentials
              ? jwtCustomizerLog.Type.ClientCredentials
              : jwtCustomizerLog.Type.AccessToken
          }`
        );
        entry.append({
          result: LogResult.Error,
          error: { message: String(error) },
        });
        const { payload } = entry;
        await insertLog({
          id: generateStandardId(),
          key: payload.key,
          payload: {
            ...payload,
            tenantId: envSet.tenantId,
            token,
          },
        });
      }
    },
    extraClientMetadata: {
      properties: Object.values(CustomClientMetadataKey),
      validator: (_, key, value) => {
        validateCustomClientMetadata(key, value);
      },
    },
    // https://github.com/panva/node-oidc-provider/blob/main/recipes/client_based_origins.md
    clientBasedCORS: (ctx, origin, client) =>
      ctx.request.origin === origin ||
      isOriginAllowed(origin, client.metadata(), client.redirectUris),
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
        claims: async (use, scope, claims, rejected) => {
          assert(
            use === 'id_token' || use === 'userinfo',
            'use should be either `id_token` or `userinfo`'
          );
          const acceptedClaims = getAcceptedUserClaims(use, scope, claims, rejected);

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
      Interaction: 3600 /* 1 hour in seconds */,
      Session: 1_209_600 /* 14 days in seconds */,
      Grant: 1_209_600 /* 14 days in seconds */,
    },
    rotateRefreshToken: (ctx) => {
      const { Client: client } = ctx.oidc.entities;

      // Directly return false only when `rotateRefreshToken` has been explicitly set to `false`.
      if (
        !(client?.metadata()?.rotateRefreshToken ?? customClientMetadataDefault.rotateRefreshToken)
      ) {
        return false;
      }

      return defaults.rotateRefreshToken(ctx);
    },
    pkce: {
      required: (ctx, client) => {
        return client.clientAuthMethod !== 'client_secret_basic';
      },
      methods: ['S256'],
    },
  });

  addOidcEventListeners(oidc, queries);
  registerGrants(oidc, envSet, queries);

  // Provide audit log context for event listeners
  oidc.use(koaAuditLog(queries));
  /**
   * Create a middleware function that transpile requests with content type `application/json`
   * since `oidc-provider` only accepts `application/x-www-form-urlencoded` for most of routes.
   *
   * Other parsers are explicitly disabled to keep it neat.
   */
  oidc.use(async (ctx, next) => {
    // `koa-body` will throw `SyntaxError` if the request body is not a valid JSON
    // By default any untracked server error will throw a `500` internal error. Instead of throwing 500 error
    // we should throw a `400` RequestError for all the invalid request body input.

    try {
      await koaBody({ urlencoded: false, text: false })(ctx, next);
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        throw new RequestError({ code: 'guard.invalid_input', type: 'body' }, error);
      }

      throw error;
    }
  });
  /**
   * `oidc-provider` [strictly checks](https://github.com/panva/node-oidc-provider/blob/6a0bcbcd35ed3e6179e81f0ab97a45f5e4e58f48/lib/shared/selective_body.js#L11)
   * the `content-type` header for further processing.
   *
   * It will [directly use the `ctx.req.body` for parsing](https://github.com/panva/node-oidc-provider/blob/6a0bcbcd35ed3e6179e81f0ab97a45f5e4e58f48/lib/shared/selective_body.js#L39)
   * so there's no need to change the raw request body as we uses `koaBody()` above.
   *
   * However, this is not recommended for other routes rather since it causes a header-body format mismatch.
   */
  oidc.use(async (ctx, next) => {
    // WARNING: [Registration actions](https://github.com/panva/node-oidc-provider/blob/6a0bcbcd35ed3e6179e81f0ab97a45f5e4e58f48/lib/actions/registration.js#L4) are using
    // 'application/json' for body parsing. Update relatively when we enable that feature.
    if (ctx.headers['content-type'] === 'application/json') {
      ctx.headers['content-type'] = 'application/x-www-form-urlencoded';
    }
    return next();
  });
  oidc.use(koaBodyEtag());

  return oidc;
}
/* eslint-enable max-lines */
