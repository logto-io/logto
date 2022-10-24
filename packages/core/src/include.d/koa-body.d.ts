declare module 'koa-body' {
  import type { MiddlewareType } from 'koa';
  import type { IKoaBodyOptions } from 'node_modules/koa-body';

  declare function koaBody<
    StateT = Record<string, unknown>,
    ContextT = Record<string, unknown>,
    ResponseBodyT = unknown
  >(options?: IKoaBodyOptions): MiddlewareType<StateT, ContextT, ResponseBodyT>;

  export = koaBody;
}
