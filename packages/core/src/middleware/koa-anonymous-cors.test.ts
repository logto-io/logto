import { GlobalValues } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';
import type { RequestMethod } from 'node-mocks-http';

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

const {
  default: koaAnonymousCors,
  localDevelopmentOrigins,
  productionDomainSuffixes,
} = await import('./koa-anonymous-cors.js');

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = async () => {};

const mockContext = (method: RequestMethod, url: string, origin?: string) => {
  const ctx = createMockContext({
    method,
    headers: { origin: origin ?? new URL(url).origin },
  });

  // Mock the path property
  ctx.request.path = '/anonymous-api';

  const setSpy = jest.spyOn(ctx, 'set');

  return [ctx, setSpy] as const;
};

// Helper function to check if CORS headers are set properly
// Following the pattern from koa-cors.test.ts - only check headers that are actually set by @koa/cors
const expectCorsHeaders = (setSpy: jest.SpyInstance, origin: string, shouldHaveHeaders = true) => {
  if (shouldHaveHeaders && origin) {
    expect(setSpy).toHaveBeenCalledWith('Access-Control-Allow-Origin', origin);
    // @koa/cors sets these headers automatically for actual CORS requests
    // but we should check if they are called at all during the middleware execution
    expect(setSpy).toHaveBeenCalled();
  } else {
    expect(setSpy).not.toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      expect.stringMatching('.*')
    );
  }
};

describe('koaAnonymousCors() middleware', () => {
  const envBackup = Object.freeze({ ...process.env });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should allow localhost origins in development', async () => {
      const allowedMethods = 'GET, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx1, setSpy1] = mockContext('GET', 'http://localhost:3000');
      await run(ctx1, noop);
      expectCorsHeaders(setSpy1, 'http://localhost:3000');

      const [ctx2, setSpy2] = mockContext('GET', 'http://127.0.0.1:8080');
      await run(ctx2, noop);
      expectCorsHeaders(setSpy2, 'http://127.0.0.1:8080');
    });

    it('should allow .local domains in development', async () => {
      const allowedMethods = 'POST, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx, setSpy] = mockContext('POST', 'http://test.local:3000');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://test.local:3000');
    });

    it('should allow host.docker.internal in development', async () => {
      const allowedMethods = 'GET, POST, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx, setSpy] = mockContext('GET', 'http://host.docker.internal:3000');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://host.docker.internal:3000');
    });

    it('should reject non-allowed origins in development', async () => {
      const allowedMethods = 'GET, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx] = mockContext('GET', 'https://malicious.com');

      await expect(run(ctx, noop)).rejects.toThrow();
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should allow *.logto.io domains in production', async () => {
      const allowedMethods = 'GET, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx1, setSpy1] = mockContext('GET', 'https://app.logto.io');
      await run(ctx1, noop);
      expectCorsHeaders(setSpy1, 'https://app.logto.io');

      const [ctx2, setSpy2] = mockContext('GET', 'https://test.logto.io');
      await run(ctx2, noop);
      expectCorsHeaders(setSpy2, 'https://test.logto.io');
    });

    it('should allow *.logto.dev domains in production', async () => {
      const allowedMethods = 'POST, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx, setSpy] = mockContext('POST', 'https://staging.logto.dev');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'https://staging.logto.dev');
    });

    it('should reject localhost in production', async () => {
      const allowedMethods = 'GET, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx] = mockContext('GET', 'http://localhost:3000');

      await expect(run(ctx, noop)).rejects.toThrow();
    });

    it('should reject non-allowed domains in production', async () => {
      const allowedMethods = 'GET, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx] = mockContext('GET', 'https://evil.com');

      await expect(run(ctx, noop)).rejects.toThrow();
    });
  });

  describe('in integration test environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.INTEGRATION_TEST = 'true';
    });

    it('should allow localhost in integration test even in production mode', async () => {
      const allowedMethods = 'GET, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx, setSpy] = mockContext('GET', 'http://localhost:3000');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://localhost:3000');
    });
  });

  describe('OPTIONS request handling', () => {
    it('should handle OPTIONS requests automatically with @koa/cors', async () => {
      const allowedMethods = 'GET, POST, OPTIONS';
      const run = koaAnonymousCors(allowedMethods);

      const [ctx] = mockContext('OPTIONS', 'http://localhost:3000');

      // @koa/cors handles OPTIONS requests automatically
      // We just verify that the middleware runs without throwing errors
      await expect(run(ctx, noop)).resolves.not.toThrow();
    });
  });

  describe('exported constants', () => {
    it('should export localDevelopmentOrigins', () => {
      expect(localDevelopmentOrigins).toEqual([
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '[::1]',
        '.local',
        'host.docker.internal',
      ]);
    });

    it('should export productionDomainSuffixes', () => {
      expect(productionDomainSuffixes).toEqual([
        '.logto.io',
        '.logto.dev',
        '.logto-docs.pages.dev',
      ]);
    });
  });
});
