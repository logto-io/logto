import assert from 'assert';
import RequestError from '@/errors/RequestError';
import { MiddlewareType } from 'koa';
import { jwtVerify } from 'jose/jwt/verify';
import { publicKey, issuer, adminResource } from '@/oidc/consts';
import { IRouterParamContext } from 'koa-router';
import { UserInfo, userInfoSelectFields } from '@logto/schemas';
import { findUserById } from '@/queries/user';
import pick from 'lodash.pick';

export type WithAuthContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    user: UserInfo;
  };

const bearerToken = 'Bearer';

export default function koaAuth<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const { authorization } = ctx.request.headers;
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
    const jwt = authorization.slice(bearerToken.length + 1);

    try {
      const {
        payload: { sub },
      } = await jwtVerify(jwt, publicKey, {
        issuer,
        audience: adminResource,
      });
      assert(sub);
      const user = await findUserById(sub);
      ctx.user = pick(user, ...userInfoSelectFields);
    } catch {
      throw new RequestError({ code: 'auth.unauthorized', status: 401 });
    }

    return next();
  };
}
