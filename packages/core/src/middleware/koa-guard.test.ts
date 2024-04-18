import { createMockUtils } from '@logto/shared/esm';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import ServerError from '#src/errors/ServerError/index.js';
import { emptyMiddleware, createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

mockEsm('koa-body', () => ({ koaBody: emptyMiddleware }));
const { default: koaGuard, isGuardMiddleware } = await import('./koa-guard.js');

describe('koaGuardMiddleware', () => {
  describe('isGuardMiddleware', () => {
    it('should return false if name not match', () => {
      const fooMiddleware = jest.fn();
      expect(isGuardMiddleware(fooMiddleware)).toEqual(false);
    });

    it('should return true if name is guardMiddleware & has config property', () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const guardMiddleware = () => ({});

      // eslint-disable-next-line @silverhand/fp/no-mutation
      guardMiddleware.config = {};

      expect(isGuardMiddleware(guardMiddleware)).toBe(true);
    });

    it('should return false if name is name is guardMiddleware but has no config property', () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const guardMiddleware = () => ({});

      expect(isGuardMiddleware(guardMiddleware)).toBe(false);
    });
  });

  describe('guardMiddleware', () => {
    const baseCtx = createContextWithRouteParameters();

    const next = jest.fn();

    const FooGuard = z.object({
      foo: z.string(),
    });

    /** Use to bypass the context type assert. */
    const defaultGuard = { body: undefined, query: undefined, params: undefined, files: undefined };

    it('should throw when body type is invalid', async () => {
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {},
        },
        params: {},
        guard: {
          ...defaultGuard,
          body: { foo: '1' },
        },
      };

      await expect(koaGuard({ body: FooGuard })(ctx, next)).rejects.toThrow();
    });

    it('should throw when query type is invalid', async () => {
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          query: {},
        },
        params: {},
        guard: {
          ...defaultGuard,
          query: { foo: '1' },
        },
      };

      await expect(koaGuard({ query: FooGuard })(ctx, next)).rejects.toThrow();
    });

    it('should throw when files type is invalid', async () => {
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          files: {},
        },
        params: {},
        guard: {
          ...defaultGuard,
          files: { foo: '1' },
        },
      };

      await expect(koaGuard({ files: FooGuard })(ctx, next)).rejects.toThrow();
    });

    it('should throw when response type is invalid', async () => {
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: { foo: '1' },
        },
        params: {},
        body: {},
        guard: {
          ...defaultGuard,
          body: { foo: '1' },
        },
      };

      // @ts-expect-error
      await expect(koaGuard({ body: FooGuard, response: FooGuard })(ctx, next)).rejects.toThrow(
        ServerError
      );
    });

    it('should throw when status is invalid', async () => {
      const ctx = {
        ...baseCtx,
        params: {},
        body: {},
        guard: {},
        response: { status: 301 },
      };

      // @ts-expect-error
      await expect(koaGuard({ status: 200 })(ctx, next)).rejects.toThrow(ServerError);
      // @ts-expect-error
      await expect(koaGuard({ status: [200, 204] })(ctx, next)).rejects.toThrow(ServerError);
    });

    it('should not throw when status is invalid in production', async () => {
      const ctx = {
        ...baseCtx,
        params: {},
        body: {},
        guard: {},
        response: { status: 301 },
      };
      const { isProduction } = EnvSet.values;

      // eslint-disable-next-line @silverhand/fp/no-mutating-assign
      Object.assign(EnvSet.values, { isProduction: true });
      // @ts-expect-error
      await expect(koaGuard({ status: 200 })(ctx, next)).resolves.toBeUndefined();
      // @ts-expect-error
      await expect(koaGuard({ status: [200, 204] })(ctx, next)).resolves.toBeUndefined();
      // eslint-disable-next-line @silverhand/fp/no-mutating-assign
      Object.assign(EnvSet.values, { isProduction });
    });

    it('should throw when inner middleware throws invalid status', async () => {
      const ctx = {
        ...baseCtx,
        params: {},
        body: {},
        guard: {},
        response: {},
      };

      next.mockRejectedValueOnce(new RequestError({ code: 'request.general', status: 400 }));

      // @ts-expect-error
      await expect(koaGuard({ status: 200 })(ctx, next)).rejects.toThrow(ServerError);
    });

    it('should pass when inner middleware throws valid status', async () => {
      const ctx = {
        ...baseCtx,
        params: {},
        body: {},
        guard: {},
        response: {},
      };

      next.mockRejectedValueOnce(new RequestError({ code: 'request.general', status: 400 }));

      // @ts-expect-error
      await expect(koaGuard({ status: [200, 400] })(ctx, next)).rejects.toThrow(RequestError);
    });

    it('should throw when params type is invalid', async () => {
      const ctx = {
        ...baseCtx,
        params: {},
        guard: {
          ...defaultGuard,
          params: { foo: '1' },
        },
      };

      await expect(koaGuard({ params: FooGuard })(ctx, next)).rejects.toThrow();
    });

    it('should pass when all data are valid', async () => {
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            foo: '3',
          },
          query: {
            foo: '2',
          },
        },
        body: { foo: '4' },
        response: { status: 200 },
        params: {
          foo: '1',
        },
        guard: {
          ...defaultGuard,
          params: { foo: '1' },
          body: { foo: '1' },
          query: { foo: '1' },
        },
      };

      await koaGuard({
        params: FooGuard,
        query: FooGuard,
        body: FooGuard,
        response: FooGuard,
        status: [200, 204],
        // @ts-expect-error
      })(ctx, next);
      expect(ctx.body).toHaveProperty('foo', '4');
      expect(ctx.guard.body).toHaveProperty('foo', '3');
      expect(ctx.guard.query).toHaveProperty('foo', '2');
      expect(ctx.guard.params).toHaveProperty('foo', '1');
    });

    it('should fallback to empty object when no body is provided', async () => {
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: undefined,
        },
        guard: {
          ...defaultGuard,
          body: { foo: '1' },
        },
      };

      await koaGuard({ body: z.object({ foo: z.string().optional() }) })(ctx, next);
      expect(ctx.guard.body).toEqual({});
    });
  });
});
