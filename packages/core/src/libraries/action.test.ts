import { appInsights } from '@logto/app-insights/node';
import { LogtoActionKey } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import { getActionExecutionErrorPolicyDecision, ActionLibrary } from './action.js';
import type { ActionExecutionErrorFallback, ActionExecutionErrorPolicyDecision } from './action.js';
import type { LogtoConfigLibrary } from './logto-config.js';
import type { SubscriptionLibrary } from './subscription.js';

const { jest } = import.meta;

const getAction = jest.fn() as jest.MockedFunction<LogtoConfigLibrary['getAction']>;
const getSubscriptionData = jest.fn() as jest.MockedFunction<
  SubscriptionLibrary['getSubscriptionData']
>;

const createLibrary = (tenantId = 'tenant_id') =>
  new ActionLibrary(
    tenantId,
    { getAction } as unknown as LogtoConfigLibrary,
    { getSubscriptionData } as unknown as SubscriptionLibrary
  );

const originalIsCloud = EnvSet.values.isCloud;
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const setIsCloud = (isCloud: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for Cloud/local selection tests.
  (EnvSet.values as { isCloud: boolean }).isCloud = isCloud;
};

describe('ActionLibrary', () => {
  const library = createLibrary();

  beforeEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for action runtime tests.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;
    getSubscriptionData.mockResolvedValue({
      quota: {
        inlineHooksEnabled: true,
      },
    } as Awaited<ReturnType<SubscriptionLibrary['getSubscriptionData']>>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    setIsCloud(originalIsCloud);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after dev feature tests.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
  });

  it('loads action config and runs the enabled script in the local VM', async () => {
    const getEvent = jest.fn().mockResolvedValue({
      key: LogtoActionKey.PostSignIn,
      interactionEvent: 'SignIn',
      user: {
        id: 'foo',
        name: 'Foo',
      },
    });
    getAction.mockResolvedValueOnce({
      enabled: true,
      environmentVariables: {
        NAME_SUFFIX: ' updated',
      },
      script: `
        const runAction = ({ event, environmentVariables, api }) => ({
          action: 'updateUser',
          user: {
            name: event.user.name + environmentVariables.NAME_SUFFIX,
          },
          apiType: typeof api,
        });
      `,
    });

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        getEvent,
      })
    ).resolves.toEqual({
      action: 'updateUser',
      user: {
        name: 'Foo updated',
      },
      apiType: 'undefined',
    });

    expect(getAction).toHaveBeenCalledWith(LogtoActionKey.PostSignIn);
    expect(getEvent).toHaveBeenCalledTimes(1);
  });

  it('continues to run stored scripts that use the legacy entry point', async () => {
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runInlineHook = () => ({ action: 'updateUser', user: { name: 'Legacy' } });
      `,
    });

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toEqual({
      action: 'updateUser',
      user: { name: 'Legacy' },
    });
  });

  it('does not load or run actions when dev features are disabled', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for dev feature gate test.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = false;

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();

    expect(getAction).not.toHaveBeenCalled();
    expect(getSubscriptionData).not.toHaveBeenCalled();
  });

  it('does not run disabled actions', async () => {
    getAction.mockResolvedValueOnce({
      enabled: false,
      script: `
        const runAction = () => {
          throw new Error('should not run');
        };
      `,
    });

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
  });

  it('does not run when the action lookup returns no config', async () => {
    const getEvent = jest.fn().mockResolvedValue({});

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        getEvent,
      })
    ).resolves.toBeUndefined();

    expect(getEvent).not.toHaveBeenCalled();
  });

  it('does not run when action config is missing', async () => {
    const getEvent = jest.fn().mockResolvedValue({});
    getAction.mockRejectedValueOnce(
      new RequestError({
        code: 'entity.not_exists_with_id',
        status: 404,
      })
    );

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        getEvent,
      })
    ).resolves.toBeUndefined();

    expect(getEvent).not.toHaveBeenCalled();
  });

  it('rethrows non-404 errors when loading action config', async () => {
    const requestError = new RequestError({
      code: 'entity.not_exists_with_id',
      status: 500,
    });
    getAction.mockRejectedValueOnce(requestError);

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).rejects.toBe(requestError);
  });

  it('does not run when actions quota is disabled', async () => {
    const getEvent = jest.fn().mockResolvedValue({});
    setIsCloud(true);
    getSubscriptionData.mockResolvedValueOnce({
      quota: {
        inlineHooksEnabled: false,
      },
    } as Awaited<ReturnType<SubscriptionLibrary['getSubscriptionData']>>);
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runAction = () => {
          throw new Error('should not run');
        };
      `,
    });
    const executeScript = jest.spyOn(library, 'executeScript');
    const runScriptInLocalVm = jest.spyOn(ActionLibrary, 'runScriptInLocalVm');
    const runScriptRemotely = jest.spyOn(library, 'runScriptRemotely');

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        getEvent,
      })
    ).resolves.toBeUndefined();

    expect(getEvent).not.toHaveBeenCalled();
    expect(executeScript).not.toHaveBeenCalled();
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
    expect(runScriptRemotely).not.toHaveBeenCalled();
  });

  it('allows PostSignIn execution errors to continue without action enrichment', async () => {
    getAction.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: `
        const runAction = () => {
          throw new Error('Broken');
        };
      `,
    });

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
  });

  it('keeps PostFirstFactorVerification allow-mode errors from granting access', () => {
    const decision = getActionExecutionErrorPolicyDecision({
      key: LogtoActionKey.PostFirstFactorVerification,
      onExecutionError: 'allow',
    });
    const expectedDecision: ActionExecutionErrorFallback = {
      action: 'rejectInvalidCredentials',
    };

    expect(decision).toEqual(expectedDecision);
  });

  it('returns the invalid-credentials fallback for PostFirstFactorVerification allow-mode execution errors', async () => {
    getAction.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: `
        const runAction = () => {
          throw new Error('Broken');
        };
      `,
    });

    await expect(
      library.runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
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
      .spyOn(ActionLibrary, 'runScriptInLocalVm')
      .mockRejectedValueOnce(new Error(`Action failed with ${password}`));
    getAction.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: '',
    });

    await expect(
      library.runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
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
      message: 'Action failed with [redacted]',
    });
    expect((trackedError as Error).stack).not.toContain(password);
  });

  it('removes remote request details from tracked execution errors', async () => {
    const functionKey = 'function-key';
    class RemoteRequestError extends Error {
      readonly request = {
        options: {
          headers: { 'x-functions-key': functionKey },
        },
      };
    }

    const transportError = new RemoteRequestError('Remote runner timed out');
    const trackException = jest.spyOn(appInsights, 'trackException').mockResolvedValue();
    jest.spyOn(library, 'executeScript').mockRejectedValueOnce(transportError);
    getAction.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: '',
    });

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();

    const trackedError = trackException.mock.calls[0]?.[0];
    expect(trackedError).toBeInstanceOf(Error);
    expect(trackedError).not.toBe(transportError);
    expect(trackedError).toMatchObject({
      message: 'Remote runner timed out',
    });
    expect(Object.hasOwn(trackedError as Error, 'request')).toBe(false);
    expect(JSON.stringify(trackedError)).not.toContain(functionKey);
  });

  it('blocks PostSignIn execution errors with the owning flow failure by default', async () => {
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runAction = () => {
          throw new Error('Broken');
        };
      `,
    });

    await expect(
      library.runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).rejects.toMatchObject({
      code: 'session.verification_failed',
      status: 400,
    });
  });

  it('returns the owning flow failure for block-mode execution errors', () => {
    const decision: ActionExecutionErrorPolicyDecision = getActionExecutionErrorPolicyDecision({
      key: LogtoActionKey.PostSignIn,
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
