import type { LogContextPayload, LogKey } from '@logto/schemas';
import { LogResult } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, type Optional, pick } from '@silverhand/essentials';
import type { Context, MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import { UAParser } from 'ua-parser-js';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { getInjectedHeaderValues } from '#src/utils/injected-header-mapping.js';
import {
  isRecord,
  sanitizeSensitiveDataRecord,
  stripNullCharactersFromString,
} from '#src/utils/sensitive-data.js';

const removeUndefinedKeys = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

/**
 * Reapply reserved fields after canonicalizing catch-all keys, so inputs such as `\0key` cannot
 * collide with the fields that define the log entry.
 */
const sanitizeLogContextPayload = ({
  key,
  result,
  ...payload
}: LogContextPayload): LogContextPayload => ({
  ...sanitizeSensitiveDataRecord(payload),
  key: stripNullCharactersFromString(key),
  result,
});

export class LogEntry {
  payload: LogContextPayload;

  constructor(
    public readonly key: LogKey,
    public readonly independent = false
  ) {
    this.payload = {
      key,
      result: LogResult.Success,
    };
  }

  /** Update payload by spreading `data` first, then spreading `this.payload`. */
  prepend(data: Readonly<LogPayload>) {
    this.payload = sanitizeLogContextPayload({
      ...removeUndefinedKeys(data),
      ...this.payload,
    });
  }

  /** Update payload by spreading `this.payload` first, then spreading `data`. */
  append(data: Readonly<LogPayload>) {
    this.payload = sanitizeLogContextPayload({
      ...this.payload,
      ...removeUndefinedKeys(data),
    });
  }
}

export type LogPayload = Partial<LogContextPayload>;

export type CreateLogOptions = {
  /** Keep this entry's own result when the remainder of the request fails. */
  independent?: boolean;
};

export type LogContext = {
  createLog: (key: LogKey, options?: CreateLogOptions) => LogEntry;
  prependAllLogEntries: (payload: LogPayload) => void;
};

export type WithLogContext<ContextT extends IRouterParamContext = IRouterParamContext & Context> =
  ContextT & LogContext;

/**
 * Runtime `typeof` expectation for every {@link LogContext} member. The `satisfies` constraint is
 * exhaustive over `keyof LogContext`, so extending {@link LogContext} fails compilation here until
 * the new member is covered by {@link assertLogContext} as well.
 */
const logContextShape = Object.freeze({
  createLog: 'function',
  prependAllLogEntries: 'function',
} as const satisfies Record<keyof LogContext, 'function'>);

/**
 * Assert that the context has been enriched with {@link LogContext} by the audit log middleware.
 * Useful where a context is statically typed without {@link LogContext} but is known to run
 * downstream of the middleware, e.g. `oidc-provider` event listeners, whose contexts are emitted
 * from within the middleware chain.
 */
export function assertLogContext<ContextT>(ctx: ContextT): asserts ctx is ContextT & LogContext {
  if (
    !isRecord(ctx) ||
    Object.entries(logContextShape).some(([key, expectedType]) => typeof ctx[key] !== expectedType)
  ) {
    throw new TypeError('The context has not been enriched by the audit log middleware.');
  }
}

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
 *   userAgentParsed: { ...parsedUserAgent },
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

    ctx.createLog = (key: LogKey, { independent = false } = {}) => {
      const entry = new LogEntry(key, independent);
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
        if (entry.independent) {
          continue;
        }

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
      const signInContext = conditional(getInjectedHeaderValues(ctx.request.headers));
      const userAgentValue: Optional<string> =
        typeof userAgent === 'string' ? userAgent : userAgent?.[0];
      const userAgentParsed: Optional<UAParser.IResult> = conditional(
        (() => {
          if (!userAgentValue) {
            return;
          }

          try {
            return new UAParser(userAgentValue).getResult();
          } catch {}
        })()
      );
      const basePayload = removeUndefinedKeys({
        ip,
        userAgent: userAgentValue,
        ...conditional(userAgentParsed && { userAgentParsed }),
        ...conditional(signInContext && { signInContext }),
      });

      await Promise.all(
        entries.map(async ({ payload }) => {
          // Apply the recursive filter at the final insertion boundary too, so common context
          // added through `prependAllLogEntries()` can never bypass sensitive-key masking.
          const fullPayload = sanitizeLogContextPayload({ ...basePayload, ...payload });
          return insertLog({
            id: generateStandardId(),
            key: payload.key,
            payload: fullPayload,
          });
        })
      );
    }
  };
}
