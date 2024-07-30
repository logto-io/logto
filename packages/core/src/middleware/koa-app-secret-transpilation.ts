import type { Nullable } from '@silverhand/essentials';
import type { Context, MiddlewareType } from 'koa';
import { errors } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';

const noVSCHAR = /[^\u0020-\u007E]/;

function decodeAuthToken(token: string) {
  const authToken = decodeURIComponent(token.replaceAll('+', '%20'));
  if (noVSCHAR.test(authToken)) {
    return;
  }
  return authToken;
}

export type WithAppSecretContext<ContextT = Context> = ContextT & {
  /** The application secret that has been transpiled during the middleware execution. */
  appSecret?: {
    /** The application secret name of the application (client). */
    name: string;
  };
};

/** @import { getConstantClientMetadata } from '#src/oidc/utils.js'; */
/**
 * Create a middleware function that reads the app secret from the request and check if it matches
 * the app secret in the `application_secrets` table. If it matches, the secret will be transpiled
 * to the one in the `applications` table in order to be recognized by `oidc-provider`.
 *
 * If the app secret is not found in the `application_secrets` table, the middleware will keep
 * everything as is and let the `oidc-provider` handle it.
 *
 * @remarks
 * We have to transpile the app secret because the `oidc-provider` only accepts one secret per
 * client.
 *
 * @remarks
 * The way to read the app secret from the request is duplicated from the original `oidc-provider`
 * implementation as the client should not be aware of this process. If we change the way to
 * authenticate the client in the future, we should update this middleware accordingly.
 *
 * @see {@link getConstantClientMetadata} for client authentication method based on application
 * type.
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v8.4.6/lib/shared/token_auth.js#L74 | oidc-provider} for
 * the original implementation.
 */
export default function koaAppSecretTranspilation<StateT, ContextT, ResponseBodyT>(
  queries: Queries
): MiddlewareType<StateT, WithAppSecretContext<ContextT>, Nullable<ResponseBodyT>> {
  return async (ctx, next) => {
    type ClientCredentials = Partial<{
      clientId: string;
      clientSecret: string;
    }>;
    const getCredentialsFromHeader = (): ClientCredentials => {
      const parts = ctx.headers.authorization?.split(' ');

      if (parts?.length !== 2 || parts[0]?.toLowerCase() !== 'basic' || !parts[1]) {
        return {};
      }

      const [part0, part1] = Buffer.from(parts[1], 'base64').toString().split(':');

      return {
        clientId: part0 && decodeAuthToken(part0),
        clientSecret: part1 && decodeAuthToken(part1),
      };
    };

    const getCredentialsFromParams = (): ClientCredentials => {
      const params: unknown = ctx.method === 'POST' ? ctx.request.body : ctx.query;

      if (typeof params !== 'object' || params === null) {
        return {};
      }

      const clientId =
        'client_id' in params && typeof params.client_id === 'string'
          ? params.client_id
          : undefined;
      const clientSecret =
        'client_secret' in params && typeof params.client_secret === 'string'
          ? params.client_secret
          : undefined;
      return { clientId, clientSecret };
    };

    const getCredentials = (
      header: ClientCredentials,
      params: ClientCredentials
    ): ClientCredentials => {
      if (header.clientId && params.clientId && header.clientId !== params.clientId) {
        return {};
      }

      // Only authorization header is allowed to be used for client authentication if the client ID
      // is provided in the header.
      if (header.clientId && (!header.clientSecret || params.clientSecret)) {
        return {};
      }

      const clientId = header.clientId ?? params.clientId;
      const clientSecret = header.clientSecret ?? params.clientSecret;

      return { clientId, clientSecret };
    };

    const header = getCredentialsFromHeader();
    const params = getCredentialsFromParams();
    const { clientId, clientSecret } = getCredentials(header, params);
    if (!clientId || !clientSecret) {
      return next();
    }

    const result = await queries.applicationSecrets.findByCredentials(clientId, clientSecret);

    // Fall back to the original client secret logic to provide backward compatibility.
    if (!result) {
      return next();
    }

    if (result.expiresAt && result.expiresAt < Date.now()) {
      throw new errors.InvalidRequest('client secret has expired');
    }

    // All checks passed. Rewrite the client secret to the one in the `applications` table.
    if (header.clientSecret) {
      ctx.headers.authorization = `Basic ${Buffer.from(
        `${clientId}:${result.originalSecret}`
      ).toString('base64')}`;
    } else if (ctx.method === 'POST') {
      ctx.request.body.client_secret = result.originalSecret;
    } else {
      ctx.query.client_secret = result.originalSecret;
    }

    ctx.appSecret = { name: result.name };
    return next();
  };
}
