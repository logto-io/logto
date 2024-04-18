declare module 'koa-body' {
  import type { MiddlewareType } from 'koa';
  import type { KoaBodyMiddlewareOptions } from 'node_modules/koa-body/types';

  export function koaBody<
    StateT = Record<string, unknown>,
    ContextT = Record<string, unknown>,
    ResponseBodyT = unknown,
  >(options?: Partial<KoaBodyMiddlewareOptions>): MiddlewareType<StateT, ContextT, ResponseBodyT>;
}
