import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { TLSSocket } from 'node:tls';

import type { HttpContext, RequestContext } from '@withtyped/server';
import { RequestMethod } from '@withtyped/server';

export const createHttpContext: (isHttps?: boolean) => HttpContext = (isHttps = false) => {
  const request = new IncomingMessage(isHttps ? new TLSSocket(new Socket()) : new Socket());

  return {
    request,
    response: new ServerResponse(request),
  };
};

type BuildRequestContext = Partial<RequestContext['request']>;

export const buildRequestContext = (
  pathname: string,
  {
    method = RequestMethod.GET,
    headers = {},
    url = new URL(pathname, 'http://localhost'),
    body,
  }: BuildRequestContext = {}
): RequestContext => ({
  request: { method, headers, url, body },
});
