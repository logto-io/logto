import assert from 'node:assert';
import type { IncomingHttpHeaders } from 'node:http';
import path from 'node:path/posix';

import type { NextFunction, RequestContext } from '@withtyped/server';
import { RequestError } from '@withtyped/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

const bearerTokenIdentifier = 'Bearer';

export const extractBearerTokenFromHeaders = ({ authorization }: IncomingHttpHeaders) => {
  assert(authorization, new RequestError('Authorization header is missing.', 401));
  assert(
    authorization.startsWith(bearerTokenIdentifier),
    new RequestError(
      `Authorization token type is not supported. Valid type: "${bearerTokenIdentifier}".`,
      401
    )
  );

  return authorization.slice(bearerTokenIdentifier.length + 1);
};

export type WithAuthContext<Context = RequestContext> = Context & {
  auth: {
    id: string;
    scopes: string[];
  };
};

export type WithAuthConfig = {
  /** The Logto admin tenant endpoint. */
  endpoint: URL;
  /** The audience (i.e. Resource Indicator) to expect. */
  audience: string;
  /** The scopes (i.e. permissions) to expect. */
  scopes?: string[];
};

export default function withAuth<InputContext extends RequestContext>({
  endpoint,
  audience,
  scopes: expectScopes = [],
}: WithAuthConfig) {
  const getJwkSet = (async () => {
    const fetched = await fetch(
      new URL(path.join(endpoint.pathname, 'oidc/.well-known/openid-configuration'), endpoint)
    );
    const { jwks_uri: jwksUri, issuer } = z
      .object({ jwks_uri: z.string(), issuer: z.string() })
      .parse(await fetched.json());

    return Object.freeze([createRemoteJWKSet(new URL(jwksUri)), issuer] as const);
  })();

  return async (context: InputContext, next: NextFunction<WithAuthContext<InputContext>>) => {
    const [getKey, issuer] = await getJwkSet;

    try {
      const {
        payload: { sub, scope },
      } = await jwtVerify(extractBearerTokenFromHeaders(context.request.headers), getKey, {
        issuer,
        audience,
      });

      assert(sub, new RequestError('"sub" is missing in JWT.', 401));

      const scopes = typeof scope === 'string' ? scope.split(' ') : [];
      assert(
        expectScopes.every((scope) => scopes.includes(scope)),
        new RequestError('Forbidden. Please check your permissions.', 403)
      );

      await next({ ...context, auth: { id: sub, scopes } });

      return;
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        throw error;
      }

      throw new RequestError('Unauthorized.', 401);
    }
  };
}
