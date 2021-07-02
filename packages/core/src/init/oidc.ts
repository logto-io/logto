import crypto from 'crypto';
import Koa from 'koa';
import mount from 'koa-mount';
import { Provider } from 'oidc-provider';
import postgresAdapter from '../oidc/adapter';

import { fromKeyLike } from 'jose/jwk/from_key_like';
import { getEnv } from '../utils';
import { findUserById } from '../queries/user';
import { signInRoute } from '../consts';

export default async function initOidc(app: Koa, port: number): Promise<void> {
  const privateKey = crypto.createPrivateKey(
    Buffer.from(getEnv('OIDC_PROVIDER_PRIVATE_KEY_BASE64'), 'base64')
  );
  const keys = [await fromKeyLike(privateKey)];
  const oidc = new Provider(`http://localhost:${port}/oidc`, {
    adapter: postgresAdapter,
    renderError: (ctx, out, error) => {
      console.log(error);
    },
    cookies: {
      // V2: Rotate this when necessary
      // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys
      keys: ['LOGTOSEKRIT1'],
    },
    jwks: {
      keys,
    },
    clients: [
      {
        client_id: 'foo',
        redirect_uris: ['http://localhost:3000/callback'],
        grant_types: ['authorization_code', 'refresh_token'],
        token_endpoint_auth_method: 'none',
      },
    ],
    features: {
      revocation: { enabled: true },
      introspection: { enabled: true },
      devInteractions: { enabled: false },
    },
    interactions: {
      url: (_, interaction) => `${signInRoute}?uid=${interaction.uid}`,
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
  });
  app.use(mount('/oidc', oidc.app));
}
