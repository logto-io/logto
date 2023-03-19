import type { Optional } from '@silverhand/essentials';
import { has } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import koaBody from 'koa-body';
import type { IMiddleware, IRouterParamContext } from 'koa-router';
import type { ZodType, ZodTypeDef } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { ResponseBodyError, StatusCodeError } from '#src/errors/ServerError/index.js';
import assertThat from '#src/utils/assert-that.js';

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
  query?: ZodType<QueryT>;
  /**
   * Guard JSON request body. You can treat the body like a normal object.
   *
   * @example
   * z.object({
   *   key1: z.string(),
   *   key2: z.object({ key3: z.number() }).array(),
   * })
   */
  body?: ZodType<BodyT>;
  /**
   * Guard `koa-router` path parameters (i.e. `ctx.params`).
   *
   * @example
   * // e.g. parse '/foo/:key1'
   * z.object({ key1: z.string() })
   */
  params?: ZodType<ParametersT>;
  /**
   * Guard response body.
   *
   * @example z.object({ key1: z.string() })
   */
  response?: ZodType<ResponseT>;
  /**
   * Guard response status code. It produces a `ServerError` (500)
   * if the response does not satisfy any of the given value(s).
   */
  status?: number | number[];
  files?: ZodType<FilesT>;
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
  GuardFilesT
> = ContextT & {
  guard: GuardedRequest<GuardQueryT, GuardBodyT, GuardParametersT, GuardFilesT>;
};

export type WithGuardConfig<
  Type,
  GuardQueryT = unknown,
  GuardBodyT = unknown,
  GuardParametersT = unknown,
  GuardResponseT = unknown,
  GuardFilesT = undefined
> = Type & {
  config: GuardConfig<GuardQueryT, GuardBodyT, GuardParametersT, GuardResponseT, GuardFilesT>;
};

export const isGuardMiddleware = <Type extends IMiddleware>(
  function_: Type
): function_ is WithGuardConfig<Type> =>
  function_.name === 'guardMiddleware' && has(function_, 'config');

const tryParse = <Output, Definition extends ZodTypeDef, Input>(
  type: 'query' | 'body' | 'params' | 'files',
  guard: Optional<ZodType<Output, Definition, Input>>,
  data: unknown
) => {
  try {
    return guard?.parse(data);
  } catch (error: unknown) {
    throw new RequestError({ code: 'guard.invalid_input', type }, error);
  }
};

export default function koaGuard<
  StateT,
  ContextT extends IRouterParamContext,
  GuardQueryT = undefined,
  GuardBodyT = undefined,
  GuardParametersT = undefined,
  GuardResponseT = unknown,
  GuardFilesT = undefined
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
      body: tryParse('body', body, ctx.request.body),
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
    await (body ?? files
      ? koaBody<StateT, ContextT>({ multipart: Boolean(files) })(ctx, async () => guard(ctx, next))
      : guard(ctx, next));

    if (status !== undefined) {
      assertThat(
        Array.isArray(status)
          ? status.includes(ctx.response.status)
          : status === ctx.response.status,
        new StatusCodeError(status, ctx.response.status)
      );
    }

    if (response !== undefined) {
      const result = response.safeParse(ctx.body);

      if (!result.success) {
        if (!EnvSet.values.isProduction) {
          console.error('Invalid response:', result.error);
        }

        throw new ResponseBodyError(result.error);
      }
    }
  };

  // Intended
  // eslint-disable-next-line @silverhand/fp/no-mutation
  guardMiddleware.config = { query, body, params };

  return guardMiddleware;
}
