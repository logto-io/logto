declare module 'koa-body' {
  import { IKoaBodyOptions } from 'node_modules/koa-body';
  import { MiddlewareType } from 'koa';

  declare function koaBody<
    StateT = Record<string, unknown>,
    ContextT = Record<string, unknown>,
    ResponseBodyT = any
  >(options?: IKoaBodyOptions): MiddlewareType<StateT, ContextT, ResponseBodyT>;

  export = koaBody;
}
