// https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/shared/check_resource.js
declare module 'oidc-provider/lib/shared/check_resource.js' {
  import { type KoaMiddleware } from 'koa';

  export default async function checkResource<T, R>(
    ...args: Parameters<KoaMiddleware<T, R>>
  ): ReturnType<KoaMiddleware<T, R>>;
}
