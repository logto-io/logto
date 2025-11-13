import { ConsoleLog } from '@logto/shared';
import { type ParameterizedContext } from 'koa';
import { type Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type Libraries from '#src/tenants/Libraries.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import {
  koaExperienceInteractionHooks,
  type WithExperienceInteractionHooksContext,
} from './koa-experience-interaction-hooks.js';

const { jest } = import.meta;

const notToBeCalled = () => {
  throw new Error('Should not be called');
};

describe('exception hooks', () => {
  const next = jest.fn();
  const triggerInteractionHooks = jest.fn();
  const triggerDataHooks = jest.fn();
  const triggerExceptionHooks = jest.fn();

  const mockHooksLibrary: Libraries = {
    // @ts-expect-error mock
    hooks: {
      triggerInteractionHooks,
      triggerDataHooks,
      triggerExceptionHooks,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger exception hooks on error', async () => {
    const error = new RequestError({ code: 'session.verification_blocked_too_many_attempts' });
    const ctx: ParameterizedContext<
      unknown,
      WithExperienceInteractionHooksContext<WithInteractionDetailsContext>
    > = {
      ...createContextWithRouteParameters(),
      header: {
        'user-agent': 'jest-test',
      },
      interactionDetails: {
        params: {
          client_id: 'foo',
        },
        result: { interactionEvent: 'SignIn' },
      } as unknown as Awaited<ReturnType<Provider['interactionDetails']>>,
      assignInteractionHookResult: notToBeCalled,
      appendDataHookContext: notToBeCalled,
      appendExceptionHookContext: notToBeCalled,
    };

    next.mockImplementation(() => {
      ctx.appendExceptionHookContext('Identifier.Lockout', { error });
      throw error;
    });

    await expect(koaExperienceInteractionHooks(mockHooksLibrary)(ctx, next)).rejects.toThrowError(
      error
    );

    expect(triggerExceptionHooks).toBeCalledTimes(1);
    expect(triggerExceptionHooks).toBeCalledWith(
      expect.any(ConsoleLog),
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        metadata: expect.objectContaining({
          applicationId: 'foo',
          interactionEvent: 'SignIn',
          userAgent: ctx.header['user-agent'],
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        exceptionHookContextArray: expect.arrayContaining([
          {
            error,
            event: 'Identifier.Lockout',
          },
        ]),
      })
    );
  });
});
