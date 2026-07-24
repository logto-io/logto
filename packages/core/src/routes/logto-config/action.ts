import {
  LogtoActionKey,
  logtoActionGuard,
  actionExecutionRequestBodyGuard,
  jsonGuard,
} from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import {
  buildSafeActionErrorSummary,
  getActionSensitiveValues,
} from '#src/libraries/action-sanitization.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { koaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { isRecord } from '#src/utils/sensitive-data.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

const actionQuotaKey = 'actionsEnabled';

const actionConfigsGuard = z.object({
  key: z.nativeEnum(LogtoActionKey),
  value: logtoActionGuard,
});

const parseActionResponseError = async (error: ResponseError): Promise<unknown> => {
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

const getActionResponseErrorStatus = (status: number) =>
  status === 400 || status === 403 || status === 422 ? status : 422;

const buildSafeActionRequestErrorData = (error: unknown, sensitiveValues: readonly string[]) => {
  const { message, errors } = buildSafeActionErrorSummary(error, sensitiveValues);

  return {
    message,
    ...(errors ? { errors } : {}),
  };
};

export default function logtoConfigActionRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, logtoConfigs, libraries }]: RouterInitArgs<T>
) {
  const { getRowsByKeys, deleteAction } = queries.logtoConfigs;
  const { upsertAction, getAction, getActions, updateAction } = logtoConfigs;

  router.get(
    '/configs/actions',
    koaGuard({
      response: actionConfigsGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const actions = await getActions(getConsoleLogFromContext(ctx));
      ctx.body = Object.values(LogtoActionKey)
        .filter((key) => actions[key])
        .map((key) => ({ key, value: actions[key] }));
      return next();
    }
  );

  router.post(
    '/configs/actions/test',
    koaGuard({
      body: actionExecutionRequestBodyGuard,
      response: jsonGuard.optional(),
      status: [200, 400, 403, 422],
    }),
    koaQuotaGuard({ key: actionQuotaKey, quota: libraries.quota }),
    async (ctx, next) => {
      const { body } = ctx.guard;

      try {
        // Share the same Cloud/local execution selection as production `runAction()`.
        ctx.body = await libraries.actions.executeScript(body);
        ctx.status = 200;
      } catch (error: unknown) {
        const sensitiveValues = getActionSensitiveValues(body);

        if (error instanceof ResponseError) {
          const responseError = await parseActionResponseError(error);

          throw new RequestError(
            {
              code: 'action.general',
              status: getActionResponseErrorStatus(error.response.status),
            },
            buildSafeActionRequestErrorData(responseError, sensitiveValues)
          );
        }

        if (error instanceof RequestError) {
          throw new RequestError(
            {
              code: error.code,
              status: error.status,
              expose: error.expose,
            },
            buildSafeActionRequestErrorData(error, sensitiveValues)
          );
        }

        throw new RequestError(
          { code: 'action.general', status: 422 },
          buildSafeActionRequestErrorData(error, sensitiveValues)
        );
      }

      return next();
    }
  );

  router.get(
    '/configs/actions/:actionType',
    koaGuard({
      params: z.object({
        actionType: z.nativeEnum(LogtoActionKey),
      }),
      response: logtoActionGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { actionType },
      } = ctx.guard;

      ctx.body = await getAction(actionType);
      return next();
    }
  );

  router.put(
    '/configs/actions/:actionType',
    koaGuard({
      params: z.object({
        actionType: z.nativeEnum(LogtoActionKey),
      }),
      body: logtoActionGuard,
      response: logtoActionGuard,
      status: [200, 201, 400, 403],
    }),
    koaQuotaGuard({ key: actionQuotaKey, quota: libraries.quota }),
    async (ctx, next) => {
      const {
        params: { actionType },
        body,
      } = ctx.guard;

      const { rows } = await getRowsByKeys([actionType]);
      const action = await upsertAction(actionType, body);

      if (rows.length === 0) {
        ctx.status = 201;
      }

      ctx.body = action.value;
      return next();
    }
  );

  router.patch(
    '/configs/actions/:actionType',
    koaGuard({
      params: z.object({
        actionType: z.nativeEnum(LogtoActionKey),
      }),
      body: logtoActionGuard.partial(),
      response: logtoActionGuard,
      status: [200, 400, 403, 404],
    }),
    koaQuotaGuard({ key: actionQuotaKey, quota: libraries.quota }),
    async (ctx, next) => {
      const {
        params: { actionType },
        body,
      } = ctx.guard;

      ctx.body = await updateAction(actionType, body);
      return next();
    }
  );

  router.delete(
    '/configs/actions/:actionType',
    koaGuard({
      params: z.object({
        actionType: z.nativeEnum(LogtoActionKey),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { actionType },
      } = ctx.guard;

      await deleteAction(actionType);
      ctx.status = 204;
      return next();
    }
  );
}
