import { InteractionHookEvent } from '@logto/schemas';
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

type ExperienceInteractionHooksTestContext = ParameterizedContext<
  unknown,
  WithExperienceInteractionHooksContext<WithInteractionDetailsContext>
>;

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
    const ctx: ExperienceInteractionHooksTestContext = {
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
      assignReleaseOnSuccessInteractionHookResult: notToBeCalled,
      assignReleaseAnywayInteractionHookResult: notToBeCalled,
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

    expect(triggerInteractionHooks).not.toBeCalled();
    expect(triggerDataHooks).not.toBeCalled();
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

  it('should trigger interaction hooks on error if results were assigned', async () => {
    const error = new RequestError({ code: 'session.mfa.require_mfa_verification', status: 403 });
    const ctx: ExperienceInteractionHooksTestContext = {
      ...createContextWithRouteParameters(),
      header: {
        'user-agent': 'jest-test',
      },
      interactionDetails: {
        params: {
          client_id: 'foo',
        },
        jti: 'some-session',
        result: { interactionEvent: 'SignIn' },
      } as unknown as Awaited<ReturnType<Provider['interactionDetails']>>,
      assignReleaseOnSuccessInteractionHookResult: notToBeCalled,
      assignReleaseAnywayInteractionHookResult: notToBeCalled,
      appendDataHookContext: notToBeCalled,
      appendExceptionHookContext: notToBeCalled,
    };

    next.mockImplementation(() => {
      ctx.assignReleaseAnywayInteractionHookResult({
        event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
        payload: {
          adaptiveMfaResult: {
            requiresMfa: true,
            triggeredRules: [{ rule: 'untrusted_ip' }],
          },
        },
        userId: 'user-id',
      });
      throw error;
    });

    await expect(koaExperienceInteractionHooks(mockHooksLibrary)(ctx, next)).rejects.toThrowError(
      error
    );

    expect(triggerInteractionHooks).toBeCalledTimes(1);

    const interactionHookCall = triggerInteractionHooks.mock.calls[0] as [
      ConsoleLog,
      {
        metadata: {
          applicationId?: string;
          interactionEvent: string;
          sessionId?: string;
          userAgent?: string;
        };
        interactionHookResults: Array<{ event?: InteractionHookEvent; userId: string }>;
      },
    ];

    expect(interactionHookCall[1].metadata).toEqual(
      expect.objectContaining({
        applicationId: 'foo',
        interactionEvent: 'SignIn',
        sessionId: 'some-session',
        userAgent: ctx.header['user-agent'],
      })
    );
    expect(interactionHookCall[1].interactionHookResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
          userId: 'user-id',
        }),
      ])
    );
  });

  it('should only trigger release-anyway interaction hooks on error', async () => {
    const error = new RequestError({ code: 'session.mfa.require_mfa_verification', status: 403 });
    const ctx: ExperienceInteractionHooksTestContext = {
      ...createContextWithRouteParameters(),
      header: {
        'user-agent': 'jest-test',
      },
      interactionDetails: {
        params: {
          client_id: 'foo',
        },
        jti: 'some-session',
        result: { interactionEvent: 'SignIn' },
      } as unknown as Awaited<ReturnType<Provider['interactionDetails']>>,
      assignReleaseOnSuccessInteractionHookResult: notToBeCalled,
      assignReleaseAnywayInteractionHookResult: notToBeCalled,
      appendDataHookContext: notToBeCalled,
      appendExceptionHookContext: notToBeCalled,
    };

    next.mockImplementation(() => {
      ctx.assignReleaseOnSuccessInteractionHookResult({ userId: 'success-only-user' });
      ctx.assignReleaseAnywayInteractionHookResult({
        event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
        payload: {
          adaptiveMfaResult: {
            requiresMfa: true,
            triggeredRules: [{ rule: 'untrusted_ip' }],
          },
        },
        userId: 'adaptive-user',
      });
      throw error;
    });

    await expect(koaExperienceInteractionHooks(mockHooksLibrary)(ctx, next)).rejects.toThrowError(
      error
    );

    expect(triggerInteractionHooks).toBeCalledTimes(1);

    const interactionHookCall = triggerInteractionHooks.mock.calls[0] as [
      ConsoleLog,
      {
        interactionHookResults: Array<{ event?: InteractionHookEvent; userId: string }>;
      },
    ];

    expect(interactionHookCall[1].interactionHookResults).toEqual([
      expect.objectContaining({
        event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
        userId: 'adaptive-user',
      }),
    ]);
  });

  it('should release success-only and release-anyway interaction hooks separately on success', async () => {
    const ctx: ExperienceInteractionHooksTestContext = {
      ...createContextWithRouteParameters(),
      header: {
        'user-agent': 'jest-test',
      },
      interactionDetails: {
        params: {
          client_id: 'foo',
        },
        jti: 'some-session',
        result: { interactionEvent: 'SignIn' },
      } as unknown as Awaited<ReturnType<Provider['interactionDetails']>>,
      assignReleaseOnSuccessInteractionHookResult: notToBeCalled,
      assignReleaseAnywayInteractionHookResult: notToBeCalled,
      appendDataHookContext: notToBeCalled,
      appendExceptionHookContext: notToBeCalled,
    };

    next.mockImplementation(() => {
      ctx.assignReleaseOnSuccessInteractionHookResult({ userId: 'success-only-user' });
      ctx.assignReleaseAnywayInteractionHookResult({
        event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
        payload: {
          adaptiveMfaResult: {
            requiresMfa: true,
            triggeredRules: [{ rule: 'untrusted_ip' }],
          },
        },
        userId: 'adaptive-user',
      });
    });

    await expect(
      koaExperienceInteractionHooks(mockHooksLibrary)(ctx, next)
    ).resolves.toBeUndefined();

    expect(triggerInteractionHooks).toBeCalledTimes(2);
    expect(triggerInteractionHooks.mock.calls[0]?.[1].interactionHookResults).toEqual([
      expect.objectContaining({ userId: 'success-only-user' }),
    ]);
    expect(triggerInteractionHooks.mock.calls[1]?.[1].interactionHookResults).toEqual([
      expect.objectContaining({
        event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
        userId: 'adaptive-user',
      }),
    ]);
  });
});
