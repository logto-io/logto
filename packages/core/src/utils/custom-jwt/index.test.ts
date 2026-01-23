import { CustomJwtErrorCode } from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import type { HTTPError } from 'got';

import RequestError from '#src/errors/RequestError/index.js';

import { parseAzureFunctionsResponseError, parseCustomJwtResponseError } from './index.js';

describe('parseCustomJwtResponseError', () => {
  it('returns parsed custom JWT error body', async () => {
    const customErrorBody = {
      code: CustomJwtErrorCode.AccessDenied,
      message: 'denied',
    };

    const response = new Response(
      JSON.stringify({
        message: 'outer message',
        error: customErrorBody,
      }),
      { status: 403 }
    );

    const responseError = new ResponseError(response);

    await expect(parseCustomJwtResponseError(responseError)).resolves.toEqual(customErrorBody);
  });

  it('throws RequestError when body is not a standard custom JWT error', async () => {
    const response = new Response(
      JSON.stringify({
        message: 'outer message',
        error: { unexpected: true },
      }),
      { status: 422 }
    );

    const responseError = new ResponseError(response);

    await expect(parseCustomJwtResponseError(responseError)).rejects.toBeInstanceOf(RequestError);
  });
});

describe('parseAzureFunctionsResponseError', () => {
  const baseResponse = {
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    headers: { 'content-type': 'application/json' },
  };

  it('wraps HTTPError with JSON body into ResponseError', async () => {
    const body = { message: 'function failed' };
    const httpError = {
      message: 'Response code 500 (Internal Server Error)',
      response: {
        ...baseResponse,
        body: JSON.stringify(body),
      },
    } as unknown as HTTPError;

    const wrapped = parseAzureFunctionsResponseError(httpError);

    await expect(wrapped.response.json()).resolves.toEqual({
      message: 'function failed',
      error: body,
    });
    expect(wrapped.response.status).toBe(500);
  });

  it('falls back to original message when body is not JSON', async () => {
    const rawBody = '<html>error</html>';
    const httpError = {
      message: 'Response code 500 (Internal Server Error)',
      response: {
        ...baseResponse,
        body: rawBody,
      },
    } as unknown as HTTPError;

    const wrapped = parseAzureFunctionsResponseError(httpError);

    await expect(wrapped.response.json()).resolves.toEqual({
      message: httpError.message,
      error: rawBody,
    });
  });
});
