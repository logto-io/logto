// eslint-disable-next-line no-restricted-imports
import { stringify } from 'querystring';

import { Request } from 'koa';

type LinkRelationType = 'first' | 'prev' | 'next' | 'last';

export const buildLink = (
  request: Pick<Request, 'origin' | 'path' | 'query'>,
  page: number,
  type: LinkRelationType
): string => {
  const baseUrl = `${request.origin}${request.path}`;
  return `<${baseUrl}?${stringify({ ...request.query, page })}>; rel="${type}"`;
};
