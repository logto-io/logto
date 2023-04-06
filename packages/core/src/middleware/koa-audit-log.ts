import type { LogContextPayload, LogKey } from '@logto/schemas';
import { LogResult } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { pick } from '@silverhand/essentials';
import type { Context, MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const filterSensitiveData = (data: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (isRecord(value)) {
        return [key, filterSensitiveData(value)];
      }

      return [key, key === 'password' ? '******' : value];
    })
  );
};

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

  /** Update payload by spreading `data` first, then spreading `this.payload`. */
  prepend(data: Readonly<LogPayload>) {
    this.payload = {
      ...removeUndefinedKeys(data),
      ...this.payload,
    };
  }

  /** Update payload by spreading `this.payload` first, then spreading `data`. */
  append(data: Readonly<LogPayload>) {
    this.payload = {
      ...this.payload,
      ...filterSensitiveData(removeUndefinedKeys(data)),
    };
  }
}

export type LogPayload = Partial<LogContextPayload>;

export type LogContext = {
  createLog: (key: LogKey) => LogEntry;
  prependAllLogEntries: (payload: LogPayload) => void;
};

export type WithLogContext<ContextT extends IRouterParamContext = IRouterParamContext & Context> =
  ContextT & LogContext;

/**
 * The factory to create a new audit log middleware function.
 * It will inject a `createLog` function the context to enable audit logging.
 *
 * #### Create a log entry
 *
 * You need to explicitly call `ctx.createLog()` to create a new {@link LogEntry} instance,
 * which accepts a read-only parameter {@link LogKey} thus the log can be categorized and indexed in database.
 *
 * ```ts
 * const log = ctx.createLog('Interaction.Create'); // Key is typed
 * ```
 *
 * Note every time you call `ctx.createLog()`, it will create a new log entry instance for inserting. So multiple log entries may be inserted within one request.
 *
 * Remember to keep the log entry instance properly if you want to collect log data from multiple places.
 *
 * #### Log data
 *
 * To update log payload, call `log.append()`. It will use object spread operators to update payload (i.e. merge with one-level overwrite and shallow copy).
 *
 * ```ts
 * log.append({ applicationId: 'foo' });
 * ```
 *
 * This function can be called multiple times.
 *
 * #### Log context
 *
 * By default, before inserting the logs, it will extract the request context and prepend request IP and User Agent to every log entry:
 *
 * ```ts
 * {
 *   ip: 'request-ip-addr',
 *   userAgent: 'request-user-agent',
 *   ...log.payload,
 * }
 * ```
 *
 * To add more common data to log entries, try to create another middleware function after this one, and call `ctx.prependAllLogEntries()`.
 *
 * @returns An audit log middleware function.
 * @see {@link LogKey} for all available log keys, and {@link LogResult} for result enums.
 * @see {@link LogContextPayload} for the basic type suggestion of log data.
 */
export default function koaAuditLog<StateT, ContextT extends IRouterParamContext, ResponseBodyT>({
  logs: { insertLog },
}: Queries): MiddlewareType<StateT, WithLogContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const entries: LogEntry[] = [];

    ctx.createLog = (key: LogKey) => {
      const entry = new LogEntry(key);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      entries.push(entry);

      return entry;
    };

    ctx.prependAllLogEntries = (payload) => {
      for (const entry of entries) {
        entry.prepend(payload);
      }
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

      await Promise.all(
        entries.map(async ({ payload }) => {
          return insertLog({
            id: generateStandardId(),
            key: payload.key,
            payload: { ip, userAgent, ...payload },
          });
        })
      );
    }
  };
}
