/* istanbul ignore file */

import { readFileSync } from 'node:fs';

import { userClaims } from '@logto/core-kit';
import type { I18nKey } from '@logto/phrases';
import { CustomClientMetadataKey, demoAppApplicationId } from '@logto/schemas';
import i18next from 'i18next';
import Provider, { errors, type ResourceServer } from 'oidc-provider';
import snakecaseKeys from 'snakecase-keys';

import type { EnvSet } from '#src/env-set/index.js';
import { addOidcEventListeners } from '#src/event-listeners/index.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaBodyEtag from '#src/middleware/koa-body-etag.js';
import postgresAdapter from '#src/oidc/adapter.js';
import { isOriginAllowed, validateCustomClientMetadata } from '#src/oidc/utils.js';
import { routes } from '#src/routes/consts.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { getUserClaimData, getUserClaims } from './scope.js';
import { OIDCExtraParametersKey, InteractionMode } from './type.js';

// Temporarily removed 'EdDSA' since it's not supported by browser yet
const supportedSigningAlgs = Object.freeze(['RS256', 'PS256', 'ES256', 'ES384', 'ES512'] as const);

export default function initOidc(
  tenantId: string,
  envSet: EnvSet,
  queries: Queries,
  libraries: Libraries
): Provider {
  const {
    issuer,
    cookieKeys,
    privateJwks,
    jwkSigningAlg,
    defaultIdTokenTtl,
    defaultRefreshTokenTtl,
  } = envSet.oidc;
  const {
    resources: { findResourceByIndicator },
    users: { findUserById },
  } = queries;
  const { findUserScopesForResourceIndicator } = libraries.users;
  const { findApplicationScopesForResourceIndicator } = libraries.applications;
  const logoutSource = readFileSync('static/html/logout.html', 'utf8');
  const logoutSuccessSource = readFileSync('static/html/post-logout/index.html', 'utf8');

  const cookieConfig = Object.freeze({
    sameSite: 'lax',
    path: '/',
    signed: true,
  } as const);

  const oidc = new Provider(issuer, {
    adapter: postgresAdapter.bind(null, envSet, queries),
    renderError: (_ctx, _out, error) => {
      console.error(error);

      throw error;
    },
    cookies: {
      keys: cookieKeys,
      long: cookieConfig,
      short: cookieConfig,
    },
    jwks: {
      keys: privateJwks,
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
        defaultResource: () => '',
        // Disable the auto use of authorization_code granted resource feature
        useGrantedResource: () => false,
        getResourceServerInfo: async (ctx, indicator) => {
          const resourceServer = await findResourceByIndicator(indicator);

          if (!resourceServer) {
            throw new errors.InvalidTarget();
          }

          const { accessTokenTtl: accessTokenTTL } = resourceServer;
          const result = {
            accessTokenFormat: 'jwt',
            accessTokenTTL,
            jwt: {
              sign: { alg: jwkSigningAlg },
            },
            scope: '',
          } satisfies ResourceServer;

          const userId = ctx.oidc.session?.accountId;

          if (userId) {
            const scopes = await findUserScopesForResourceIndicator(userId, indicator);

            return {
              ...result,
              scope: scopes.map(({ name }) => name).join(' '),
            };
          }

          const clientId = ctx.oidc.entities.Client?.clientId;

          // Machine to machine app
          if (clientId) {
            const scopes = await findApplicationScopesForResourceIndicator(clientId, indicator);

            return {
              ...result,
              scope: scopes.map(({ name }) => name).join(' '),
            };
          }

          return result;
        },
      },
    },
    interactions: {
      url: (ctx, interaction) => {
        const isDemoApp = interaction.params.client_id === demoAppApplicationId;

        const appendParameters = (path: string) => {
          // `notification` is for showing a text banner on the homepage
          return isDemoApp ? path + `?notification=demo_app.notification&no_cache` : path;
        };

        switch (interaction.prompt.name) {
          case 'login': {
            const isSignUp =
              ctx.oidc.params?.[OIDCExtraParametersKey.InteractionMode] === InteractionMode.signUp;

            return appendParameters(isSignUp ? routes.signUp : routes.signIn.credentials);
          }

          case 'consent': {
            return routes.signIn.consent;
          }

          default: {
            throw new Error(`Prompt not supported: ${interaction.prompt.name}`);
          }
        }
      },
    },
    extraParams: [OIDCExtraParametersKey.InteractionMode],
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
      const user = await findUserById(sub);

      return {
        accountId: sub,
        claims: async (use, scope, claims, rejected) => {
          return snakecaseKeys(
            {
              /**
               * This line is required because:
               * 1. TypeScript will complain since `Object.fromEntries()` has a fixed key type `string`
               * 2. Scope `openid` is removed from `UserScope` enum
               */
              sub,
              ...Object.fromEntries(
                getUserClaims(use, scope, claims, rejected).map((claim) => [
                  claim,
                  getUserClaimData(user, claim),
                ])
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

        return idTokenTtl ?? defaultIdTokenTtl;
      },
      RefreshToken: (_ctx, _token, client) => {
        const { refreshTokenTtl } = client.metadata();

        return refreshTokenTtl ?? defaultRefreshTokenTtl;
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
  });

  addOidcEventListeners(oidc);

  // Provide audit log context for event listeners
  oidc.use(koaAuditLog(queries));
  oidc.use(koaBodyEtag());

  return oidc;
}
