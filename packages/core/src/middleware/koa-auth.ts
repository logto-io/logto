import { IncomingHttpHeaders } from 'http';

import { UserRole } from '@logto/schemas';
import { managementResource } from '@logto/schemas/lib/seeds';
import { conditional } from '@silverhand/essentials';
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

type UserInfo = {
  sub: string;
  roleNames?: string[];
};

const getUserInfoFromRequest = async (request: Request): Promise<UserInfo> => {
  const { isProduction, isIntegrationTest, developmentUserId, oidc } = envSet.values;
  const userId = request.headers['development-user-id']?.toString() ?? developmentUserId;

  if ((!isProduction || isIntegrationTest) && userId) {
    return { sub: userId, roleNames: [UserRole.Admin] };
  }

  const { localJWKSet, issuer } = oidc;
  const {
    payload: { sub, role_names: roleNames },
  } = await jwtVerify(extractBearerTokenFromHeaders(request.headers), localJWKSet, {
    issuer,
    audience: managementResource.indicator,
  });

  assertThat(sub, new RequestError({ code: 'auth.jwt_sub_missing', status: 401 }));

  return { sub, roleNames: conditional(Array.isArray(roleNames) && roleNames) };
};

export default function koaAuth<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  forRole?: UserRole
): MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    try {
      const { sub, roleNames } = await getUserInfoFromRequest(ctx.request);

      if (forRole) {
        assertThat(
          roleNames?.includes(forRole),
          new RequestError({ code: 'auth.forbidden', status: 403 })
        );
      }

      ctx.auth = sub;
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        throw error;
      }
      throw new RequestError({ code: 'auth.unauthorized', status: 401 });
    }

    return next();
  };
}
