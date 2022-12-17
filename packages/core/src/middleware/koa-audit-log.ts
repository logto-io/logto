import type { LogContextPayload, LogKey } from '@logto/schemas';
import { LogResult } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import pick from 'lodash.pick';
import { nanoid } from 'nanoid';

import RequestError from '#src/errors/RequestError/index.js';
import { insertLog } from '#src/queries/log.js';

const removeUndefinedKeys = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

export class LogEntry {
  payload: LogContextPayload;

  constructor(public readonly key: LogKey) {
    this.payload = {
      key,
      result: LogResult.Success,
    };
  }

  append(data: Readonly<LogPayload>) {
    this.payload = {
      ...this.payload,
      ...removeUndefinedKeys(data),
    };
  }
}

export type LogPayload = Partial<LogContextPayload> & Record<string, unknown>;

export type LogContext = {
  createLog: (key: LogKey) => LogEntry;
};

export type WithLogContext<ContextT extends IRouterParamContext = IRouterParamContext> = ContextT &
  LogContext;

/**
 * The factory to create a new audit log middleware function.
 * It will inject a {@link LogFunction} property named `log` to the context to enable audit logging.
 *
 * #### Set log key
 *
 * You need to explicitly call `ctx.log.setKey()` to set a {@link LogKey} thus the log can be categorized and indexed in database:
 *
 * ```ts
 * ctx.log.setKey('SignIn.Submit'); // Key is typed
 * ```
 *
 * If log key is {@link LogKeyUnknown} in the end, it will not be recorded to the persist storage.
 *
 * #### Log data
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
export default function koaAuditLog<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  dumpLogContext?: (ctx: ContextT) => Promise<Record<string, unknown>> | Record<string, unknown>
): MiddlewareType<StateT, WithLogContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const entries: LogEntry[] = [];

    ctx.createLog = (key: LogKey) => {
      const entry = new LogEntry(key);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      entries.push(entry);

      return entry;
    };

    try {
      await next();
    } catch (error: unknown) {
      for (const entry of entries) {
        entry.append({
          result: LogResult.Error,
          error:
            error instanceof RequestError
              ? pick(error, 'message', 'code', 'data')
              : { message: String(error) },
        });
      }
      throw error;
    } finally {
      // Predefined context
      const {
        ip,
        headers: { 'user-agent': userAgent },
      } = ctx.request;

      const logContext = { ip, userAgent, ...(await dumpLogContext?.(ctx)) };
      await Promise.all(
        entries.map(async ({ payload }) => {
          return insertLog({
            id: nanoid(),
            type: payload.key,
            payload: { ...logContext, ...payload },
          });
        })
      );
    }
  };
}
