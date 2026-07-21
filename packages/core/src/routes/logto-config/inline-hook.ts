import {
  LogtoInlineHookKey,
  inlineHookGuard,
  inlineHookExecutionRequestBodyGuard,
  jsonGuard,
} from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import {
  buildSafeInlineHookErrorSummary,
  getInlineHookSensitiveValues,
} from '#src/libraries/inline-hook-sanitization.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { koaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { isRecord } from '#src/utils/sensitive-data.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

const inlineHookConfigsGuard = z.object({
  key: z.nativeEnum(LogtoInlineHookKey),
  value: inlineHookGuard,
});

const parseInlineHookResponseError = async (error: ResponseError): Promise<unknown> => {
  try {
    const responseBody: unknown = await error.response.json();

    if (!isRecord(responseBody)) {
      return error;
    }

    return {
      ...responseBody,
      message: typeof responseBody.message === 'string' ? responseBody.message : error.message,
    };
  } catch {
    return error;
  }
};

const getInlineHookResponseErrorStatus = (status: number) =>
  status === 400 || status === 403 || status === 422 ? status : 422;

const buildSafeInlineHookRequestErrorData = (
  error: unknown,
  sensitiveValues: readonly string[]
) => {
  const { message, errors } = buildSafeInlineHookErrorSummary(error, sensitiveValues);

  return {
    message,
    ...(errors ? { errors } : {}),
  };
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
      body: inlineHookExecutionRequestBodyGuard,
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
        const sensitiveValues = getInlineHookSensitiveValues(body);

        if (error instanceof ResponseError) {
          const responseError = await parseInlineHookResponseError(error);

          throw new RequestError(
            {
              code: 'inline_hook.general',
              status: getInlineHookResponseErrorStatus(error.response.status),
            },
            buildSafeInlineHookRequestErrorData(responseError, sensitiveValues)
          );
        }

        if (error instanceof RequestError) {
          throw new RequestError(
            {
              code: error.code,
              status: error.status,
              expose: error.expose,
            },
            buildSafeInlineHookRequestErrorData(error, sensitiveValues)
          );
        }

        throw new RequestError(
          { code: 'inline_hook.general', status: 422 },
          buildSafeInlineHookRequestErrorData(error, sensitiveValues)
        );
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
