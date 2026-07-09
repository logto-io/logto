import type { Request } from 'koa';

import { getRequestOrigin } from './request.js';

type LinkRelationType = 'first' | 'prev' | 'next' | 'last';

export const buildLink = (
  request: Pick<Request, 'URL' | 'path' | 'query'>,
  page: number,
  type: LinkRelationType
): string => {
  // Fall back to a relative URL when the request origin is unavailable, see `getRequestOrigin()`.
  const baseUrl = `${getRequestOrigin(request) ?? ''}${request.path}`;

  return `<${baseUrl}?${new URLSearchParams({
    ...request.query,
    page: String(page),
  }).toString()}>; rel="${type}"`;
};
