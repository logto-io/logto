import type { DefaultState, DefaultContext, ParameterizedContext } from 'koa';

/**
 * Note: `Request` fields `body`, `rawBody`, and `files` are augmented by `koa-body` itself
 * (`body?: JsonValue`), so they are not declared here.
 */
declare module 'koa' {
  // Have to do this patch since `compose.Middleware` returns `any`.
  export type KoaNext<T> = () => Promise<T>;
  export type KoaMiddleware<T, R> = (context: T, next: KoaNext<R>) => Promise<void>;
  export type MiddlewareType<
    StateT = DefaultState,
    ContextT = DefaultContext,
    ResponseBodyT = unknown,
    NextT = void,
  > = KoaMiddleware<ParameterizedContext<StateT, ContextT, ResponseBodyT>, NextT>;
}
