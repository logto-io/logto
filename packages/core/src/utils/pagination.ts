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
  // Keep every value of repeated query keys (e.g. `search.id=a&search.id=b`), since spreading
  // `request.query` into `URLSearchParams` would join them into a single `a,b` value.
  const searchParams = new URLSearchParams(
    Object.entries(request.query).flatMap(([key, value]) =>
      [value ?? []].flat().map((item) => [key, item])
    )
  );
  searchParams.set('page', String(page));

  return `<${baseUrl}?${searchParams.toString()}>; rel="${type}"`;
};
