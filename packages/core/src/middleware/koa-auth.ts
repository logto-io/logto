import assert from 'assert';
import { IncomingHttpHeaders } from 'http';
import RequestError from '@/errors/RequestError';
import { MiddlewareType, Request } from 'koa';
import { jwtVerify } from 'jose/jwt/verify';
import { publicKey, issuer, adminResource } from '@/oidc/consts';
import { IRouterParamContext } from 'koa-router';
import { UserInfo, userInfoSelectFields } from '@logto/schemas';
import { findUserById } from '@/queries/user';
import pick from 'lodash.pick';
import { developmentUserId, isProduction } from '@/env/consts';

export type WithAuthContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    user: UserInfo;
  };

const bearerToken = 'Bearer';

const extractBearerTokenFromHeaders = ({ authorization }: IncomingHttpHeaders) => {
  assert(
    authorization,
    new RequestError({ code: 'auth.authorization_header_missing', status: 401 })
  );
  assert(
    authorization.startsWith(bearerToken),
    new RequestError(
      { code: 'auth.authorization_type_not_supported', status: 401 },
      { supportedTypes: [bearerToken] }
    )
  );
  return authorization.slice(bearerToken.length + 1);
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
  assert(sub);
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
      const user = await findUserById(userId);
      ctx.user = pick(user, ...userInfoSelectFields);
    } catch {
      throw new RequestError({ code: 'auth.unauthorized', status: 401 });
    }

    return next();
  };
}
