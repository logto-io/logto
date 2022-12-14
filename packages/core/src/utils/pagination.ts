import type { Request } from 'koa';

type LinkRelationType = 'first' | 'prev' | 'next' | 'last';

export const buildLink = (
  request: Pick<Request, 'origin' | 'path' | 'query'>,
  page: number,
  type: LinkRelationType
): string => {
  const baseUrl = `${request.origin}${request.path}`;

  return `<${baseUrl}?${new URLSearchParams({
    ...request.query,
    page: String(page),
  }).toString()}>; rel="${type}"`;
};
