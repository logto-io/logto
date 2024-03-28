import {
  accessTokenJwtCustomizerGuard,
  clientCredentialsJwtCustomizerGuard,
  LogtoJwtTokenKey,
  LogtoJwtTokenPath,
  jsonObjectGuard,
  adminTenantId,
  jwtCustomizerConfigsGuard,
  jwtCustomizerTestRequestBodyGuard,
  type JwtCustomizerTestRequestBody,
  type CustomJwtFetcher,
} from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard, { parse } from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from '../types.js';

/**
 * Transpile the request body of the JWT customizer test API to the request body of the Cloud JWT customizer test API.
 *
 * @param body Core JWT customizer test API request body.
 * @returns Request body of the Cloud JWT customizer test API.
 */
const transpileJwtCustomizerTestRequestBody = (
  body: JwtCustomizerTestRequestBody
): CustomJwtFetcher => {
  const { tokenType, payload } = body;
  /**
   * We have to deal with the `tokenType` and `payload` at the same time since they are put together as one of the discriminated union type.
   * Otherwise the type inference will not work as expected.
   */
  if (tokenType === LogtoJwtTokenPath.AccessToken) {
    const { tokenSample: token, contextSample: context, ...rest } = payload;
    return {
      tokenType,
      token,
      context,
      ...rest,
    };
  }
  const { tokenSample: token, contextSample, ...rest } = payload;
  return {
    tokenType,
    token,
    ...rest,
  };
};

const getJwtTokenKeyAndBody = (tokenPath: LogtoJwtTokenPath, body: unknown) => {
  if (tokenPath === LogtoJwtTokenPath.AccessToken) {
    return {
      key: LogtoJwtTokenKey.AccessToken,
      body: parse('body', accessTokenJwtCustomizerGuard, body),
    };
  }
  return {
    key: LogtoJwtTokenKey.ClientCredentials,
    body: parse('body', clientCredentialsJwtCustomizerGuard, body),
  };
};

export default function logtoConfigJwtCustomizerRoutes<T extends AuthedRouter>(
  ...[router, { id: tenantId, queries, logtoConfigs, cloudConnection }]: RouterInitArgs<T>
) {
  const { getRowsByKeys, deleteJwtCustomizer } = queries.logtoConfigs;
  const { upsertJwtCustomizer, getJwtCustomizer, getJwtCustomizers } = logtoConfigs;

  router.put(
    '/configs/jwt-customizer/:tokenTypePath',
    koaGuard({
      params: z.object({
        tokenTypePath: z.nativeEnum(LogtoJwtTokenPath),
      }),
      /**
       * Use `z.unknown()` to guard the request body as a JSON object, since the actual guard depends
       * on the `tokenTypePath` and we can not get the value of `tokenTypePath` before parsing the request body,
       * we will do more specific guard as long as we can get the value of `tokenTypePath`.
       *
       * Should specify `body` in koaGuard, otherwise the request body is not accessible even via `ctx.request.body`.
       */
      body: z.unknown(),
      response: accessTokenJwtCustomizerGuard.or(clientCredentialsJwtCustomizerGuard),
      status: [200, 201, 400, 403],
    }),
    async (ctx, next) => {
      const { isCloud, isIntegrationTest } = EnvSet.values;
      if (tenantId === adminTenantId && isCloud && !isIntegrationTest) {
        throw new RequestError({
          code: 'jwt_customizer.can_not_create_for_admin_tenant',
          status: 422,
        });
      }

      const {
        params: { tokenTypePath },
        body: rawBody,
      } = ctx.guard;
      const { key, body } = getJwtTokenKeyAndBody(tokenTypePath, rawBody);

      const { rows } = await getRowsByKeys([key]);

      const jwtCustomizer = await upsertJwtCustomizer(key, body);

      if (rows.length === 0) {
        ctx.status = 201;
      }
      ctx.body = jwtCustomizer.value;

      return next();
    }
  );

  router.get(
    '/configs/jwt-customizer',
    koaGuard({
      response: jwtCustomizerConfigsGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const jwtCustomizer = await getJwtCustomizers();
      ctx.body = Object.values(LogtoJwtTokenKey)
        .filter((key) => jwtCustomizer[key])
        .map((key) => ({ key, value: jwtCustomizer[key] }));
      return next();
    }
  );

  router.get(
    '/configs/jwt-customizer/:tokenTypePath',
    koaGuard({
      params: z.object({
        tokenTypePath: z.nativeEnum(LogtoJwtTokenPath),
      }),
      response: accessTokenJwtCustomizerGuard.or(clientCredentialsJwtCustomizerGuard),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { tokenTypePath },
      } = ctx.guard;
      ctx.body = await getJwtCustomizer(
        tokenTypePath === LogtoJwtTokenPath.AccessToken
          ? LogtoJwtTokenKey.AccessToken
          : LogtoJwtTokenKey.ClientCredentials
      );
      return next();
    }
  );

  router.delete(
    '/configs/jwt-customizer/:tokenTypePath',
    koaGuard({
      params: z.object({
        tokenTypePath: z.nativeEnum(LogtoJwtTokenPath),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { tokenTypePath },
      } = ctx.guard;

      await deleteJwtCustomizer(
        tokenTypePath === LogtoJwtTokenPath.AccessToken
          ? LogtoJwtTokenKey.AccessToken
          : LogtoJwtTokenKey.ClientCredentials
      );
      ctx.status = 204;
      return next();
    }
  );

  if (!EnvSet.values.isCloud) {
    return;
  }

  router.post(
    '/configs/jwt-customizer/test',
    koaGuard({
      /**
       * Early throws when:
       * 1. no `script` provided.
       * 2. no `tokenSample` provided.
       */
      body: jwtCustomizerTestRequestBodyGuard,
      response: jsonObjectGuard,
      status: [200, 400, 403, 422],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;

      const client = await cloudConnection.getClient();

      try {
        ctx.body = await client.post(`/api/services/custom-jwt`, {
          body: transpileJwtCustomizerTestRequestBody(body),
        });
      } catch (error: unknown) {
        /**
         * `ResponseError` comes from `@withtyped/client` and all `logto/core` API returns error in the
         * format of `RequestError`, we manually transform it here to keep the error format consistent.
         */
        if (error instanceof ResponseError) {
          const { message } = z.object({ message: z.string() }).parse(await error.response.json());
          throw new RequestError({ code: 'jwt_customizer.general', status: 422 }, { message });
        }

        throw error;
      }

      return next();
    }
  );
}
