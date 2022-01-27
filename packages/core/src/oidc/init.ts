import { customClientMetadataGuard, CustomClientMetadataType } from '@logto/schemas';
import { fromKeyLike } from 'jose/jwk/from_key_like';
import Koa from 'koa';
import mount from 'koa-mount';
import { Provider, errors } from 'oidc-provider';

import postgresAdapter from '@/oidc/adapter';
import { findResourceByIdentifier } from '@/queries/resource';
import { findAllScopesWithResourceId } from '@/queries/scope';
import { findUserById } from '@/queries/user';
import { routes } from '@/routes/consts';

import { issuer, privateKey, defaultIdTokenTtl, defaultRefreshTokenTtl } from './consts';

export default async function initOidc(app: Koa): Promise<Provider> {
  const keys = [await fromKeyLike(privateKey)];
  const cookieConfig = Object.freeze({
    sameSite: 'lax',
    path: '/',
    signed: true,
  } as const);
  const oidc = new Provider(issuer, {
    adapter: postgresAdapter,
    renderError: (ctx, out, error) => {
      console.log('OIDC error', error);
      throw error;
    },
    cookies: {
      // V2: Rotate this when necessary
      // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys
      keys: ['LOGTOSEKRIT1'],
      long: cookieConfig,
      short: cookieConfig,
    },
    jwks: {
      keys,
    },
    features: {
      userinfo: { enabled: true },
      revocation: { enabled: true },
      introspection: { enabled: true },
      devInteractions: { enabled: false },
      resourceIndicators: {
        enabled: true,
        // Disable the auto use of authorization_code granted resource feature
        // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#usegrantedresource
        useGrantedResource: () => false,
        getResourceServerInfo: async (ctx, indicator) => {
          const resourceServer = await findResourceByIdentifier(indicator);

          if (!resourceServer) {
            throw new errors.InvalidTarget();
          }

          const { id, accessTokenTtl: accessTokenTTL } = resourceServer;
          const scopes = await findAllScopesWithResourceId(id);
          const scope = scopes.map(({ name }) => name).join(' ');

          return {
            scope,
            accessTokenTTL,
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
      properties: Object.keys(CustomClientMetadataType),
      validator: (_ctx, key, value) => {
        const result = customClientMetadataGuard.pick({ [key]: true }).safeParse({ key: value });

        if (!result.success) {
          throw new errors.InvalidClientMetadata(key);
        }
      },
    },
    clientBasedCORS: (_, origin) => {
      console.log('origin', origin);

      return origin.startsWith('http://localhost:3000');
    },
    findAccount: async (ctx, sub) => {
      await findUserById(sub);

      return {
        accountId: sub,
        claims: async (use, scope, claims, rejected) => {
          console.log('use:', use);
          console.log('scope:', scope);
          console.log('claims:', claims);
          console.log('rejected:', rejected);

          return { sub };
        },
      };
    },
    ttl: {
      /**
       * [OIDC Provider Default Settings](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#ttl)
       */
      IdToken: (ctx, token, client) => {
        const { idTokenTtl } = client.metadata();

        return idTokenTtl ?? defaultIdTokenTtl;
      },
      RefreshToken: (ctx, token, client) => {
        const { refreshTokenTtl } = client.metadata();

        return refreshTokenTtl ?? defaultRefreshTokenTtl;
      },
    },
  });
  app.use(mount('/oidc', oidc.app));

  return oidc;
}
