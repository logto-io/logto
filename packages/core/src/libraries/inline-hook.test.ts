import { appInsights } from '@logto/app-insights/node';
import { LogtoInlineHookKey } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import { getInlineHookExecutionErrorPolicyDecision, InlineHookLibrary } from './inline-hook.js';
import type {
  InlineHookExecutionErrorFallback,
  InlineHookExecutionErrorPolicyDecision,
} from './inline-hook.js';
import type { LogtoConfigLibrary } from './logto-config.js';
import type { SubscriptionLibrary } from './subscription.js';

const { jest } = import.meta;

const getInlineHook = jest.fn() as jest.MockedFunction<LogtoConfigLibrary['getInlineHook']>;
const getSubscriptionData = jest.fn() as jest.MockedFunction<
  SubscriptionLibrary['getSubscriptionData']
>;

const createLibrary = (tenantId = 'tenant_id') =>
  new InlineHookLibrary(
    tenantId,
    { getInlineHook } as unknown as LogtoConfigLibrary,
    { getSubscriptionData } as unknown as SubscriptionLibrary
  );

const originalIsCloud = EnvSet.values.isCloud;

describe('InlineHookLibrary', () => {
  const library = createLibrary();

  beforeEach(() => {
    getSubscriptionData.mockResolvedValue({
      quota: {
        inlineHooksEnabled: true,
      },
    } as Awaited<ReturnType<SubscriptionLibrary['getSubscriptionData']>>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after quota tests.
    (EnvSet.values as { isCloud: boolean }).isCloud = originalIsCloud;
  });

  it('loads hook config and runs enabled inline hook script in local VM', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      environmentVariables: {
        NAME_SUFFIX: ' updated',
      },
      script: `
        const runInlineHook = (payload) => ({
          action: 'updateUser',
          user: {
            name: payload.event.user.name + payload.environmentVariables.NAME_SUFFIX,
          },
          hasApi: Object.hasOwn(payload, 'api'),
        });
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {
          key: LogtoInlineHookKey.PostSignIn,
          interactionEvent: 'SignIn',
          user: {
            id: 'foo',
            name: 'Foo',
          },
        },
      })
    ).resolves.toEqual({
      action: 'updateUser',
      user: {
        name: 'Foo updated',
      },
      hasApi: false,
    });

    expect(getInlineHook).toHaveBeenCalledWith(LogtoInlineHookKey.PostSignIn);
  });

  it('does not run disabled hooks', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: false,
      script: `
        const runInlineHook = () => {
          throw new Error('should not run');
        };
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
  });

  it('does not run when inline hook config is missing', async () => {
    getInlineHook.mockRejectedValueOnce(
      new RequestError({
        code: 'entity.not_exists_with_id',
        status: 404,
      })
    );

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
  });

  it('rethrows non-404 errors when loading inline hook config', async () => {
    const requestError = new RequestError({
      code: 'entity.not_exists_with_id',
      status: 500,
    });
    getInlineHook.mockRejectedValueOnce(requestError);

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).rejects.toBe(requestError);
  });

  it('does not run when inline hooks quota is disabled', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for cloud quota test.
    (EnvSet.values as { isCloud: boolean }).isCloud = true;
    getSubscriptionData.mockResolvedValueOnce({
      quota: {
        inlineHooksEnabled: false,
      },
    } as Awaited<ReturnType<SubscriptionLibrary['getSubscriptionData']>>);
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runInlineHook = () => {
          throw new Error('should not run');
        };
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
  });

  it('allows PostSignIn execution errors to continue without hook enrichment', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: `
        const runInlineHook = () => {
          throw new Error('Broken');
        };
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
  });

  it('keeps PostFirstFactorVerification allow-mode errors from granting access', () => {
    const decision = getInlineHookExecutionErrorPolicyDecision({
      key: LogtoInlineHookKey.PostFirstFactorVerification,
      onExecutionError: 'allow',
    });
    const expectedDecision: InlineHookExecutionErrorFallback = {
      action: 'rejectInvalidCredentials',
    };

    expect(decision).toEqual(expectedDecision);
  });

  it('returns the invalid-credentials fallback for PostFirstFactorVerification allow-mode execution errors', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: `
        const runInlineHook = () => {
          throw new Error('Broken');
        };
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        event: {},
      })
    ).resolves.toEqual({
      action: 'rejectInvalidCredentials',
    });
  });

  it('redacts the PostFirstFactorVerification password from tracked execution errors', async () => {
    const password = 'secret-password';
    const trackException = jest.spyOn(appInsights, 'trackException').mockResolvedValue();
    jest
      .spyOn(InlineHookLibrary, 'runScriptInLocalVm')
      .mockRejectedValueOnce(new Error(`Inline hook failed with ${password}`));
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: '',
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        event: {
          password,
        },
      })
    ).resolves.toEqual({
      action: 'rejectInvalidCredentials',
    });

    const trackedError = trackException.mock.calls[0]?.[0];
    expect(trackedError).toBeInstanceOf(Error);
    expect(trackedError).toMatchObject({
      message: 'Inline hook failed with [redacted]',
    });
    expect((trackedError as Error).stack).not.toContain(password);
  });

  it('blocks PostSignIn execution errors with the owning flow failure by default', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runInlineHook = () => {
          throw new Error('Broken');
        };
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).rejects.toMatchObject({
      code: 'session.verification_failed',
      status: 400,
    });
  });

  it('returns the owning flow failure for block-mode execution errors', () => {
    const decision: InlineHookExecutionErrorPolicyDecision =
      getInlineHookExecutionErrorPolicyDecision({
        key: LogtoInlineHookKey.PostSignIn,
        onExecutionError: 'block',
      });

    expect(decision.action).toBe('throw');
    if (decision.action !== 'throw') {
      throw new Error('Expected throw decision');
    }
    expect(decision.error).toMatchObject({
      code: 'session.verification_failed',
      status: 400,
    });
  });
});
