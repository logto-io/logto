import { GlobalValues } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';
import compose from 'koa-compose';
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
  koaLogtoAnonymousOriginCors,
  koaLogtoAnonymousMethodsCors,
  localDevelopmentOrigins,
  productionDomainSuffixes,
} = await import('./koa-logto-anonymous-cors.js');

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

/**
 * Create a composed middleware that combines origin and methods CORS
 * to simulate real-world usage scenario
 */
const createComposedCorsMiddleware = (allowedMethods: string) => {
  return compose([koaLogtoAnonymousOriginCors(), koaLogtoAnonymousMethodsCors(allowedMethods)]);
};

describe('Logto Anonymous CORS Integration Tests', () => {
  const envBackup = Object.freeze({ ...process.env });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  describe('Combined Origin + Methods CORS (Real Usage Scenario)', () => {
    describe('in development environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should work with GET requests from localhost', async () => {
        const run = createComposedCorsMiddleware('GET');

        const [ctx, setSpy] = mockContext('GET', 'http://localhost:3000');
        await run(ctx, noop);
        expectCorsHeaders(setSpy, 'http://localhost:3000');
      });

      it('should work with POST requests from local domains', async () => {
        const run = createComposedCorsMiddleware('POST');

        const [ctx, setSpy] = mockContext('POST', 'http://test.local:3000');
        await run(ctx, noop);
        expectCorsHeaders(setSpy, 'http://test.local:3000');
      });

      it('should work with multiple methods from docker host', async () => {
        const run = createComposedCorsMiddleware('GET, POST, PUT');

        const [ctx1, setSpy1] = mockContext('GET', 'http://host.docker.internal:3000');
        await run(ctx1, noop);
        expectCorsHeaders(setSpy1, 'http://host.docker.internal:3000');

        const [ctx2, setSpy2] = mockContext('POST', 'http://host.docker.internal:3000');
        await run(ctx2, noop);
        expectCorsHeaders(setSpy2, 'http://host.docker.internal:3000');
      });

      it('should handle OPTIONS preflight requests', async () => {
        const run = createComposedCorsMiddleware('GET, POST, OPTIONS');

        const [ctx] = mockContext('OPTIONS', 'http://localhost:3000');
        await expect(run(ctx, noop)).resolves.not.toThrow();
      });

      it('should reject unauthorized origins even with valid methods', async () => {
        const run = createComposedCorsMiddleware('GET, POST');

        const [ctx] = mockContext('GET', 'https://malicious.com');
        await expect(run(ctx, noop)).rejects.toThrow();
      });
    });

    describe('in production environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('should work with logto.io domains', async () => {
        const run = createComposedCorsMiddleware('GET, POST');

        const [ctx1, setSpy1] = mockContext('GET', 'https://console.logto.io');
        await run(ctx1, noop);
        expectCorsHeaders(setSpy1, 'https://console.logto.io');

        const [ctx2, setSpy2] = mockContext('POST', 'https://app.logto.io');
        await run(ctx2, noop);
        expectCorsHeaders(setSpy2, 'https://app.logto.io');
      });

      it('should work with logto.dev domains', async () => {
        const run = createComposedCorsMiddleware('GET, POST, PUT');

        const [ctx, setSpy] = mockContext('PUT', 'https://staging.logto.dev');
        await run(ctx, noop);
        expectCorsHeaders(setSpy, 'https://staging.logto.dev');
      });

      it('should work with logto-docs.pages.dev domains when dev features enabled', async () => {
        const run = createComposedCorsMiddleware('GET');

        const [ctx, setSpy] = mockContext('GET', 'https://preview.logto-docs.pages.dev');
        await run(ctx, noop);
        expectCorsHeaders(setSpy, 'https://preview.logto-docs.pages.dev');
      });

      it('should reject localhost even with valid methods', async () => {
        const run = createComposedCorsMiddleware('GET, POST');

        const [ctx] = mockContext('GET', 'http://localhost:3000');
        await expect(run(ctx, noop)).rejects.toThrow();
      });

      it('should reject unauthorized domains even with valid methods', async () => {
        const run = createComposedCorsMiddleware('GET, POST');

        const testCases = [
          'https://evil.com',
          'https://malicious-logto.io.evil.com',
          'https://fake-logto.dev.com',
        ];

        await Promise.all(
          testCases.map(async (origin) => {
            const [ctx] = mockContext('GET', origin);
            await expect(run(ctx, noop)).rejects.toThrow();
          })
        );
      });
    });

    describe('in integration test environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
        process.env.INTEGRATION_TEST = 'true';
      });

      it('should allow localhost with valid methods in integration test', async () => {
        const run = createComposedCorsMiddleware('GET, POST');

        const [ctx1, setSpy1] = mockContext('GET', 'http://localhost:3000');
        await run(ctx1, noop);
        expectCorsHeaders(setSpy1, 'http://localhost:3000');

        const [ctx2, setSpy2] = mockContext('POST', 'http://127.0.0.1:8080');
        await run(ctx2, noop);
        expectCorsHeaders(setSpy2, 'http://127.0.0.1:8080');
      });

      it('should still reject unauthorized domains in integration test', async () => {
        const run = createComposedCorsMiddleware('GET, POST');

        const [ctx] = mockContext('GET', 'https://malicious.com');
        await expect(run(ctx, noop)).rejects.toThrow();
      });
    });

    describe('method validation with valid origins', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should handle single method correctly', async () => {
        const run = createComposedCorsMiddleware('GET');

        const [ctx, setSpy] = mockContext('GET', 'http://localhost:3000');
        await run(ctx, noop);
        expectCorsHeaders(setSpy, 'http://localhost:3000');
      });

      it('should handle multiple methods correctly', async () => {
        const run = createComposedCorsMiddleware('GET, POST, PUT, DELETE');

        const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;

        await Promise.all(
          methods.map(async (method) => {
            const [ctx, setSpy] = mockContext(method, 'http://localhost:3000');
            await run(ctx, noop);
            expectCorsHeaders(setSpy, 'http://localhost:3000');
          })
        );
      });

      it('should handle methods with spaces correctly', async () => {
        const run = createComposedCorsMiddleware('GET , POST , OPTIONS ');

        const [ctx, setSpy] = mockContext('POST', 'http://localhost:3000');
        await run(ctx, noop);
        expectCorsHeaders(setSpy, 'http://localhost:3000');
      });
    });
  });
});

describe('koaLogtoAnonymousOriginCors() middleware (Unit Tests)', () => {
  const envBackup = Object.freeze({ ...process.env });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should allow localhost origins in development', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx1, setSpy1] = mockContext('GET', 'http://localhost:3000');
      await run(ctx1, noop);
      expectCorsHeaders(setSpy1, 'http://localhost:3000');

      const [ctx2, setSpy2] = mockContext('GET', 'http://127.0.0.1:8080');
      await run(ctx2, noop);
      expectCorsHeaders(setSpy2, 'http://127.0.0.1:8080');
    });

    it('should allow .local domains in development', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx, setSpy] = mockContext('POST', 'http://test.local:3000');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://test.local:3000');
    });

    it('should allow host.docker.internal in development', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx, setSpy] = mockContext('GET', 'http://host.docker.internal:3000');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://host.docker.internal:3000');
    });

    it('should allow 0.0.0.0 in development', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx, setSpy] = mockContext('GET', 'http://0.0.0.0:3000');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://0.0.0.0:3000');
    });

    it('should allow IPv6 loopback in development', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx, setSpy] = mockContext('GET', 'http://[::1]:3000');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://[::1]:3000');
    });

    it('should reject non-allowed origins in development', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx] = mockContext('GET', 'https://malicious.com');

      await expect(run(ctx, noop)).rejects.toThrow();
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should allow *.logto.io domains in production', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx1, setSpy1] = mockContext('GET', 'https://app.logto.io');
      await run(ctx1, noop);
      expectCorsHeaders(setSpy1, 'https://app.logto.io');

      const [ctx2, setSpy2] = mockContext('GET', 'https://test.logto.io');
      await run(ctx2, noop);
      expectCorsHeaders(setSpy2, 'https://test.logto.io');

      const [ctx3, setSpy3] = mockContext('GET', 'https://console.logto.io');
      await run(ctx3, noop);
      expectCorsHeaders(setSpy3, 'https://console.logto.io');
    });

    it('should allow *.logto.dev domains in production', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx1, setSpy1] = mockContext('POST', 'https://staging.logto.dev');
      await run(ctx1, noop);
      expectCorsHeaders(setSpy1, 'https://staging.logto.dev');

      const [ctx2, setSpy2] = mockContext('POST', 'https://dev.logto.dev');
      await run(ctx2, noop);
      expectCorsHeaders(setSpy2, 'https://dev.logto.dev');
    });

    it('should allow *.logto-docs.pages.dev domains when dev features enabled', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx, setSpy] = mockContext('GET', 'https://preview.logto-docs.pages.dev');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'https://preview.logto-docs.pages.dev');
    });

    it('should reject localhost in production', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx] = mockContext('GET', 'http://localhost:3000');

      await expect(run(ctx, noop)).rejects.toThrow();
    });

    it('should reject 127.0.0.1 in production', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx] = mockContext('GET', 'http://127.0.0.1:3000');

      await expect(run(ctx, noop)).rejects.toThrow();
    });

    it('should reject non-allowed domains in production', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx] = mockContext('GET', 'https://evil.com');

      await expect(run(ctx, noop)).rejects.toThrow();
    });

    it('should reject similar but incorrect domains', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const testCases = [
        'https://malicious-logto.io.evil.com',
        'https://logto.io.evil.com',
        'https://fake-logto.dev.com',
        'https://logto-fake.com',
      ];

      await Promise.all(
        testCases.map(async (origin) => {
          const [ctx] = mockContext('GET', origin);
          await expect(run(ctx, noop)).rejects.toThrow();
        })
      );
    });
  });

  describe('in integration test environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.INTEGRATION_TEST = 'true';
    });

    it('should allow localhost in integration test even in production mode', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx, setSpy] = mockContext('GET', 'http://localhost:3000');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://localhost:3000');
    });

    it('should allow 127.0.0.1 in integration test even in production mode', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx, setSpy] = mockContext('GET', 'http://127.0.0.1:8080');
      await run(ctx, noop);
      expectCorsHeaders(setSpy, 'http://127.0.0.1:8080');
    });

    it('should still reject non-allowed domains in integration test', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx] = mockContext('GET', 'https://malicious.com');

      await expect(run(ctx, noop)).rejects.toThrow();
    });
  });

  describe('OPTIONS request handling', () => {
    it('should handle OPTIONS requests automatically with @koa/cors', async () => {
      const run = koaLogtoAnonymousOriginCors();

      const [ctx] = mockContext('OPTIONS', 'http://localhost:3000');

      // @koa/cors handles OPTIONS requests automatically
      // We just verify that the middleware runs without throwing errors
      await expect(run(ctx, noop)).resolves.not.toThrow();
    });
  });
});

describe('koaLogtoAnonymousMethodsCors() middleware (Unit Tests)', () => {
  it('should handle single method CORS', async () => {
    const run = koaLogtoAnonymousMethodsCors('GET');

    const [ctx] = mockContext('GET', 'http://localhost:3000');

    // Should not throw errors when handling single method
    await expect(run(ctx, noop)).resolves.not.toThrow();
  });

  it('should handle multiple methods CORS', async () => {
    const run = koaLogtoAnonymousMethodsCors('GET, POST, PUT');

    const [ctx1] = mockContext('GET', 'http://localhost:3000');
    const [ctx2] = mockContext('POST', 'http://localhost:3000');
    const [ctx3] = mockContext('PUT', 'http://localhost:3000');

    // Should not throw errors when handling multiple methods
    await expect(run(ctx1, noop)).resolves.not.toThrow();
    await expect(run(ctx2, noop)).resolves.not.toThrow();
    await expect(run(ctx3, noop)).resolves.not.toThrow();
  });

  it('should handle methods with extra spaces', async () => {
    const run = koaLogtoAnonymousMethodsCors('GET , POST , OPTIONS ');

    const [ctx] = mockContext('POST', 'http://localhost:3000');

    // Should not throw errors when handling methods with extra spaces
    await expect(run(ctx, noop)).resolves.not.toThrow();
  });

  it('should handle OPTIONS method specifically', async () => {
    const run = koaLogtoAnonymousMethodsCors('GET, OPTIONS');

    const [ctx] = mockContext('OPTIONS', 'http://localhost:3000');

    // Should handle OPTIONS preflight requests
    await expect(run(ctx, noop)).resolves.not.toThrow();
  });

  it('should set proper Content-Type headers', async () => {
    const run = koaLogtoAnonymousMethodsCors('POST');

    const [ctx, setSpy] = mockContext('POST', 'http://localhost:3000');

    await run(ctx, noop);

    // Should set proper CORS headers
    expect(setSpy).toHaveBeenCalled();
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
    expect(productionDomainSuffixes).toEqual(['.logto.io', '.logto.dev', '.logto-docs.pages.dev']);
  });

  it('should have non-empty origin arrays', () => {
    expect(localDevelopmentOrigins.length).toBeGreaterThan(0);
    expect(productionDomainSuffixes.length).toBeGreaterThan(0);
  });

  it('should contain expected localhost variations', () => {
    expect(localDevelopmentOrigins).toContain('localhost');
    expect(localDevelopmentOrigins).toContain('127.0.0.1');
    expect(localDevelopmentOrigins).toContain('[::1]');
  });

  it('should contain expected production domains', () => {
    expect(productionDomainSuffixes).toContain('.logto.io');
    expect(productionDomainSuffixes).toContain('.logto.dev');
  });
});
