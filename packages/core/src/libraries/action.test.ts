/* eslint-disable max-lines -- Action runtime, policy, and audit behavior share the same library setup. */
import { appInsights } from '@logto/app-insights/node';
import { action, LogResult, LogtoActionKey, SignInIdentifier } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';

import { actionMetricNames, type ActionTelemetryProperties } from './action-telemetry.js';
import { getActionExecutionErrorPolicyDecision, ActionLibrary } from './action.js';
import type { ActionExecutionErrorFallback, ActionExecutionErrorPolicyDecision } from './action.js';
import type { LogtoConfigLibrary } from './logto-config.js';
import type { SubscriptionLibrary } from './subscription.js';

const { jest } = import.meta;

const getAction = jest.fn() as jest.MockedFunction<LogtoConfigLibrary['getAction']>;
const getSubscriptionData = jest.fn() as jest.MockedFunction<
  SubscriptionLibrary['getSubscriptionData']
>;
const trackMetric = jest.fn();
const originalAppInsightsClient = appInsights.client;

const expectActionMetrics = (properties: ActionTelemetryProperties) => {
  expect(trackMetric).toHaveBeenCalledTimes(2);
  expect(trackMetric).toHaveBeenNthCalledWith(1, {
    name: actionMetricNames.executionCount,
    value: 1,
    properties,
  });
  expect(trackMetric).toHaveBeenNthCalledWith(2, {
    name: actionMetricNames.executionDuration,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
    value: expect.any(Number),
    properties,
  });
};

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

type RunActionInput<Event> = {
  key: LogtoActionKey;
} & ({ event: Event } | { getEvent: () => Promise<Event> });

describe('ActionLibrary', () => {
  const library = createLibrary();
  const { createLog, mockAppend } = createMockLogContext();
  const runAction = async <Event>(input: RunActionInput<Event>) =>
    library.runAction({ ...input, auditContext: { createLog } });

  beforeEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Provide an AppInsights client for metric assertions.
    appInsights.client = {
      trackMetric,
      trackException: jest.fn(),
    } as unknown as NonNullable<typeof appInsights.client>;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for action runtime tests.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;
    getSubscriptionData.mockResolvedValue({
      quota: {
        actionsEnabled: true,
      },
    } as Awaited<ReturnType<SubscriptionLibrary['getSubscriptionData']>>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore the shared AppInsights singleton.
    appInsights.client = originalAppInsightsClient;
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
      runAction({
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
    expect(createLog).toHaveBeenCalledTimes(1);
    expect(createLog).toHaveBeenCalledWith('Action.PostSignIn', { independent: true });
    expect(mockAppend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        tenantId: 'tenant_id',
        actionType: LogtoActionKey.PostSignIn,
        runtimeLocation: 'local',
        onExecutionError: 'block',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
        event: expect.objectContaining({ key: LogtoActionKey.PostSignIn }),
      })
    );
    expect(mockAppend).toHaveBeenNthCalledWith(2, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
      durationMs: expect.any(Number),
      action: 'updateUser',
      decision: 'updateUser',
      actionResult: {
        action: 'updateUser',
        user: '[redacted]',
        apiType: 'undefined',
      },
    });
    expectActionMetrics({
      actionType: 'PostSignIn',
      runtimeLocation: 'local',
      outcome: 'success',
      action: 'updateUser',
    });
  });

  it.each([
    ['invalid', LogtoActionKey.PostFirstFactorVerification, 'createUser'],
    ['invalid', LogtoActionKey.PostFirstFactorVerification, 'updateUser'],
    ['noop', LogtoActionKey.PostSignIn, 'updateUser'],
  ] as const)(
    'records a %s decision for %s results that declare %s without its effect',
    async (decision, key, resultAction) => {
      getAction.mockResolvedValueOnce({
        enabled: true,
        script: `const runAction = () => ({ action: "${resultAction}" });`,
      });

      await expect(runAction({ key, event: {} })).resolves.toEqual({ action: resultAction });

      expect(mockAppend).toHaveBeenLastCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
        durationMs: expect.any(Number),
        decision,
        actionResult: {
          action: resultAction,
        },
      });
    }
  );

  it('emits no-op metrics for a PostSignIn result without a user patch', async () => {
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({ action: "updateUser" });',
    });

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toEqual({ action: 'updateUser' });

    expectActionMetrics({
      actionType: 'PostSignIn',
      runtimeLocation: 'local',
      outcome: 'noop',
      action: 'noop',
    });
  });

  it('emits fallback metrics when a P1 script declines with an empty result', async () => {
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({});',
    });

    await expect(
      runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
        event: {},
      })
    ).resolves.toEqual({});

    expectActionMetrics({
      actionType: 'PostFirstFactorVerification',
      runtimeLocation: 'local',
      outcome: 'fallback',
      action: 'noop',
    });
  });

  it('emits invalid-result metrics when a P1 script does not verify the password', async () => {
    const result = {
      action: 'createUser',
      user: {},
      passwordVerified: false,
    };
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({});',
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);

    await expect(
      runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
        event: { user: null },
      })
    ).resolves.toEqual(result);

    expectActionMetrics({
      actionType: 'PostFirstFactorVerification',
      runtimeLocation: 'local',
      outcome: 'invalidResult',
      action: 'noop',
    });
  });

  it('emits invalid-result metrics when a P1 result changes the sign-in identifier', async () => {
    const result = {
      action: 'createUser',
      user: { primaryEmail: 'changed@example.com' },
      passwordVerified: true,
    };
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({});',
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);

    await expect(
      runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
        event: {
          identifier: { type: SignInIdentifier.Email, value: 'original@example.com' },
          user: null,
        },
      })
    ).resolves.toEqual(result);

    expectActionMetrics({
      actionType: 'PostFirstFactorVerification',
      runtimeLocation: 'local',
      outcome: 'invalidResult',
      action: 'noop',
    });
  });

  it('keeps action behavior unchanged when metric tracking fails', async () => {
    const result = { action: 'updateUser', user: { name: 'updated' } };
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({});',
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);
    trackMetric
      .mockImplementationOnce(() => {
        throw new Error('Metric client unavailable');
      })
      .mockImplementationOnce(() => {
        throw new Error('Metric client unavailable');
      });

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toEqual(result);

    expect(trackMetric).toHaveBeenCalledTimes(2);
  });

  it('writes a sanitized P1 audit entry without scripts, environment values, or user patches', async () => {
    const script = 'const privateActionScript = true;';
    const environmentSecret = 'environment-secret-value';
    const password = 'plain-text-password';
    const eventSecret = 'event-secret-value';
    const apiKey = 'api-key-value';
    const accessToken = 'access-token-value';
    const nestedPatchEmail = 'nested-patch@example.com';
    const event = {
      key: LogtoActionKey.PostFirstFactorVerification,
      password,
      nested: {
        secret: eventSecret,
      },
      credentials: {
        apiKey,
        accessToken,
      },
      echoed: `${script} ${environmentSecret} ${password}`,
    };
    const result = {
      action: 'createUser',
      passwordVerified: true,
      user: {
        primaryEmail: 'jane@example.com',
        customData: {
          secret: 'returned-patch-secret',
        },
      },
      nested: [{ User: { primaryEmail: nestedPatchEmail } }],
      note: environmentSecret,
    };

    getAction.mockResolvedValueOnce({
      enabled: true,
      script,
      environmentVariables: {
        API_TOKEN: environmentSecret,
      },
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);

    await expect(
      library.runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
        event,
        auditContext: {
          createLog,
          sessionId: 'session-id',
          applicationId: 'application-id',
          userId: 'user-id',
        },
      })
    ).resolves.toEqual(result);

    expect(createLog).toHaveBeenCalledWith(
      `${action.prefix}.${action.Type.PostFirstFactorVerification}`,
      { independent: true }
    );
    expect(mockAppend).toHaveBeenNthCalledWith(1, {
      sessionId: 'session-id',
      applicationId: 'application-id',
      userId: 'user-id',
      tenantId: 'tenant_id',
      actionType: LogtoActionKey.PostFirstFactorVerification,
      runtimeLocation: 'local',
      onExecutionError: 'block',
      event: {
        key: LogtoActionKey.PostFirstFactorVerification,
        password: '******',
        nested: {
          secret: '******',
        },
        credentials: '******',
        echoed: '[redacted] [redacted] [redacted]',
      },
    });
    expect(mockAppend).toHaveBeenNthCalledWith(2, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
      durationMs: expect.any(Number),
      action: 'createUser',
      decision: 'createUser',
      actionResult: {
        action: 'createUser',
        passwordVerified: true,
        user: '[redacted]',
        nested: [{ User: '[redacted]' }],
        note: '[redacted]',
      },
    });
    expectActionMetrics({
      actionType: 'PostFirstFactorVerification',
      runtimeLocation: 'local',
      outcome: 'success',
      action: 'createUser',
    });

    const serializedAuditPayload = JSON.stringify(mockAppend.mock.calls);
    expect(serializedAuditPayload).not.toContain(script);
    expect(serializedAuditPayload).not.toContain(environmentSecret);
    expect(serializedAuditPayload).not.toContain(password);
    expect(serializedAuditPayload).not.toContain(eventSecret);
    expect(serializedAuditPayload).not.toContain(apiKey);
    expect(serializedAuditPayload).not.toContain(accessToken);
    expect(serializedAuditPayload).not.toContain(nestedPatchEmail);
    expect(serializedAuditPayload).not.toContain('returned-patch-secret');
  });

  it('normalizes untrusted result actions before writing audit summaries', async () => {
    const environmentSecret = 'environment-secret-action';
    const passwordStatusSecret = 'password-status-secret';
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({});',
      environmentVariables: { API_TOKEN: environmentSecret },
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce({
      action: environmentSecret,
      passwordVerified: passwordStatusSecret,
    });

    await runAction({ key: LogtoActionKey.PostSignIn, event: {} });

    expect(mockAppend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        decision: 'invalid',
        actionResult: { action: 'invalid', passwordVerified: '******' },
      })
    );
    expectActionMetrics({
      actionType: 'PostSignIn',
      runtimeLocation: 'local',
      outcome: 'invalidResult',
      action: 'noop',
    });
    expect(JSON.stringify(mockAppend.mock.calls)).not.toContain(environmentSecret);
    expect(JSON.stringify(mockAppend.mock.calls)).not.toContain(passwordStatusSecret);
  });

  it('records accessor-only effects as no-op without changing the action result', async () => {
    const result = {
      action: 'updateUser',
      get user(): never {
        throw new Error('Untrusted getter');
      },
    };
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({});',
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);

    await expect(runAction({ key: LogtoActionKey.PostSignIn, event: {} })).resolves.toBe(result);
    expect(mockAppend).toHaveBeenLastCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
      durationMs: expect.any(Number),
      decision: 'noop',
      actionResult: '[unavailable]',
    });
  });

  it('continues to run stored scripts that use the legacy entry point', async () => {
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runInlineHook = () => ({ action: 'updateUser', user: { name: 'Legacy' } });
      `,
    });

    await expect(
      runAction({
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
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();

    expect(getAction).not.toHaveBeenCalled();
    expect(getSubscriptionData).not.toHaveBeenCalled();
    expect(createLog).not.toHaveBeenCalled();
    expect(trackMetric).not.toHaveBeenCalled();
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
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();

    expect(createLog).not.toHaveBeenCalled();
    expect(trackMetric).not.toHaveBeenCalled();
  });

  it('does not run when the action lookup returns no config', async () => {
    const getEvent = jest.fn().mockResolvedValue({});

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        getEvent,
      })
    ).resolves.toBeUndefined();

    expect(getEvent).not.toHaveBeenCalled();
    expect(createLog).not.toHaveBeenCalled();
    expect(trackMetric).not.toHaveBeenCalled();
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
      runAction({
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
      runAction({
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
        actionsEnabled: false,
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
      runAction({
        key: LogtoActionKey.PostSignIn,
        getEvent,
      })
    ).resolves.toBeUndefined();

    expect(getEvent).not.toHaveBeenCalled();
    expect(executeScript).not.toHaveBeenCalled();
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
    expect(runScriptRemotely).not.toHaveBeenCalled();
    expect(getEvent).not.toHaveBeenCalled();
    expect(createLog).not.toHaveBeenCalled();
    expect(trackMetric).not.toHaveBeenCalled();
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
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();

    expect(mockAppend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        result: LogResult.Error,
        decision: 'continue',
        errorPolicyOutcome: 'allow',
      })
    );
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
      runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
        event: {},
      })
    ).resolves.toEqual({
      action: 'rejectInvalidCredentials',
    });

    expect(mockAppend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        result: LogResult.Error,
        decision: 'rejectInvalidCredentials',
        errorPolicyOutcome: 'block',
      })
    );
  });

  it('redacts credentials, scripts, and environment values from tracked execution errors', async () => {
    const password = 'secret-password';
    const script = 'const privateActionScript = true;';
    const environmentSecret = 'environment-secret-value';
    const nestedSecret = 'nested-secret-value';
    const trackException = jest.spyOn(appInsights, 'trackException').mockResolvedValue();
    class SensitiveExecutionError extends Error {
      override readonly name = environmentSecret;

      readonly code = password;
    }
    const executionError = new SensitiveExecutionError(
      `Action failed with ${password} ${script} ${environmentSecret} ${nestedSecret}`
    );
    jest.spyOn(ActionLibrary, 'runScriptInLocalVm').mockRejectedValueOnce(executionError);
    getAction.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script,
      environmentVariables: {
        API_TOKEN: environmentSecret,
      },
    });

    await expect(
      runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
        event: {
          password,
          nested: { secret: { value: nestedSecret } },
        },
      })
    ).resolves.toEqual({
      action: 'rejectInvalidCredentials',
    });

    const trackedError = trackException.mock.calls[0]?.[0];
    expect(trackedError).toBeInstanceOf(Error);
    expect(trackedError).toMatchObject({
      name: 'Error',
      message: 'Action failed with [redacted] [redacted] [redacted] [redacted]',
    });
    expect((trackedError as Error).stack).not.toContain(password);
    expect(JSON.stringify(trackedError)).not.toContain(script);
    expect(JSON.stringify(trackedError)).not.toContain(environmentSecret);
    expect(JSON.stringify(mockAppend.mock.calls)).not.toContain(password);
    expect(JSON.stringify(mockAppend.mock.calls)).not.toContain(script);
    expect(JSON.stringify(mockAppend.mock.calls)).not.toContain(environmentSecret);
    expect(JSON.stringify(mockAppend.mock.calls)).not.toContain(nestedSecret);
    expect(trackException).toHaveBeenCalledWith(trackedError, {
      properties: {
        actionType: 'PostFirstFactorVerification',
        runtimeLocation: 'local',
        outcome: 'executionError',
        action: 'noop',
      },
    });
    expect(JSON.stringify(trackException.mock.calls)).not.toContain(password);
    expect(JSON.stringify(trackException.mock.calls)).not.toContain(script);
    expect(JSON.stringify(trackException.mock.calls)).not.toContain(environmentSecret);
    expectActionMetrics({
      actionType: 'PostFirstFactorVerification',
      runtimeLocation: 'local',
      outcome: 'executionError',
      action: 'noop',
    });
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
      runAction({
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
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).rejects.toMatchObject({
      code: 'session.verification_failed',
      status: 400,
    });

    expect(mockAppend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        result: LogResult.Error,
        decision: 'throw',
        errorPolicyOutcome: 'block',
      })
    );
    expectActionMetrics({
      actionType: 'PostSignIn',
      runtimeLocation: 'local',
      outcome: 'executionError',
      action: 'noop',
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
/* eslint-enable max-lines */
