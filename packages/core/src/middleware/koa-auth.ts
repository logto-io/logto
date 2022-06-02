import { IncomingHttpHeaders } from 'http';

import { UserRole } from '@logto/schemas';
import { managementResource } from '@logto/schemas/lib/seeds';
import { jwtVerify } from 'jose';
import { MiddlewareType, Request } from 'koa';
import { IRouterParamContext } from 'koa-router';

import envSet from '@/env-set';
import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

export type WithAuthContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    auth: string;
  };

const bearerTokenIdentifier = 'Bearer';

const extractBearerTokenFromHeaders = ({ authorization }: IncomingHttpHeaders) => {
  assertThat(
    authorization,
    new RequestError({ code: 'auth.authorization_header_missing', status: 401 })
  );
  assertThat(
    authorization.startsWith(bearerTokenIdentifier),
    new RequestError(
      { code: 'auth.authorization_token_type_not_supported', status: 401 },
      { supportedTypes: [bearerTokenIdentifier] }
    )
  );

  return authorization.slice(bearerTokenIdentifier.length + 1);
};

const getUserInfoFromRequest = async (request: Request) => {
  const { isProduction, developmentUserId, oidc } = envSet.values;
  const userId = developmentUserId || request.headers['development-user-id']?.toString();

  if (!isProduction && userId) {
    return userId;
  }

  const { publicKey, issuer } = oidc;
  const {
    payload: { sub, role_names: roleNames },
  } = await jwtVerify(extractBearerTokenFromHeaders(request.headers), publicKey, {
    issuer,
    audience: managementResource.indicator,
  });

  assertThat(sub, new RequestError({ code: 'auth.jwt_sub_missing', status: 401 }));

  assertThat(
    Array.isArray(roleNames) && roleNames.includes(UserRole.Admin),
    new RequestError({ code: 'auth.unauthorized', status: 401 })
  );

  return sub;
};

export default function koaAuth<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    try {
      const userId = await getUserInfoFromRequest(ctx.request);
      ctx.auth = userId;
    } catch {
      throw new RequestError({ code: 'auth.unauthorized', status: 401 });
    }

    return next();
  };
}
