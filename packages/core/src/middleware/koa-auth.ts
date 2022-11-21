import type { IncomingHttpHeaders } from 'http';

import { UserRole } from '@logto/schemas';
import { managementResource } from '@logto/schemas/lib/seeds';
import type { Optional } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import { jwtVerify } from 'jose';
import type { MiddlewareType, Request } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import envSet from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

export type Auth = {
  type: 'user' | 'app';
  id: string;
};

export type WithAuthContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    auth: Auth;
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

type TokenInfo = {
  sub: string;
  clientId: unknown;
  roleNames?: string[];
};

// TODO: @Gao refactor me
// eslint-disable-next-line complexity
export const verifyBearerTokenFromRequest = async (
  request: Request,
  resourceIndicator: Optional<string>
): Promise<TokenInfo> => {
  const { isProduction, isIntegrationTest, developmentUserId } = envSet.values;
  const userId = request.headers['development-user-id']?.toString() ?? developmentUserId;

  if ((!isProduction || isIntegrationTest) && userId) {
    return { sub: userId, clientId: undefined, roleNames: [UserRole.Admin] };
  }

  try {
    const { localJWKSet, issuer } = envSet.oidc;
    const {
      payload: { sub, client_id: clientId, role_names: roleNames },
    } = await jwtVerify(extractBearerTokenFromHeaders(request.headers), localJWKSet, {
      issuer,
      audience: resourceIndicator,
    });

    assertThat(sub, new RequestError({ code: 'auth.jwt_sub_missing', status: 401 }));

    return { sub, clientId, roleNames: conditional(Array.isArray(roleNames) && roleNames) };
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      throw error;
    }

    throw new RequestError({ code: 'auth.unauthorized', status: 401 }, error);
  }
};

export default function koaAuth<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  forRole?: UserRole
): MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const { sub, clientId, roleNames } = await verifyBearerTokenFromRequest(
      ctx.request,
      managementResource.indicator
    );

    if (forRole) {
      assertThat(
        roleNames?.includes(forRole),
        new RequestError({ code: 'auth.forbidden', status: 403 })
      );
    }

    ctx.auth = {
      type: sub === clientId ? 'app' : 'user',
      id: sub,
    };

    return next();
  };
}
