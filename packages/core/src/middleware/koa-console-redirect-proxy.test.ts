import { ossConsolePath } from '@logto/schemas';
import type { Next } from 'koa';

import { MockQueries } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaConsoleRedirectProxy from './koa-console-redirect-proxy.js';

const { jest } = import.meta;

const hasActiveUsers = jest.fn();
const queries = new MockQueries({
  users: { hasActiveUsers },
});
const next: Next = jest.fn(); // Mock the behaviour of next

// tests for the koaConsoleRedirectProxy function.
describe('koaConsoleRedirectProxy()', () => {
  afterEach(() => {
    // Performed after each test
    jest.clearAllMocks();
  });

  it("should redirect with 'ossConsolePath/welcome if ctx.path is '/' or '/welcome' AND hasUser is false'", async () => {
    const ctx = createContextWithRouteParameters({
      url: '/',
    });
    hasActiveUsers.mockResolvedValue(false); // Set a return mocked value for hasActiveUsers

    await koaConsoleRedirectProxy(queries)(ctx, next);
    expect(next).not.toHaveBeenCalled();
    expect(ctx.redirect).toHaveBeenCalledWith(`${ossConsolePath}/welcome`);
  });
  it("should redirect with 'ossConsolePath/welcome if ctx.path is '/' or '/welcome' AND hasUser is true", async () => {
    const ctx = createContextWithRouteParameters({
      url: '/',
    });
    hasActiveUsers.mockResolvedValue(true); // Set a return mocked value for hasActiveUsers

    await koaConsoleRedirectProxy(queries)(ctx, next);
    expect(next).not.toHaveBeenCalled();
    expect(ctx.redirect).toHaveBeenCalledWith(`${ossConsolePath}`);
  });
  it("should not redirect if ctx.path is '/some_path' AND hasUser is false", async () => {
    const ctx = createContextWithRouteParameters({
      url: '/some_path',
    });
    hasActiveUsers.mockResolvedValue(false); // Set a return mocked value for hasActiveUsers

    await koaConsoleRedirectProxy(queries)(ctx, next);
    expect(next).toHaveBeenCalled();
    expect(ctx.redirect).not.toHaveBeenCalled();
  });
});
