import type { LogContextPayload, LogKey } from '@logto/schemas';
import { LogKeyUnknown, LogResult } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import pick from 'lodash.pick';
import { nanoid } from 'nanoid';

import RequestError from '#src/errors/RequestError/index.js';
import { insertLog } from '#src/queries/log.js';

const removeUndefinedKeys = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

export type LogPayload = Partial<LogContextPayload> & Record<string, unknown>;

export type LogFunction = {
  (data: Readonly<LogPayload>): void;
  setKey: (key: LogKey) => void;
};

export type LogContext = {
  log: LogFunction;
};

export type WithLogContext<ContextT extends IRouterParamContext = IRouterParamContext> = ContextT &
  LogContext;

/**
 * The factory to create a new audit log middleware function.
 * It will inject a {@link LogFunction} property named `log` to the context to enable audit logging.
 *
 * ---
 *
 * You need to explicitly call `ctx.log.setKey()` to set a {@link LogKey} thus the log can be categorized and indexed in database:
 *
 * ```ts
 * ctx.log.setKey('SignIn.Submit'); // Key is typed
 * ```
 *
 * To log data, call `ctx.log()`. It'll use object spread operators to update data (i.e. merge with one-level overwrite and shallow copy).
 *
 * ```ts
 * ctx.log({ applicationId: 'foo' });
 * ```
 *
 * The data has a initial value:
 *
 * ```ts
 * {
 *   key: LogKeyUnknown,
 *   result: LogResult.Success,
 *   ip, // Extract from request
 *   userAgent, // Extract from request
 * }
 * ```
 *
 * Note: Both of the functions can be called multiple times.
 *
 * @see {@link LogKey} for all available log keys, and {@link LogResult} for result enums.
 * @see {@link LogContextPayload} for the basic type suggestion of log data.
 * @returns An audit log middleware function.
 */
export default function koaAuditLog<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithLogContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const {
      ip,
      headers: { 'user-agent': userAgent },
    } = ctx.request;

    // eslint-disable-next-line @silverhand/fp/no-let
    let payload: LogContextPayload = {
      key: LogKeyUnknown,
      result: LogResult.Success,
      ip,
      userAgent,
    };

    const log: LogFunction = Object.assign(
      (data: Readonly<LogPayload>) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        payload = {
          ...payload,
          ...removeUndefinedKeys(data),
        };
      },
      {
        setKey: (key: LogKey) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          payload = { ...payload, key };
        },
      }
    );

    ctx.log = log;

    try {
      await next();
    } catch (error: unknown) {
      log({
        result: LogResult.Error,
        error:
          error instanceof RequestError
            ? pick(error, 'message', 'code', 'data')
            : { message: String(error) },
      });
      throw error;
    } finally {
      // TODO: If no `payload.key` found, should we trigger an alert or something?
      await insertLog({
        id: nanoid(),
        type: payload.key,
        payload,
      });
    }
  };
}
