/* istanbul ignore file */

import { readFileSync } from 'fs';

import { userClaims } from '@logto/core-kit';
import { CustomClientMetadataKey } from '@logto/schemas';
import { tryThat } from '@logto/shared';
import Provider, { errors } from 'oidc-provider';
import snakecaseKeys from 'snakecase-keys';

import envSet from '#src/env-set/index.js';
import { addOidcEventListeners } from '#src/event-listeners/index.js';
import { createUserLibrary } from '#src/libraries/user.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import postgresAdapter from '#src/oidc/adapter.js';
import { isOriginAllowed, validateCustomClientMetadata } from '#src/oidc/utils.js';
import { routes } from '#src/routes/consts.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { claimToUserKey, getUserClaims } from './scope.js';

// Temporarily removed 'EdDSA' since it's not supported by browser yet
const supportedSigningAlgs = Object.freeze(['RS256', 'PS256', 'ES256', 'ES384', 'ES512'] as const);

export default function initOidc(queries: Queries): Provider {
  const {
    applications: { findApplicationById },
    resources: { findResourceByIndicator },
    users: { findUserById },
  } = queries;
  const {
    issuer,
    cookieKeys,
    privateJwks,
    jwkSigningAlg,
    defaultIdTokenTtl,
    defaultRefreshTokenTtl,
  } = envSet.oidc;
  const { findUserScopesForResourceId } = createUserLibrary(queries);
  const logoutSource = readFileSync('static/html/logout.html', 'utf8');

  const cookieConfig = Object.freeze({
    sameSite: 'lax',
    path: '/',
    signed: true,
  } as const);

  const oidc = new Provider(issuer, {
    adapter: postgresAdapter.bind(null, queries),
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

          const scopes = ctx.oidc.account
            ? await findUserScopesForResourceId(ctx.oidc.account.accountId, resourceServer.id)
            : [];

          const { accessTokenTtl: accessTokenTTL } = resourceServer;

          return {
            accessTokenFormat: 'jwt',
            scope: scopes.map(({ name }) => name).join(' '),
            accessTokenTTL,
            jwt: {
              sign: { alg: jwkSigningAlg },
            },
          };
        },
      },
    },
    interactions: {
      url: (_, interaction) => {
        switch (interaction.prompt.name) {
          case 'login':
            return routes.signIn.credentials;
          case 'consent':
            return routes.signIn.consent;
          default:
            throw new Error(`Prompt not supported: ${interaction.prompt.name}`);
        }
      },
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
                  user[claimToUserKey[claim]],
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
    extraTokenClaims: async (_ctx, token) => {
      if (token.kind === 'AccessToken') {
        const { accountId } = token;
        const { roleNames } = await tryThat(
          findUserById(accountId),
          new errors.InvalidClient(`invalid user ${accountId}`)
        );

        return snakecaseKeys({
          roleNames,
        });
      }

      // `token.kind === 'ClientCredentials'`
      const { clientId } = token;
      assertThat(clientId, 'oidc.invalid_grant');

      const { roleNames } = await tryThat(
        findApplicationById(clientId),
        new errors.InvalidClient(`invalid client ${clientId}`)
      );

      return snakecaseKeys({ roleNames });
    },
  });

  addOidcEventListeners(oidc);

  // Provide audit log context for event listeners
  oidc.use(koaAuditLog(queries));

  return oidc;
}
