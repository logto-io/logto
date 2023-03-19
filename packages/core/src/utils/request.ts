import type { Request } from 'koa';

export const noCache = (request: Request): boolean =>
  Boolean(
    request.headers['cache-control']
      ?.split(',')
      .some((value) => ['no-cache', 'no-store'].includes(value.trim().toLowerCase()))
  ) || request.URL.searchParams.get('no_cache') !== null;
