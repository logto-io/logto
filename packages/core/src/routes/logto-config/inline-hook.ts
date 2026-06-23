import {
  LogtoInlineHookKey,
  inlineHookGuard,
  inlineHookTestRequestBodyGuard,
  jsonGuard,
} from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { InlineHookLibrary, isAccessDeniedError } from '#src/libraries/inline-hook.js';
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
  error: z.unknown().optional(),
});

const parseInlineHookResponseError = async (error: ResponseError) => {
  const responseBody: unknown = await error.response.json();

  if (isAccessDeniedError(responseBody)) {
    return {
      message: responseBody.message,
      error: responseBody,
    };
  }

  const errorResponseResult = inlineHookResponseErrorGuard.safeParse(responseBody);

  return errorResponseResult.success ? errorResponseResult.data : { message: error.message };
};

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
        ctx.body = EnvSet.values.isCloud
          ? await libraries.inlineHooks.runScriptRemotely(body)
          : await InlineHookLibrary.runScriptInLocalVm(body);
        ctx.status = 200;
      } catch (error: unknown) {
        if (error instanceof ResponseError) {
          const responseBody = await parseInlineHookResponseError(error);
          const { message, error: originalError } = responseBody;
          const status = isAccessDeniedError(originalError) ? 403 : 422;

          throw new RequestError(
            { code: 'session.hook_denied_access', status },
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
      status: [200, 201, 400],
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
      status: [200, 400, 404],
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
