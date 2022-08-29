import { Request } from 'koa';
import { stringify } from 'query-string';

type LinkRelationType = 'first' | 'prev' | 'next' | 'last';

export const buildLink = (
  request: Pick<Request, 'origin' | 'path' | 'query'>,
  page: number,
  type: LinkRelationType
): string => {
  const baseUrl = `${request.origin}${request.path}`;

  return `<${baseUrl}?${stringify({ ...request.query, page })}>; rel="${type}"`;
};
