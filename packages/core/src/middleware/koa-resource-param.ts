import type { Nullable } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

/**
 * Create a middleware function that checks if the request URL contains comma separated `resource` query parameter.
 * If yes, split the values and reconstruct the URL with multiple `resource` query parameters.
 * E.g. `?resource=foo,bar` => `?resource=foo&resource=bar`
 */
export default function koaResourceParam<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  Nullable<ResponseBodyT>
> {
  return async (ctx, next) => {
    const { query } = ctx.request;
    const { resource } = query;

    if (!resource) {
      return next();
    }

    const resources = Array.isArray(resource) ? resource : [resource];
    const resourceParams = resources.flatMap((resource) => resource.split(','));

    ctx.request.query = {
      ...query,
      resource: resourceParams,
    };
    return next();
  };
}
