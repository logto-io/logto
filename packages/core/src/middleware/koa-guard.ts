import RequestError, { GuardErrorCode } from '@/errors/RequestError';
import { Middleware } from 'koa';
import koaBody from 'koa-body';
import { IRouterParamContext } from 'koa-router';
import { ZodType } from 'zod';

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

export type WithGuarded<
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
}: GuardConfig<GuardQueryT, GuardBodyT, GuardParametersT>): Middleware<
  StateT,
  WithGuarded<ContextT, GuardQueryT, GuardBodyT, GuardParametersT>,
  ResponseBodyT
> {
  const guard: Middleware<
    StateT,
    WithGuarded<ContextT, GuardQueryT, GuardBodyT, GuardParametersT>,
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
      throw new RequestError(GuardErrorCode.InvalidInput, error);
    }

    await next();
  };

  const guardMiddleware: WithGuardConfig<
    Middleware<
      StateT,
      WithGuarded<ContextT, GuardQueryT, GuardBodyT, GuardParametersT>,
      ResponseBodyT
    >
  > = async function (ctx, next) {
    if (body) {
      await koaBody<StateT, ContextT>()(ctx, async () => {
        await guard(ctx, next);
      });
      return;
    }

    await guard(ctx, next);
  };

  guardMiddleware.config = { query, body, params };

  return guardMiddleware;
}
