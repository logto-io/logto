import { has } from '@logto/essentials';
import { MiddlewareType } from 'koa';
import koaBody from 'koa-body';
import { IMiddleware, IRouterParamContext } from 'koa-router';
import { ZodType } from 'zod';

import RequestError from '@/errors/RequestError';

export type GuardConfig<QueryT, BodyT, ParametersT> = {
  query?: ZodType<QueryT>;
  body?: ZodType<BodyT>;
  params?: ZodType<ParametersT>;
};

export type Guarded<QueryT, BodyT, ParametersT> = {
  query: QueryT;
  body: BodyT;
  params: ParametersT;
};

export type WithGuardedContext<
  ContextT extends IRouterParamContext,
  GuardQueryT,
  GuardBodyT,
  GuardParametersT
> = ContextT & {
  guard: Guarded<GuardQueryT, GuardBodyT, GuardParametersT>;
};

export type WithGuardConfig<
  Type,
  GuardQueryT = unknown,
  GuardBodyT = unknown,
  GuardParametersT = unknown
> = Type & {
  config: GuardConfig<GuardQueryT, GuardBodyT, GuardParametersT>;
};

export const isGuardMiddleware = <Type extends IMiddleware>(
  function_: Type
): function_ is WithGuardConfig<Type> =>
  function_.name === 'guardMiddleware' && has(function_, 'config');

export default function koaGuard<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT,
  GuardQueryT = undefined,
  GuardBodyT = undefined,
  GuardParametersT = undefined
>({
  query,
  body,
  params,
}: GuardConfig<GuardQueryT, GuardBodyT, GuardParametersT>): MiddlewareType<
  StateT,
  WithGuardedContext<ContextT, GuardQueryT, GuardBodyT, GuardParametersT>,
  ResponseBodyT
> {
  const guard: MiddlewareType<
    StateT,
    WithGuardedContext<ContextT, GuardQueryT, GuardBodyT, GuardParametersT>,
    ResponseBodyT
  > = async (ctx, next) => {
    try {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      ctx.guard = {
        query: query?.parse(ctx.request.query),
        body: body?.parse(ctx.request.body),
        params: params?.parse(ctx.params),
      } as Guarded<GuardQueryT, GuardBodyT, GuardParametersT>; // Have to do t His since it's too complicated for TS
    } catch (error: unknown) {
      throw new RequestError('guard.invalid_input', error);
    }

    return next();
  };

  const guardMiddleware: WithGuardConfig<
    MiddlewareType<
      StateT,
      WithGuardedContext<ContextT, GuardQueryT, GuardBodyT, GuardParametersT>,
      ResponseBodyT
    >
  > = async function (ctx, next) {
    if (body) {
      return koaBody<StateT, ContextT>()(ctx, async () => guard(ctx, next));
    }

    return guard(ctx, next);
  };

  // Intended
  // eslint-disable-next-line @silverhand/fp/no-mutation
  guardMiddleware.config = { query, body, params };

  return guardMiddleware;
}
