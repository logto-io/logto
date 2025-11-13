import { managementApiHooksRegistration } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { type ParameterizedContext } from 'koa';

import type Libraries from '#src/tenants/Libraries.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import RequestError from '../errors/RequestError/index.js';

import { koaManagementApiHooks, type WithHookContext } from './koa-management-api-hooks.js';

const { jest } = import.meta;

const notToBeCalled = () => {
  throw new Error('Should not be called');
};

describe('koaManagementApiHooks', () => {
  const next = jest.fn();
  const triggerDataHooks = jest.fn();
  const triggerExceptionHooks = jest.fn();
  // @ts-expect-error mock
  const mockHooksLibrary: Libraries['hooks'] = {
    triggerDataHooks,
    triggerExceptionHooks,
  };

  it("should do nothing if there's no hook context", async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      header: {},
      appendDataHookContext: notToBeCalled,
      appendExceptionHookContext: notToBeCalled,
    };
    await koaManagementApiHooks(mockHooksLibrary)(ctx, next);
    expect(triggerDataHooks).not.toBeCalled();
  });

  it('should trigger management hooks', async () => {
    const ctx: ParameterizedContext<unknown, WithHookContext> = {
      ...createContextWithRouteParameters(),
      header: {},
      appendDataHookContext: notToBeCalled,
      appendExceptionHookContext: notToBeCalled,
    };
    next.mockImplementation(() => {
      ctx.appendDataHookContext('Role.Created', { data: { id: '123' } });
    });

    await koaManagementApiHooks(mockHooksLibrary)(ctx, next);
    expect(triggerDataHooks).toBeCalledTimes(1);
    expect(triggerDataHooks).toBeCalledWith(
      expect.any(ConsoleLog),
      expect.objectContaining({
        metadata: { userAgent: ctx.header['user-agent'], ip: ctx.ip },
        dataHookContextArray: [
          {
            event: 'Role.Created',
            data: { id: '123' },
          },
        ],
      })
    );
  });

  describe('auto append pre-registered management API hooks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const events = Object.entries(managementApiHooksRegistration);

    it.each(events)('should append hook context for %s', async (key, event) => {
      const [method, route] = key.split(' ') as [string, string];
      const ctxParams = createContextWithRouteParameters();

      const ctx: ParameterizedContext<unknown, WithHookContext> = {
        ...ctxParams,
        header: {},
        appendDataHookContext: notToBeCalled,
        appendExceptionHookContext: notToBeCalled,
        method,
        _matchedRoute: route,
        path: route,
        response: {
          ...ctxParams.response,
          body: { key },
        },
        status: 200,
      };

      await koaManagementApiHooks(mockHooksLibrary)(ctx, next);

      expect(triggerDataHooks).toBeCalledWith(
        expect.any(ConsoleLog),
        expect.objectContaining({
          dataHookContextArray: [
            {
              event,
              data: { key },
              path: route,
              method,
              params: ctxParams.params,
              matchedRoute: route,
              status: 200,
            },
          ],
        })
      );
    });
  });

  describe('exception hooks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should trigger exception hooks on error', async () => {
      const error = new RequestError({ code: 'session.verification_blocked_too_many_attempts' });
      const ctx: ParameterizedContext<unknown, WithHookContext> = {
        ...createContextWithRouteParameters(),
        header: {},
        appendDataHookContext: notToBeCalled,
        appendExceptionHookContext: notToBeCalled,
      };
      next.mockImplementation(() => {
        ctx.appendExceptionHookContext('Identifier.Lockout', { error });
        throw error;
      });

      await expect(koaManagementApiHooks(mockHooksLibrary)(ctx, next)).rejects.toThrowError(error);

      expect(triggerExceptionHooks).toBeCalledTimes(1);
      expect(triggerExceptionHooks).toBeCalledWith(
        expect.any(ConsoleLog),
        expect.objectContaining({
          metadata: { userAgent: ctx.header['user-agent'], ip: ctx.ip },
          exceptionHookContextArray: [
            {
              error,
              event: 'Identifier.Lockout',
            },
          ],
        })
      );
    });
  });
});
