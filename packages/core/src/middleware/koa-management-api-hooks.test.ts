import { managementApiHooksRegistration } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { type ParameterizedContext } from 'koa';

import type Libraries from '#src/tenants/Libraries.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { koaManagementApiHooks, type WithHookContext } from './koa-management-api-hooks.js';

const { jest } = import.meta;

const notToBeCalled = () => {
  throw new Error('Should not be called');
};

describe('koaManagementApiHooks', () => {
  const next = jest.fn();
  const triggerDataHooks = jest.fn();
  // @ts-expect-error mock
  const mockHooksLibrary: Libraries['hooks'] = {
    triggerDataHooks,
  };

  it("should do nothing if there's no hook context", async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      header: {},
      appendDataHookContext: notToBeCalled,
    };
    await koaManagementApiHooks(mockHooksLibrary)(ctx, next);
    expect(triggerDataHooks).not.toBeCalled();
  });

  it('should trigger management hooks', async () => {
    const ctx: ParameterizedContext<unknown, WithHookContext> = {
      ...createContextWithRouteParameters(),
      header: {},
      appendDataHookContext: notToBeCalled,
    };
    next.mockImplementation(() => {
      ctx.appendDataHookContext({ event: 'Role.Created', data: { id: '123' } });
    });

    await koaManagementApiHooks(mockHooksLibrary)(ctx, next);
    expect(triggerDataHooks).toBeCalledTimes(1);
    expect(triggerDataHooks).toBeCalledWith(
      expect.any(ConsoleLog),
      expect.objectContaining({
        contextArray: [
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

      const ctx: ParameterizedContext<unknown, WithHookContext> = {
        ...createContextWithRouteParameters(),
        header: {},
        appendDataHookContext: notToBeCalled,
        method,
        _matchedRoute: route,
        path: route,
        body: { key },
        status: 200,
      };

      await koaManagementApiHooks(mockHooksLibrary)(ctx, next);

      expect(triggerDataHooks).toBeCalledWith(
        expect.any(ConsoleLog),
        expect.objectContaining({
          contextArray: [
            {
              event,
              data: { path: route, method, body: { key }, status: 200 },
            },
          ],
        })
      );
    });
  });
});
