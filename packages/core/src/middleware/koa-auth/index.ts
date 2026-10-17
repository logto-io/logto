import { buildOrganizationUrn } from '@logto/core-kit';
import {
  adminTenantId,
  defaultManagementApi,
  getTenantOrganizationId,
  getTenantRole,
  PredefinedScope,
  TenantRole,
} from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import type { JWK } from 'jose';
import { createLocalJWKSet, jwtVerify } from 'jose';
import type { MiddlewareType, Request } from 'koa';
import type { IMiddleware, IRouterParamContext } from 'koa-router';
import { sql } from '@silverhand/slonik';
import { HTTPError } from 'ky';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import { devConsole } from '#src/utils/console.js';

import { type WithAuthContext, type TokenInfo } from './types.js';
import { extractBearerTokenFromHeaders, getAdminTenantTokenValidationSet } from './utils.js';

export * from './types.js';
export * from './constants.js';

export const verifyBearerTokenFromRequest = async (
  envSet: EnvSet,
  request: Request,
  audience: Optional<string | string[]>
): Promise<TokenInfo> => {
  const { isProduction, isIntegrationTest, developmentUserId } = EnvSet.values;
  const userId = request.headers['development-user-id']?.toString() ?? developmentUserId;

  if ((!isProduction || isIntegrationTest) && userId) {
    // This log is distracting in integration tests.
    if (!isIntegrationTest) {
      devConsole.warn(`Found dev user ID ${userId}, skip token validation.`);
    }

    return {
      sub: userId,
      clientId: undefined,
      scopes: defaultManagementApi.scopes.map(({ name }) => name),
    };
  }

  const getKeysAndIssuer = async (): Promise<[JWK[], string[]]> => {
    const { publicJwks, issuer } = envSet.oidc;

    if (envSet.tenantId === adminTenantId) {
      return [publicJwks, [issuer]];
    }

    const adminSet = await getAdminTenantTokenValidationSet();

    return [
      [...publicJwks, ...adminSet.keys],
      [issuer, ...adminSet.issuer],
    ];
  };

  try {
    const [keys, issuer] = await getKeysAndIssuer();
    const {
      payload: { sub, client_id: clientId, scope = '', aud },
    } = await jwtVerify(
      extractBearerTokenFromHeaders(request.headers),
      createLocalJWKSet({ keys }),
      {
        issuer,
        audience,
      }
    );

    assertThat(sub, new RequestError({ code: 'auth.jwt_sub_missing', status: 401 }));

    return { sub, clientId, scopes: z.string().parse(scope).split(' '), audience: aud };
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      throw error;
    }

    /**
     * Handle potential errors when ky makes requests during validation
     * This may occur when fetching OIDC configuration from the oidc-config endpoint
     * `TypeError`: typically thrown when the fetch operation fails (e.g., network issues)
     * `HTTPError`: thrown by ky for non-2xx responses
     */
    if (error instanceof TypeError || error instanceof HTTPError) {
      throw error;
    }

    throw new RequestError({ code: 'auth.unauthorized', status: 401 }, error);
  }
};

export const isKoaAuthMiddleware = <Type extends IMiddleware>(function_: Type) =>
  function_.name === 'authMiddleware';

/**
 * Whether the user is an admin of the tenant's organization in the admin tenant. The console signs the
 * user in to the admin tenant and asks for the tenant's organization as the audience, so this is the
 * check that decides whether that user may use the tenant's Management API.
 */
const assertTenantAdminMembership = async (tenantId: string, userId: string) => {
  const pool = await EnvSet.sharedPool;
  const row = await pool.maybeOne(sql`
    select 1
    from organization_role_user_relations
    where tenant_id = ${adminTenantId}
      and organization_id = ${getTenantOrganizationId(tenantId)}
      and organization_role_id = ${getTenantRole(TenantRole.Admin).id}
      and user_id = ${userId}
  `);

  assertThat(row, new RequestError({ code: 'auth.forbidden', status: 403 }));
};

export default function koaAuth<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  envSet: EnvSet,
  audience: string | string[]
): MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> {
  const authMiddleware: MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> = async (
    ctx,
    next
  ) => {
    const { sub, clientId, scopes, audience: tokenAudience } = await verifyBearerTokenFromRequest(
      envSet,
      ctx.request,
      audience
    );

    // An organization token for the tenant's admin is authorized by the membership check instead of the
    // `all` scope, which organization tokens do not carry.
    const organizationAudience = buildOrganizationUrn(getTenantOrganizationId(envSet.tenantId));
    const isOrganizationToken =
      envSet.tenantId !== adminTenantId && [tokenAudience].flat().includes(organizationAudience);

    if (isOrganizationToken) {
      await assertTenantAdminMembership(envSet.tenantId, sub);
    } else {
      assertThat(
        scopes.includes(PredefinedScope.All),
        new RequestError({ code: 'auth.forbidden', status: 403 })
      );
    }

    ctx.auth = {
      type: sub === clientId ? 'app' : 'user',
      id: sub,
      scopes: new Set(scopes),
    };

    return next();
  };

  return authMiddleware;
}
