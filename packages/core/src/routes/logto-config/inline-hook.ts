import {
  LogtoInlineHookKey,
  inlineHookGuard,
  inlineHookTestRequestBodyGuard,
  jsonGuard,
} from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { koaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

const inlineHookConfigsGuard = z.object({
  key: z.nativeEnum(LogtoInlineHookKey),
  value: inlineHookGuard,
});

const inlineHookResponseErrorGuard = z.object({
  message: z.string(),
});

const parseInlineHookResponseError = async (error: ResponseError) => {
  const responseBody: unknown = await error.response.json();
  const errorResponseResult = inlineHookResponseErrorGuard.safeParse(responseBody);

  return {
    message: errorResponseResult.success ? errorResponseResult.data.message : error.message,
    error: responseBody,
  };
};

const getInlineHookResponseErrorStatus = (status: number) =>
  status === 400 || status === 403 || status === 422 ? status : 422;

export default function logtoConfigInlineHookRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, logtoConfigs, libraries }]: RouterInitArgs<T>
) {
  const { getRowsByKeys, deleteInlineHook } = queries.logtoConfigs;
  const { upsertInlineHook, getInlineHook, getInlineHooks, updateInlineHook } = logtoConfigs;

  router.get(
    '/configs/inline-hooks',
    koaGuard({
      response: inlineHookConfigsGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const inlineHooks = await getInlineHooks(getConsoleLogFromContext(ctx));
      ctx.body = Object.values(LogtoInlineHookKey)
        .filter((key) => inlineHooks[key])
        .map((key) => ({ key, value: inlineHooks[key] }));
      return next();
    }
  );

  router.post(
    '/configs/inline-hooks/test',
    koaGuard({
      body: inlineHookTestRequestBodyGuard,
      response: jsonGuard.optional(),
      status: [200, 400, 403, 422],
    }),
    koaQuotaGuard({ key: 'inlineHooksEnabled', quota: libraries.quota }),
    async (ctx, next) => {
      const { body } = ctx.guard;

      try {
        // Share the same Cloud/local execution selection as production `runHook()`.
        ctx.body = await libraries.inlineHooks.executeScript(body);
        ctx.status = 200;
      } catch (error: unknown) {
        if (error instanceof ResponseError) {
          const responseBody = await parseInlineHookResponseError(error);
          const { message, error: originalError } = responseBody;

          throw new RequestError(
            {
              code: 'inline_hook.general',
              status: getInlineHookResponseErrorStatus(error.response.status),
            },
            { message, error: originalError }
          );
        }

        throw error;
      }

      return next();
    }
  );

  router.get(
    '/configs/inline-hooks/:hookType',
    koaGuard({
      params: z.object({
        hookType: z.nativeEnum(LogtoInlineHookKey),
      }),
      response: inlineHookGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { hookType },
      } = ctx.guard;

      ctx.body = await getInlineHook(hookType);
      return next();
    }
  );

  router.put(
    '/configs/inline-hooks/:hookType',
    koaGuard({
      params: z.object({
        hookType: z.nativeEnum(LogtoInlineHookKey),
      }),
      body: inlineHookGuard,
      response: inlineHookGuard,
      status: [200, 201, 400, 403],
    }),
    koaQuotaGuard({ key: 'inlineHooksEnabled', quota: libraries.quota }),
    async (ctx, next) => {
      const {
        params: { hookType },
        body,
      } = ctx.guard;

      const { rows } = await getRowsByKeys([hookType]);
      const inlineHook = await upsertInlineHook(hookType, body);

      if (rows.length === 0) {
        ctx.status = 201;
      }

      ctx.body = inlineHook.value;
      return next();
    }
  );

  router.patch(
    '/configs/inline-hooks/:hookType',
    koaGuard({
      params: z.object({
        hookType: z.nativeEnum(LogtoInlineHookKey),
      }),
      body: inlineHookGuard.partial(),
      response: inlineHookGuard,
      status: [200, 400, 403, 404],
    }),
    koaQuotaGuard({ key: 'inlineHooksEnabled', quota: libraries.quota }),
    async (ctx, next) => {
      const {
        params: { hookType },
        body,
      } = ctx.guard;

      ctx.body = await updateInlineHook(hookType, body);
      return next();
    }
  );

  router.delete(
    '/configs/inline-hooks/:hookType',
    koaGuard({
      params: z.object({
        hookType: z.nativeEnum(LogtoInlineHookKey),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { hookType },
      } = ctx.guard;

      await deleteInlineHook(hookType);
      ctx.status = 204;
      return next();
    }
  );
}
