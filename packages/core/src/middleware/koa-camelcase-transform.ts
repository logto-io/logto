import camelcaseKeys from 'camelcase-keys';
import { Middleware } from 'koa';

export enum ResponseKeyCase {
  camelcase = 'camelcase',
  snakecase = 'snakecase',
}

export default function koaCamelcaseTransform<StateT, ContextT>(): Middleware<
  StateT,
  ContextT,
  unknown
> {
  return async (ctx, next) => {
    await next();
    if (
      ctx.headers['response-keycase'] === ResponseKeyCase.camelcase &&
      ctx.body &&
      typeof ctx.body === 'object'
    ) {
      ctx.body = camelcaseKeys(ctx.body, { deep: true });
    }
  };
}
