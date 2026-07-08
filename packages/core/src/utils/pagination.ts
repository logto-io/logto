import type { Request } from 'koa';

type LinkRelationType = 'first' | 'prev' | 'next' | 'last';

export const buildLink = (
  request: Pick<Request, 'URL' | 'path' | 'query'>,
  page: number,
  type: LinkRelationType
): string => {
  /**
   * Use `request.URL.origin` (`protocol://host`) instead of `request.origin` — in Koa 3 the
   * latter returns the request's `Origin` header (or `null`), which would break the Link URLs.
   */
  const baseUrl = `${request.URL.origin}${request.path}`;

  return `<${baseUrl}?${new URLSearchParams({
    ...request.query,
    page: String(page),
  }).toString()}>; rel="${type}"`;
};
