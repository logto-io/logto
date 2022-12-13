/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
import stream from 'stream';
import { URL } from 'url';

import type { Context } from 'koa';
import Koa from 'koa';
import type { RequestMethod } from 'node-mocks-http';
import httpMocks from 'node-mocks-http';

import type { MockCookies } from './create-mock-cookies.js';
import createMockCookies from './create-mock-cookies.js';

const { jest } = import.meta;

export type Dictionary<T> = Record<string, T>;

export type MockContext = {
  cookies: MockCookies;
  request: Context['request'] & {
    body?: any;
    rawBody?: string;
    session?: any;
  };
} & Context;

export type Options<CustomProperties extends Record<string, unknown>, RequestBody = undefined> = {
  url?: string;
  method?: RequestMethod;
  statusCode?: number;
  session?: Dictionary<any>;
  headers?: Dictionary<string>;
  cookies?: Dictionary<string>;
  state?: Dictionary<any>;
  encrypted?: boolean;
  host?: string;
  requestBody?: RequestBody;
  rawBody?: string;
  throw?: Function;
  redirect?: Function;
  customProperties?: CustomProperties;
};

export default function createContext<
  CustomProperties extends Record<string, unknown>,
  RequestBody = undefined
>(options: Options<CustomProperties, RequestBody> = {}) {
  const app = new Koa();

  const {
    cookies,
    method,
    statusCode,
    session,
    requestBody,
    rawBody = '',
    url = '',
    host = 'test.com',
    encrypted = false,
    throw: throwFunction = jest.fn(),
    redirect = jest.fn(),
    headers = {},
    state = {},
    customProperties = {},
  } = options;

  const extensions = {
    ...customProperties,
    throw: throwFunction,
    session,
    redirect,
    state,
  };

  const protocolFallback = encrypted ? 'https' : 'http';
  const urlObject = new URL(url, `${protocolFallback}://${host}`);

  const request = httpMocks.createRequest({
    url: urlObject.toString(),
    method,
    statusCode,
    session,
    headers: {
      // Koa determines protocol based on the `Host` header.
      Host: urlObject.host,
      ...headers,
    },
  });

  // Some functions we call in the implementations will perform checks for `req.encrypted`, which delegates to the socket.
  // MockRequest doesn't set a fake socket itself, so we create one here.
  request.socket = new stream.Duplex() as any;
  Object.defineProperty(request.socket, 'encrypted', {
    writable: false,
    value: urlObject.protocol === 'https:',
  });

  const res = httpMocks.createResponse();

  // Koa sets a default status code of 404, not the node default of 200
  // https://github.com/koajs/koa/blob/master/docs/api/response.md#responsestatus
  res.statusCode = 404;

  // This is to get around an odd behavior in the `cookies` library, where if `res.set` is defined, it will use an internal
  // node function to set headers, which results in them being set in the wrong place.

  res.set = undefined as any;

  const context = app.createContext(request, res) as MockContext & CustomProperties;
  Object.assign(context, extensions);
  context.cookies = createMockCookies(cookies);

  // Ctx.request.body is a common enough custom property for middleware to add that it's handy to just support it by default
  context.request.body = requestBody;
  context.request.rawBody = rawBody;

  return context as Context;
}
/* eslint-enable */
