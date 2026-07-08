import type { MiddlewareType } from 'koa';
import type { KoaBodyMiddlewareOptions } from 'koa-body';

/**
 * Augment `koa-body` with a generic overload of `koaBody()` — the built-in signature returns a
 * non-generic `Middleware`, which loses the state/context typing that `koaGuard` relies on.
 */
declare module 'koa-body' {
  export function koaBody<
    StateT = Record<string, unknown>,
    ContextT = Record<string, unknown>,
    ResponseBodyT = unknown,
  >(options?: Partial<KoaBodyMiddlewareOptions>): MiddlewareType<StateT, ContextT, ResponseBodyT>;
}
