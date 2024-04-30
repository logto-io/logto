import { appInsights } from '@logto/app-insights/node';
import type { Optional } from '@silverhand/essentials';
import { has } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import { koaBody } from 'koa-body';
import type { IMiddleware, IRouterParamContext } from 'koa-router';
import type { ZodType, ZodTypeDef } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { ResponseBodyError, StatusCodeError } from '#src/errors/ServerError/index.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

/** Configure what and how to guard. */
export type GuardConfig<QueryT, BodyT, ParametersT, ResponseT, FilesT> = {
  /**
   * Guard query parameters after `?` in the URL.
   *
   * Normally you need to use a "string-string" dictionary guard for wrapping key-value pairs
   * since query parameter values will be always parsed as strings.
   *
   * @example
   * // e.g. parse '?key1=foo'
   * z.object({ key1: z.string() })
   */
  query?: ZodType<QueryT, ZodTypeDef, unknown>;
  /**
   * Guard JSON request body. You can treat the body like a normal object.
   *
   * @example
   * z.object({
   *   key1: z.string(),
   *   key2: z.object({ key3: z.number() }).array(),
   * })
   */
  body?: ZodType<BodyT, ZodTypeDef, unknown>;
  /**
   * Guard `koa-router` path parameters (i.e. `ctx.params`).
   *
   * @example
   * // e.g. parse '/foo/:key1'
   * z.object({ key1: z.string() })
   */
  params?: ZodType<ParametersT, ZodTypeDef, unknown>;
  /**
   * Guard response body.
   *
   * @example z.object({ key1: z.string() })
   */
  response?: ZodType<ResponseT, ZodTypeDef, unknown>;
  /**
   * Guard response status code. It produces a `ServerError` (500) if the response does not satisfy
   * any of the given value(s).
   *
   * Note: It will also guard the status code from `RequestError` that is thrown by inner
   * middleware.
   */
  status?: number | number[];
  files?: ZodType<FilesT, ZodTypeDef, unknown>;
};

export type GuardedRequest<QueryT, BodyT, ParametersT, FilesT> = {
  query: QueryT;
  body: BodyT;
  params: ParametersT;
  files: FilesT;
};

export type WithGuardedRequestContext<
  ContextT extends IRouterParamContext,
  GuardQueryT,
  GuardBodyT,
  GuardParametersT,
  GuardFilesT,
> = ContextT & {
  guard: GuardedRequest<GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>;
};

export type WithGuardConfig<
  Type,
  GuardQueryT = unknown,
  GuardBodyT = unknown,
  GuardParametersT = unknown,
  GuardResponseT = unknown,
  GuardFilesT = undefined,
> = Type & {
  config: GuardConfig<GuardQueryT, GuardBodyT, GuardParametersT, GuardResponseT, GuardFilesT>;
};

export const isGuardMiddleware = <Type extends IMiddleware>(
  function_: Type
): function_ is WithGuardConfig<Type> =>
  function_.name === 'guardMiddleware' && has(function_, 'config');

/**
 * Previous `tryParse` function's output type was `Output | undefined`.
 * It can not properly infer the output type to be `Output` even if the guard is provided,
 * which brings additional but unnecessary type checks.
 */
export const parse = <Output, Definition extends ZodTypeDef, Input>(
  type: 'query' | 'body' | 'params' | 'files',
  guard: ZodType<Output, Definition, Input>,
  data: unknown
) => {
  try {
    return guard.parse(data);
  } catch (error: unknown) {
    throw new RequestError({ code: 'guard.invalid_input', type }, error);
  }
};

const tryParse = <Output, Definition extends ZodTypeDef, Input>(
  type: 'query' | 'body' | 'params' | 'files',
  guard: Optional<ZodType<Output, Definition, Input>>,
  data: unknown
) => {
  if (!guard) {
    return;
  }

  return parse(type, guard, data);
};

/**
 * Guard middleware factory for request and response.
 *
 * Note: A context-aware console log is required to be present in the context (i.e. `ctx.console`).
 */
export default function koaGuard<
  StateT,
  ContextT extends IRouterParamContext,
  GuardQueryT = undefined,
  GuardBodyT = undefined,
  GuardParametersT = undefined,
  GuardResponseT = unknown,
  GuardFilesT = undefined,
>({
  query,
  body,
  params,
  response,
  status,
  files,
}: GuardConfig<
  GuardQueryT,
  GuardBodyT,
  GuardParametersT,
  GuardResponseT,
  GuardFilesT
>): MiddlewareType<
  StateT,
  WithGuardedRequestContext<ContextT, GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>,
  GuardResponseT
> {
  const guard: MiddlewareType<
    StateT,
    WithGuardedRequestContext<ContextT, GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>,
    GuardResponseT
  > = async (ctx, next) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-restricted-syntax
    ctx.guard = {
      query: tryParse('query', query, ctx.request.query),
      body: tryParse('body', body, ctx.request.body ?? {}), // Fallback to empty object since it's the original behavior of koa-body@5
      params: tryParse('params', params, ctx.params),
      files: tryParse('files', files, ctx.request.files),
    } as GuardedRequest<GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>; // Have to do this since it's too complicated for TS

    return next();
  };

  const guardMiddleware: WithGuardConfig<
    MiddlewareType<
      StateT,
      WithGuardedRequestContext<ContextT, GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>,
      GuardResponseT
    >
  > = async function (ctx, next) {
    const consoleLog = getConsoleLogFromContext(ctx);

    /**
     * Assert the status code matches the value(s) in the config. If the config does not
     * specify a status code, it will not assert anything.
     *
     * In production, it will log a warning if the status code does not match the value(s) in the
     * config for better user experience.
     *
     * @param value The status code to assert.
     * @throws {StatusCodeError} If the status code does not match the value(s) in the config.
     */
    const assertStatusCode = (value: number) => {
      if (status === undefined) {
        return;
      }

      if (Array.isArray(status) ? status.includes(value) : status === value) {
        return;
      }

      if (EnvSet.values.isProduction) {
        consoleLog.warn('Unexpected status code:', value, 'expected:', status);
        void appInsights.trackException(
          new StatusCodeError(status, value),
          buildAppInsightsTelemetry(ctx)
        );
        return;
      }

      throw new StatusCodeError(status, value);
    };

    try {
      await (body ?? files
        ? koaBody<StateT, ContextT>({ multipart: Boolean(files) })(ctx, async () =>
            guard(ctx, next)
          )
        : guard(ctx, next));
    } catch (error: unknown) {
      // Assert the status code from `RequestError` that is thrown by inner middleware.
      // Ignore guard errors since they will be always 400 and can be automatically documented
      // in the OpenAPI route.
      if (error instanceof RequestError && !error.code.startsWith('guard.')) {
        assertStatusCode(error.status);
      }

      throw error;
    }

    assertStatusCode(ctx.response.status);

    if (response !== undefined) {
      const result = response.safeParse(ctx.body);

      if (result.success) {
        // Overwrite the response body with the parsed one, since it will strip out
        // the properties that are not defined in the schema.
        ctx.body = result.data;
      } else {
        consoleLog.error('Invalid response:', result.error);
        throw new ResponseBodyError(result.error);
      }
    }
  };

  // Intended
  // eslint-disable-next-line @silverhand/fp/no-mutation
  guardMiddleware.config = { query, body, params, response, status };

  return guardMiddleware;
}
