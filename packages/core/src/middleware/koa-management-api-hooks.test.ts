import { type ParameterizedContext } from 'koa';

import type Libraries from '#src/tenants/Libraries.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHookContext, koaManagementApiHooks } from './koa-management-api-hooks.js';

const { jest } = import.meta;

const notToBeCalled = () => {
  throw new Error('Should not be called');
};

describe('koaManagementApiHooks', () => {
  const next = jest.fn();
  const triggerManagementHooks = jest.fn();
  // @ts-expect-error mock
  const mockHooksLibrary: Libraries['hooks'] = {
    triggerManagementHooks,
  };

  it("should do nothing if there's no hook context", async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      header: {},
      appendHookContext: notToBeCalled,
    };
    await koaManagementApiHooks(mockHooksLibrary)(ctx, next);
    expect(triggerManagementHooks).not.toBeCalled();
  });

  it('should trigger management hooks', async () => {
    const ctx: ParameterizedContext<unknown, WithHookContext> = {
      ...createContextWithRouteParameters(),
      header: {},
      appendHookContext: notToBeCalled,
    };
    next.mockImplementation(() => {
      ctx.appendHookContext({ event: 'Role.Created', data: { id: '123' } });
    });

    await koaManagementApiHooks(mockHooksLibrary)(ctx, next);
    expect(triggerManagementHooks).toBeCalledTimes(1);
    expect(triggerManagementHooks).toBeCalledWith(
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
});
