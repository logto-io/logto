import { IncomingHttpHeaders } from 'http';

import { jwtVerify } from 'jose/jwt/verify';
import { MiddlewareType, Request } from 'koa';
import { IRouterParamContext } from 'koa-router';

import { developmentUserId, isProduction } from '@/env/consts';
import RequestError from '@/errors/RequestError';
import { publicKey, issuer, adminResource } from '@/oidc/consts';
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
      { code: 'auth.authorization_type_not_supported', status: 401 },
      { supportedTypes: [bearerTokenIdentifier] }
    )
  );

  return authorization.slice(bearerTokenIdentifier.length + 1);
};

const getUserIdFromRequest = async (request: Request) => {
  if (!isProduction && developmentUserId) {
    return developmentUserId;
  }

  const {
    payload: { sub },
  } = await jwtVerify(extractBearerTokenFromHeaders(request.headers), publicKey, {
    issuer,
    audience: adminResource,
  });
  assertThat(sub, new RequestError({ code: 'auth.jwt_sub_missing', status: 401 }));

  return sub;
};

export default function koaAuth<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    try {
      const userId = await getUserIdFromRequest(ctx.request);
      ctx.auth = userId;
    } catch {
      throw new RequestError({ code: 'auth.unauthorized', status: 401 });
    }

    return next();
  };
}
