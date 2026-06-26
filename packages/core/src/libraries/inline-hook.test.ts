import { LogtoInlineHookKey } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { LocalVmError } from '#src/utils/local-vm/index.js';

import {
  getInlineHookExecutionErrorPolicyDecision,
  InlineHookLibrary,
  isAccessDeniedError,
} from './inline-hook.js';
import type {
  InlineHookAccessDeniedError,
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
        const runInlineHook = ({ event, environmentVariables, api }) => ({
          action: 'updateUser',
          user: {
            name: event.user.name + environmentVariables.NAME_SUFFIX,
          },
          apiFrozen: Object.isFrozen(api),
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
      apiFrozen: true,
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

  it('throws LocalVmError when inline hook denies access in local VM execution', async () => {
    const script = `
      const runInlineHook = ({ api }) => api.denyAccess('Nope');
    `;

    await expect(
      InlineHookLibrary.runScriptInLocalVm({
        script,
        event: {},
      })
    ).rejects.toBeInstanceOf(LocalVmError);

    try {
      await InlineHookLibrary.runScriptInLocalVm({
        script,
        event: {},
      });
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(LocalVmError);
      await expect((error as LocalVmError).response.json()).resolves.toEqual({
        message: 'Nope',
        error: {
          code: 'AccessDenied',
          message: 'Nope',
        },
      });
    }
  });

  it('identifies inline hook AccessDenied errors', () => {
    const accessDeniedError: InlineHookAccessDeniedError = {
      code: 'AccessDenied',
      message: 'Nope',
    };

    expect(isAccessDeniedError(accessDeniedError)).toBe(true);
    expect(isAccessDeniedError({ code: 'OtherError', message: 'Nope' })).toBe(false);
  });

  it('maps inline hook AccessDenied to hook-specific RequestError', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runInlineHook = ({ api }) => api.denyAccess('Nope');
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).rejects.toMatchObject({
      code: 'session.hook_denied_access',
      status: 403,
    });

    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runInlineHook = ({ api }) => api.denyAccess('Nope');
      `,
    });

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        event: {},
      })
    ).rejects.toMatchObject({
      code: 'session.invalid_credentials',
      status: 403,
    });
  });

  it('maps direct AccessDenied error bodies to RequestError decisions', async () => {
    const decision = await getInlineHookExecutionErrorPolicyDecision({
      key: LogtoInlineHookKey.PostSignIn,
      error: {
        code: 'AccessDenied',
        message: 'Nope',
      },
      onExecutionError: 'allow',
    });

    expect(decision.action).toBe('throw');
    if (decision.action !== 'throw') {
      throw new Error('Expected throw decision');
    }
    expect(decision.error).toMatchObject({
      code: 'session.hook_denied_access',
      status: 403,
    });
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

  it('keeps PostFirstFactorVerification allow-mode errors from granting access', async () => {
    const decision = await getInlineHookExecutionErrorPolicyDecision({
      key: LogtoInlineHookKey.PostFirstFactorVerification,
      error: new Error('Broken'),
      onExecutionError: 'allow',
    });
    const expectedDecision: InlineHookExecutionErrorFallback = {
      action: 'rejectInvalidCredentials',
    };

    expect(decision).toEqual(expectedDecision);
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

  it('returns the owning flow failure for block-mode execution errors', async () => {
    const decision: InlineHookExecutionErrorPolicyDecision =
      await getInlineHookExecutionErrorPolicyDecision({
        key: LogtoInlineHookKey.PostSignIn,
        error: new Error('Broken'),
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
