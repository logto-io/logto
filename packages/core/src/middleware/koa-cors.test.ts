import { createMockUtils } from '@logto/shared/esm';
import type { RequestMethod } from 'node-mocks-http';

import GlobalValues from '#src/env-set/GlobalValues.js';
import UrlSet from '#src/env-set/UrlSet.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

const { jest } = import.meta;

const { mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    get values() {
      return new GlobalValues();
    },
  },
}));

const { default: koaCors } = await import('./koa-cors.js');

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = async () => {};

const mockContext = (method: RequestMethod, url: string) => {
  const ctx = createMockContext({ method, headers: { origin: new URL(url).origin } });

  const setSpy = jest.spyOn(ctx, 'set');

  return [ctx, setSpy] as const;
};

const expectCorsHeaders = (setSpy: jest.SpyInstance, origin: string) => {
  if (origin) {
    expect(setSpy).toHaveBeenCalledWith('Access-Control-Expose-Headers', '*');
    expect(setSpy).toHaveBeenCalledWith('Access-Control-Allow-Origin', origin);
  } else {
    expect(setSpy).not.toHaveBeenCalledWith(
      'Access-Control-Expose-Headers',
      expect.stringMatching('.*')
    );
    expect(setSpy).not.toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      expect.stringMatching('.*')
    );
  }
};

describe('koaCors() middleware', () => {
  const envBackup = Object.freeze({ ...process.env });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('should set proper CORS response headers for a single URL Set', async () => {
    const endpoint = 'https://logto.io';
    process.env.ENDPOINT = endpoint;
    process.env.NODE_ENV = 'dev';
    const urlSet = new UrlSet(false, 3001);
    const run = koaCors(urlSet);

    const [ctx1, setSpy1] = mockContext('GET', endpoint + '/api');
    await run(ctx1, noop);
    expectCorsHeaders(setSpy1, endpoint);

    const [ctx2, setSpy2] = mockContext('GET', 'http://localhost:3001/api');
    await run(ctx2, noop);
    expectCorsHeaders(setSpy2, 'http://localhost:3001');
  });

  it('should set proper CORS response headers for multiple URL Sets', async () => {
    const endpoint = 'https://logto.io';
    const adminEndpoint = 'https://logto.admin';

    process.env.ENDPOINT = endpoint;
    process.env.ADMIN_ENDPOINT = adminEndpoint;
    process.env.NODE_ENV = 'dev';
    const run = koaCors(new UrlSet(false, 3001), new UrlSet(true, 3002, 'ADMIN_'));

    const [ctx1, setSpy1] = mockContext('PUT', 'https://localhost:3002/api');
    await run(ctx1, noop);
    expectCorsHeaders(setSpy1, 'https://localhost:3002');

    const [ctx2, setSpy2] = mockContext('POST', adminEndpoint + '/api');
    await run(ctx2, noop);
    expectCorsHeaders(setSpy2, adminEndpoint);
  });

  it('should set CORS response headers for localhost in production when endpoint is unavailable', async () => {
    process.env.ENDPOINT = undefined;
    process.env.NODE_ENV = 'production';
    const urlSet = new UrlSet(true, 3002);
    const run = koaCors(urlSet);

    const [ctx, setSpy] = mockContext('POST', 'https://localhost:3002/api');
    await run(ctx, noop);
    expectCorsHeaders(setSpy, 'https://localhost:3002');
  });

  it('should not to set CORS response headers for localhost in production when endpoint is available', async () => {
    const endpoint = 'https://logto.io';
    process.env.ENDPOINT = endpoint;
    process.env.NODE_ENV = 'production';
    const urlSet = new UrlSet(false, 3001);
    const run = koaCors(urlSet);

    const [ctx, setSpy] = mockContext('DELETE', 'http://localhost:3001/api');
    await run(ctx, noop);
    expectCorsHeaders(setSpy, '');
  });
});
