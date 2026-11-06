import { createServer } from 'node:http';
import { type AddressInfo } from 'node:net';

import { got, HTTPError, RequestError } from 'got';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { normalizeError } from './normalize-error.js';

describe('normalizeError()', () => {
  it('should create a new `Error` object with the stringified error as the message', () => {
    class CustomError extends Error {
      name = 'CustomError';
      foo = 'bar';
    }

    const error = new CustomError('test');
    const normalized = normalizeError(error);
    expect(normalized).not.toBe(error);
    expect(normalized.message).toBe('{"message":"test","name":"CustomError","foo":"bar"}');
  });

  it('should use the string constructor if the error is not an `Error` instance', () => {
    const error = 'test';
    const normalized = normalizeError(error);
    expect(normalized).not.toBe(error);
    expect(normalized.message).toBe('"test"');
  });

  it('should be able to handle circular references and stringify the "stack" key for non-error objects', () => {
    const circularObject: { message: string; circular?: unknown; stack: string } = {
      message: 'test',
      stack: 'foo',
    };
    // eslint-disable-next-line @silverhand/fp/no-mutation
    circularObject.circular = circularObject;

    const normalized = normalizeError(circularObject);
    expect(normalized).not.toBe(circularObject);
    expect(normalized.message).toBe('{"message":"test","stack":"foo","circular":"[Circular ~]"}');
  });

  it('should be able to handle circular error classes', () => {
    class CircularError extends Error {
      name = 'CircularError';
      circular = this;
    }

    const circularError = new CircularError();
    const normalized = normalizeError(circularError);
    expect(normalized).not.toBe(circularError);
    expect(normalized.message).toBe('{"name":"CircularError","circular":"[Circular ~]"}');
  });

  it('should keep `options`, `request`, and `response` of other error types', () => {
    class CustomError extends Error {
      name = 'CustomError';
      options = { foo: 'bar' };
      request = { url: 'test' };
      response = { statusCode: 500, body: 'test' };
    }

    expect(normalizeError(new CustomError('test')).message).toBe(
      '{"message":"test","name":"CustomError","options":{"foo":"bar"},"request":{"url":"test"},"response":{"statusCode":500,"body":"test"}}'
    );
  });
});

describe('normalizeError() with got errors', () => {
  const dummyToken = 'dummy-authorization-value';
  const dummyFormValue = 'dummy-form-value';
  const dummyQueryValue = 'dummy-query-value';
  const upstreamBody = '{"code":"upstream.failure"}';

  const server = createServer((request, response) => {
    if (request.url?.startsWith('/reset')) {
      request.socket.destroy();
      return;
    }

    response.writeHead(500).end(upstreamBody);
  });

  const getBaseUrl = () => {
    const { port } = server.address() as AddressInfo;
    return `http://127.0.0.1:${port}`;
  };

  const postAndCatch = async (path: string) => {
    try {
      return await got.post(`${getBaseUrl()}${path}?token=${dummyQueryValue}`, {
        headers: { authorization: `Bearer ${dummyToken}` },
        form: { secret: dummyFormValue },
        retry: { limit: 0 },
      });
    } catch (error: unknown) {
      return error;
    }
  };

  const expectNoRequestDetails = (message: string) => {
    expect(message).not.toContain(dummyToken);
    expect(message).not.toContain(dummyFormValue);
    expect(message).not.toContain(dummyQueryValue);
    expect(message).not.toContain('"headers"');
    // `timings.phases.request` is a number, so only an object here means the request was serialized.
    expect(message).not.toMatch(/"request":{/);
  };

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  it('should keep the diagnostics of a top-level HTTP error', async () => {
    const error = await postAndCatch('/error');
    expect(error).toBeInstanceOf(HTTPError);

    const { message } = normalizeError(error);
    expectNoRequestDetails(message);
    expect(message).toContain('"message":"Response code 500 (Internal Server Error)"');
    expect(message).toContain('"name":"HTTPError"');
    expect(message).toContain('"code":"ERR_NON_2XX_3XX_RESPONSE"');
    expect(message).toContain(`"options":{"method":"POST","url":"${getBaseUrl()}/error"}`);
    expect(message).toContain(
      `"response":{"statusCode":500,"statusMessage":"Internal Server Error","body":${JSON.stringify(upstreamBody)}}`
    );
  });

  it('should omit request details of an error without a response', async () => {
    const error = await postAndCatch('/reset');
    expect(error).toBeInstanceOf(RequestError);
    expect(error).not.toBeInstanceOf(HTTPError);

    const { message } = normalizeError(error);
    expectNoRequestDetails(message);
    expect(message).toContain('"name":"RequestError"');
    expect(message).toContain('"code":"ECONNRESET"');
    expect(message).toContain(`"options":{"method":"POST","url":"${getBaseUrl()}/reset"}`);
    expect(message).not.toContain('"response"');
  });

  it('should omit request details of an error nested as `cause`', async () => {
    const cause = await postAndCatch('/error');
    expect(cause).toBeInstanceOf(HTTPError);

    const { message } = normalizeError(new Error('wrapper', { cause }));
    expectNoRequestDetails(message);
    expect(message).toContain('"message":"wrapper"');
    expect(message).toContain('"name":"HTTPError"');
    expect(message).toContain(`"options":{"method":"POST","url":"${getBaseUrl()}/error"}`);
    expect(message).toContain('"statusCode":500');
  });
});
