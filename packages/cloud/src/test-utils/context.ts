import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { TLSSocket } from 'node:tls';

import type { HttpContext, RequestContext, RequestMethod } from '@withtyped/server';

import type { WithAuthContext } from '#src/middleware/with-auth.js';

export const createHttpContext: (isHttps?: boolean) => HttpContext = (isHttps = false) => {
  const request = new IncomingMessage(isHttps ? new TLSSocket(new Socket()) : new Socket());

  return {
    request,
    response: new ServerResponse(request),
  };
};

type BuildRequestContext = Partial<RequestContext['request']>;

const splitPath = <Pathname extends string, Path extends `${RequestMethod} ${Pathname}`>(
  path: Path
): [RequestMethod, Pathname] => {
  const [method, ...rest] = path.split(' ');

  // eslint-disable-next-line no-restricted-syntax
  return [method, rest.join('')] as [RequestMethod, Pathname];
};

export const buildRequestContext = <Path extends `${RequestMethod} ${string}`>(
  path: Path,
  { headers = {}, body }: BuildRequestContext = {}
): RequestContext => {
  const [method, pathname] = splitPath(path);

  return {
    request: { method, headers, url: new URL(pathname, 'http://localhost'), body },
  };
};

export const buildRequestAuthContext =
  <Path extends `${RequestMethod} ${string}`>(
    ...args: Parameters<typeof buildRequestContext<Path>>
  ) =>
  (scopes: string[] = []): WithAuthContext => {
    return { ...buildRequestContext(...args), auth: { id: 'foo', scopes } };
  };
