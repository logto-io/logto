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

    it('should report every issue when under the cap', async () => {
      const guard = z.object({ foo: z.string().min(3), bar: z.number().min(3) }).strict();
      const body = { foo: 'a', bar: 1, baz: true };
      const ctx = {
        ...baseCtx,
        request: { ...baseCtx.request, body },
        params: {},
        guard: { ...defaultGuard, body: { foo: '1', bar: 3 } },
      };

      await expect(koaGuard({ body: guard })(ctx, next)).rejects.toMatchObject({
        code: 'guard.invalid_input',
        data: { issues: guard.safeParse(body).error?.issues },
      });
    });

    it('should stop parsing after the first 100 issues', async () => {
      const isValidId = jest.fn(() => false);
      const guard = z.object({ ids: z.unknown().refine(isValidId, 'invalid id').array() });
      const body = { ids: Array.from({ length: 10_000 }, () => 1) };
      const expectedIssues = guard.safeParse(body).error?.issues.slice(0, 100);
      isValidId.mockClear();
      const ctx = {
        ...baseCtx,
        request: { ...baseCtx.request, body },
        params: {},
        guard: { ...defaultGuard, body: { ids: [] } },
      };

      await expect(koaGuard({ body: guard })(ctx, next)).rejects.toMatchObject({
        code: 'guard.invalid_input',
        data: { issues: expectedIssues },
      });
      expect(isValidId).toHaveBeenCalledTimes(101);
    });

    it('should count every issue a union branch reports at once', async () => {
      const guard = z.object({
        foo: z.string(),
        values: z.union([z.string().min(5).email(), z.number()]).array(),
      });
      const body = { foo: 1, values: Array.from({ length: 60 }, () => 'ab') };
      const ctx = {
        ...baseCtx,
        request: { ...baseCtx.request, body },
        params: {},
        guard: { ...defaultGuard, body: { foo: '1', values: [] } },
      };

      await expect(koaGuard({ body: guard })(ctx, next)).rejects.toMatchObject({
        code: 'guard.invalid_input',
        data: { issues: guard.safeParse(body).error?.issues.slice(0, 100) },
      });
    });

    it('should not count failed union branches toward the cap', async () => {
      const guard = z.object({ values: z.union([z.string(), z.number()]).array() });
      const body = { values: Array.from({ length: 1000 }, (_, index) => index) };
      const ctx = {
        ...baseCtx,
        request: { ...baseCtx.request, body },
        params: {},
        guard: { ...defaultGuard, body: { values: [] } },
      };

      await koaGuard({ body: guard })(ctx, next);
      expect(ctx.guard.body).toEqual(body);
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

    it('should normalize a scalar single file back to an array', async () => {
      /**
       * `koa-body@8` unwraps single-element file arrays into scalars, while our file guards
       * expect one array per field — `koaGuard` re-wraps scalars before parsing.
       */
      const file = { size: 100, filepath: '/tmp/upload' };
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          files: { file },
        },
        params: {},
        guard: {
          ...defaultGuard,
        },
      };

      await koaGuard({
        files: z.object({ file: z.object({ size: z.number() }).array().min(1).max(1) }),
        // @ts-expect-error mimic koa-body@8's scalar file output; the guard only reads `size`
      })(ctx, next);
      expect(ctx.guard.files).toEqual({ file: [{ size: 100 }] });
    });
  });
});
