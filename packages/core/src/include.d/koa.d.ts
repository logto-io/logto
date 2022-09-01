import { DefaultState, DefaultContext, ParameterizedContext, BaseRequest } from 'koa';

declare module 'koa' {
  // Have to do this patch since `compose.Middleware` returns `any`.
  export type KoaNext<T> = () => Promise<T>;
  export type KoaMiddleware<T, R> = (context: T, next: KoaNext<R>) => Promise<void>;
  export type MiddlewareType<
    StateT = DefaultState,
    ContextT = DefaultContext,
    ResponseBodyT = unknown,
    NextT = void
  > = KoaMiddleware<ParameterizedContext<StateT, ContextT, ResponseBodyT>, NextT>;

  interface Request extends BaseRequest {
    body?: unknown;
    files?: Files;
  }
}
