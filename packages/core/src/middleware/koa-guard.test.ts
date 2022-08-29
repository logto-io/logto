import { z } from 'zod';

import { emptyMiddleware, createContextWithRouteParameters } from '@/utils/test-utils';

import koaGuard, { isGuardMiddleware } from './koa-guard';

jest.mock('koa-body', () => emptyMiddleware);

describe('koaGuardMiddleware', () => {
  describe('isGuardMiddleware', () => {
    it('isGuardMiddleware return false if name not match', () => {
      const fooMiddleware = jest.fn();
      expect(isGuardMiddleware(fooMiddleware)).toEqual(false);
    });

    it('isGuardMiddleware return true if name is guardMiddleware & has config property', () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const guardMiddleware = () => ({});

      // eslint-disable-next-line @silverhand/fp/no-mutation
      guardMiddleware.config = {};

      expect(isGuardMiddleware(guardMiddleware)).toBe(true);
    });

    it('isGuardMiddleware  return false if name is name is guardMiddleware but has no config property', () => {
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

    // Use to bypass the context type assert
    const defaultGuard = { body: undefined, query: undefined, params: undefined };

    it('invalid body type should throw', async () => {
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

    it('invalid query type should throw', async () => {
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

    it('invalid params type should throw', async () => {
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

    it('valid body, query, params should pass', async () => {
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

      await koaGuard({ params: FooGuard, query: FooGuard, body: FooGuard })(ctx, next);
      expect(ctx.guard.body).toHaveProperty('foo', '3');
      expect(ctx.guard.query).toHaveProperty('foo', '2');
      expect(ctx.guard.params).toHaveProperty('foo', '1');
    });
  });
});
