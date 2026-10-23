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

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(request.query)) {
    if (key === 'page' || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else {
      searchParams.append(key, value);
    }
  }
  searchParams.set('page', String(page));

  return `<${baseUrl}?${searchParams.toString()}>; rel="${type}"`;
};
