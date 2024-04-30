import {
  LogtoJwtTokenKey,
  LogtoJwtTokenKeyType,
  accessTokenJwtCustomizerGuard,
  adminTenantId,
  clientCredentialsJwtCustomizerGuard,
  jsonObjectGuard,
  jwtCustomizerConfigsGuard,
  jwtCustomizerTestRequestBodyGuard,
} from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import { ZodError, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError, { formatZodError } from '#src/errors/RequestError/index.js';
import koaGuard, { parse } from '#src/middleware/koa-guard.js';
import koaQuotaGuard from '#src/middleware/koa-quota-guard.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

const getJwtTokenKeyAndBody = (tokenPath: LogtoJwtTokenKeyType, body: unknown) => {
  if (tokenPath === LogtoJwtTokenKeyType.AccessToken) {
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

export default function logtoConfigJwtCustomizerRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    { id: tenantId, queries, logtoConfigs, cloudConnection, libraries },
  ]: RouterInitArgs<T>
) {
  const { getRowsByKeys, deleteJwtCustomizer } = queries.logtoConfigs;
  const { upsertJwtCustomizer, getJwtCustomizer, getJwtCustomizers, updateJwtCustomizer } =
    logtoConfigs;
  const { deployJwtCustomizerScript, undeployJwtCustomizerScript } = libraries.jwtCustomizers;

  router.put(
    '/configs/jwt-customizer/:tokenTypePath',
    koaGuard({
      params: z.object({
        tokenTypePath: z.nativeEnum(LogtoJwtTokenKeyType),
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
    koaQuotaGuard({ key: 'customJwtEnabled', quota: libraries.quota }),
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

      // Deploy first to avoid the case where the JWT customizer was saved to DB but not deployed successfully.
      if (!isIntegrationTest) {
        await deployJwtCustomizerScript(getConsoleLogFromContext(ctx), {
          key,
          value: body,
          useCase: 'production',
        });
      }

      const { rows } = await getRowsByKeys([key]);

      const jwtCustomizer = await upsertJwtCustomizer(key, body);

      if (rows.length === 0) {
        ctx.status = 201;
      }

      ctx.body = jwtCustomizer.value;

      return next();
    }
  );

  router.patch(
    '/configs/jwt-customizer/:tokenTypePath',
    // See comments in the `PUT /configs/jwt-customizer/:tokenTypePath` route, handle the request body manually.
    koaGuard({
      params: z.object({
        tokenTypePath: z.nativeEnum(LogtoJwtTokenKeyType),
      }),
      body: z.unknown(),
      response: accessTokenJwtCustomizerGuard.or(clientCredentialsJwtCustomizerGuard),
      status: [200, 400, 404],
    }),
    koaQuotaGuard({ key: 'customJwtEnabled', quota: libraries.quota }),
    async (ctx, next) => {
      const { isIntegrationTest } = EnvSet.values;

      const {
        params: { tokenTypePath },
        body: rawBody,
      } = ctx.guard;
      const { key, body } = getJwtTokenKeyAndBody(tokenTypePath, rawBody);

      // Deploy first to avoid the case where the JWT customizer was saved to DB but not deployed successfully.
      if (!isIntegrationTest) {
        await deployJwtCustomizerScript(getConsoleLogFromContext(ctx), {
          key,
          value: body,
          useCase: 'production',
        });
      }

      ctx.body = await updateJwtCustomizer(key, body);

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
      const jwtCustomizer = await getJwtCustomizers(getConsoleLogFromContext(ctx));
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
        tokenTypePath: z.nativeEnum(LogtoJwtTokenKeyType),
      }),
      response: accessTokenJwtCustomizerGuard.or(clientCredentialsJwtCustomizerGuard),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { tokenTypePath },
      } = ctx.guard;
      ctx.body = await getJwtCustomizer(
        tokenTypePath === LogtoJwtTokenKeyType.AccessToken
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
        tokenTypePath: z.nativeEnum(LogtoJwtTokenKeyType),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const { isIntegrationTest } = EnvSet.values;

      const {
        params: { tokenTypePath },
      } = ctx.guard;

      const tokenKey =
        tokenTypePath === LogtoJwtTokenKeyType.AccessToken
          ? LogtoJwtTokenKey.AccessToken
          : LogtoJwtTokenKey.ClientCredentials;

      // Undeploy the script first to avoid the case where the JWT customizer was deleted from DB but worker script not updated successfully.
      if (!isIntegrationTest) {
        await undeployJwtCustomizerScript(getConsoleLogFromContext(ctx), tokenKey);
      }

      await deleteJwtCustomizer(tokenKey);
      ctx.status = 204;
      return next();
    }
  );

  if (!EnvSet.values.isCloud && !EnvSet.values.isUnitTest) {
    return;
  }

  router.post(
    '/configs/jwt-customizer/test',
    koaGuard({
      body: jwtCustomizerTestRequestBodyGuard,
      response: jsonObjectGuard,
      status: [200, 400, 403, 422],
    }),
    koaQuotaGuard({ key: 'customJwtEnabled', quota: libraries.quota }),
    async (ctx, next) => {
      const { body } = ctx.guard;

      // Deploy the test script
      await deployJwtCustomizerScript(getConsoleLogFromContext(ctx), {
        key:
          body.tokenType === LogtoJwtTokenKeyType.AccessToken
            ? LogtoJwtTokenKey.AccessToken
            : LogtoJwtTokenKey.ClientCredentials,
        value: body,
        useCase: 'test',
      });

      const client = await cloudConnection.getClient();

      try {
        ctx.body = await client.post(`/api/services/custom-jwt`, {
          body,
          search: { isTest: 'true' },
        });
      } catch (error: unknown) {
        /**
         * All APIs should throw `RequestError` instead of `Error`.
         * In the admin console, we caught the error and recognized the error with the code `jwt_customizer.general`,
         * and then we extract and show the error message to the user.
         *
         * `ResponseError` comes from `@withtyped/client` and all `logto/core` API returns error in the
         * format of `RequestError`, we manually transform it here to keep the error format consistent.
         */
        if (error instanceof ResponseError) {
          const { message } = z.object({ message: z.string() }).parse(await error.response.json());
          throw new RequestError({ code: 'jwt_customizer.general', status: 422 }, { message });
        }

        if (error instanceof ZodError) {
          throw new RequestError(
            { code: 'jwt_customizer.general', status: 422 },
            { message: formatZodError(error) }
          );
        }

        throw error;
      }

      return next();
    }
  );
}
