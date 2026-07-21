/* eslint-disable max-lines -- Inline hook runtime, policy, and audit behavior share the same library setup. */
import { appInsights } from '@logto/app-insights/node';
import { inlineHook, LogResult, LogtoInlineHookKey, SignInIdentifier } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';

import {
  inlineHookMetricNames,
  type InlineHookTelemetryProperties,
} from './inline-hook-telemetry.js';
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
const trackMetric = jest.fn();
const originalAppInsightsClient = appInsights.client;

const expectInlineHookMetrics = (properties: InlineHookTelemetryProperties) => {
  expect(trackMetric).toHaveBeenCalledTimes(2);
  expect(trackMetric).toHaveBeenNthCalledWith(1, {
    name: inlineHookMetricNames.executionCount,
    value: 1,
    properties,
  });
  expect(trackMetric).toHaveBeenNthCalledWith(2, {
    name: inlineHookMetricNames.executionDuration,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
    value: expect.any(Number),
    properties,
  });
};

const createLibrary = (tenantId = 'tenant_id') =>
  new InlineHookLibrary(
    tenantId,
    { getInlineHook } as unknown as LogtoConfigLibrary,
    { getSubscriptionData } as unknown as SubscriptionLibrary
  );

const originalIsCloud = EnvSet.values.isCloud;
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const setIsCloud = (isCloud: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for Cloud/local selection tests.
  (EnvSet.values as { isCloud: boolean }).isCloud = isCloud;
};

type RunHookInput<Event> = {
  key: LogtoInlineHookKey;
} & ({ event: Event } | { getEvent: () => Promise<Event> });

describe('InlineHookLibrary', () => {
  const library = createLibrary();
  const { createLog, mockAppend } = createMockLogContext();
  const runHook = async <Event>(input: RunHookInput<Event>) =>
    library.runHook({ ...input, auditContext: { createLog } });

  beforeEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Provide an AppInsights client for metric assertions.
    appInsights.client = {
      trackMetric,
      trackException: jest.fn(),
    } as unknown as NonNullable<typeof appInsights.client>;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for inline hook runtime tests.
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
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore the shared AppInsights singleton.
    appInsights.client = originalAppInsightsClient;
    setIsCloud(originalIsCloud);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after dev feature tests.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
  });

  it('loads hook config and runs enabled inline hook script in local VM', async () => {
    const getEvent = jest.fn().mockResolvedValue({
      key: LogtoInlineHookKey.PostSignIn,
      interactionEvent: 'SignIn',
      user: {
        id: 'foo',
        name: 'Foo',
      },
    });
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
          apiType: typeof api,
        });
      `,
    });

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
        getEvent,
      })
    ).resolves.toEqual({
      action: 'updateUser',
      user: {
        name: 'Foo updated',
      },
      apiType: 'undefined',
    });

    expect(getInlineHook).toHaveBeenCalledWith(LogtoInlineHookKey.PostSignIn);
    expect(getEvent).toHaveBeenCalledTimes(1);
    expect(createLog).toHaveBeenCalledTimes(1);
    expect(createLog).toHaveBeenCalledWith('InlineHook.PostSignIn', { independent: true });
    expect(mockAppend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        tenantId: 'tenant_id',
        hookType: LogtoInlineHookKey.PostSignIn,
        runtimeLocation: 'local',
        onExecutionError: 'block',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
        event: expect.objectContaining({ key: LogtoInlineHookKey.PostSignIn }),
      })
    );
    expect(mockAppend).toHaveBeenNthCalledWith(2, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
      durationMs: expect.any(Number),
      action: 'updateUser',
      decision: 'updateUser',
      inlineHookResult: {
        action: 'updateUser',
        user: '[redacted]',
        apiType: 'undefined',
      },
    });
    expectInlineHookMetrics({
      hookType: 'PostSignIn',
      runtimeLocation: 'local',
      outcome: 'success',
      action: 'updateUser',
    });
  });

  it('emits no-op metrics for a PostSignIn result without a user patch', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: 'const runInlineHook = () => ({ action: "updateUser" });',
    });

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toEqual({ action: 'updateUser' });

    expectInlineHookMetrics({
      hookType: 'PostSignIn',
      runtimeLocation: 'local',
      outcome: 'noop',
      action: 'noop',
    });
  });

  it('emits fallback metrics when a P1 script declines with an empty result', async () => {
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: 'const runInlineHook = () => ({});',
    });

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        event: {},
      })
    ).resolves.toEqual({});

    expectInlineHookMetrics({
      hookType: 'PostFirstFactorVerification',
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
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: 'const runInlineHook = () => ({});',
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        event: { user: null },
      })
    ).resolves.toEqual(result);

    expectInlineHookMetrics({
      hookType: 'PostFirstFactorVerification',
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
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: 'const runInlineHook = () => ({});',
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        event: {
          identifier: { type: SignInIdentifier.Email, value: 'original@example.com' },
          user: null,
        },
      })
    ).resolves.toEqual(result);

    expectInlineHookMetrics({
      hookType: 'PostFirstFactorVerification',
      runtimeLocation: 'local',
      outcome: 'invalidResult',
      action: 'noop',
    });
  });

  it('keeps hook behavior unchanged when metric tracking fails', async () => {
    const result = { action: 'updateUser', user: { name: 'updated' } };
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: 'const runInlineHook = () => ({});',
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
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toEqual(result);

    expect(trackMetric).toHaveBeenCalledTimes(2);
  });

  it('writes a sanitized P1 audit entry without scripts, environment values, or user patches', async () => {
    const script = 'const privateInlineHookScript = true;';
    const environmentSecret = 'environment-secret-value';
    const password = 'plain-text-password';
    const eventSecret = 'event-secret-value';
    const apiKey = 'api-key-value';
    const accessToken = 'access-token-value';
    const nestedPatchEmail = 'nested-patch@example.com';
    const event = {
      key: LogtoInlineHookKey.PostFirstFactorVerification,
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

    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script,
      environmentVariables: {
        API_TOKEN: environmentSecret,
      },
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);

    await expect(
      library.runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
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
      `${inlineHook.prefix}.${inlineHook.Type.PostFirstFactorVerification}`,
      { independent: true }
    );
    expect(mockAppend).toHaveBeenNthCalledWith(1, {
      sessionId: 'session-id',
      applicationId: 'application-id',
      userId: 'user-id',
      tenantId: 'tenant_id',
      hookType: LogtoInlineHookKey.PostFirstFactorVerification,
      runtimeLocation: 'local',
      onExecutionError: 'block',
      event: {
        key: LogtoInlineHookKey.PostFirstFactorVerification,
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
      inlineHookResult: {
        action: 'createUser',
        passwordVerified: true,
        user: '[redacted]',
        nested: [{ User: '[redacted]' }],
        note: '[redacted]',
      },
    });
    expectInlineHookMetrics({
      hookType: 'PostFirstFactorVerification',
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
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: 'const runInlineHook = () => ({});',
      environmentVariables: { API_TOKEN: environmentSecret },
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce({
      action: environmentSecret,
      passwordVerified: passwordStatusSecret,
    });

    await runHook({ key: LogtoInlineHookKey.PostSignIn, event: {} });

    expect(mockAppend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        decision: 'invalid',
        inlineHookResult: { action: 'invalid', passwordVerified: '******' },
      })
    );
    expectInlineHookMetrics({
      hookType: 'PostSignIn',
      runtimeLocation: 'local',
      outcome: 'invalidResult',
      action: 'noop',
    });
    expect(JSON.stringify(mockAppend.mock.calls)).not.toContain(environmentSecret);
    expect(JSON.stringify(mockAppend.mock.calls)).not.toContain(passwordStatusSecret);
  });

  it('keeps audit summarization failures from changing the hook result', async () => {
    const result = {
      action: 'updateUser',
      get user(): never {
        throw new Error('Untrusted getter');
      },
    };
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: 'const runInlineHook = () => ({});',
    });
    jest.spyOn(library, 'executeScript').mockResolvedValueOnce(result);

    await expect(runHook({ key: LogtoInlineHookKey.PostSignIn, event: {} })).resolves.toBe(result);
    expect(mockAppend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: 'updateUser',
        decision: 'updateUser',
        inlineHookResult: '[unavailable]',
      })
    );
  });

  it('does not load or run hooks when dev features are disabled', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for dev feature gate test.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = false;

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();

    expect(getInlineHook).not.toHaveBeenCalled();
    expect(getSubscriptionData).not.toHaveBeenCalled();
    expect(createLog).not.toHaveBeenCalled();
    expect(trackMetric).not.toHaveBeenCalled();
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
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();

    expect(createLog).not.toHaveBeenCalled();
    expect(trackMetric).not.toHaveBeenCalled();
  });

  it('does not run when inline hook config is missing', async () => {
    const getEvent = jest.fn().mockResolvedValue({});
    getInlineHook.mockRejectedValueOnce(
      new RequestError({
        code: 'entity.not_exists_with_id',
        status: 404,
      })
    );

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
        getEvent,
      })
    ).resolves.toBeUndefined();

    expect(getEvent).not.toHaveBeenCalled();
    expect(createLog).not.toHaveBeenCalled();
    expect(trackMetric).not.toHaveBeenCalled();
  });

  it('rethrows non-404 errors when loading inline hook config', async () => {
    const requestError = new RequestError({
      code: 'entity.not_exists_with_id',
      status: 500,
    });
    getInlineHook.mockRejectedValueOnce(requestError);

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event: {},
      })
    ).rejects.toBe(requestError);
  });

  it('does not run when inline hooks quota is disabled', async () => {
    const getEvent = jest.fn().mockResolvedValue({});
    setIsCloud(true);
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
    const executeScript = jest.spyOn(library, 'executeScript');
    const runScriptInLocalVm = jest.spyOn(InlineHookLibrary, 'runScriptInLocalVm');
    const runScriptRemotely = jest.spyOn(library, 'runScriptRemotely');

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
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
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
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
      runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
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
    const script = 'const privateInlineHookScript = true;';
    const environmentSecret = 'environment-secret-value';
    const nestedSecret = 'nested-secret-value';
    const trackException = jest.spyOn(appInsights, 'trackException').mockResolvedValue();
    class SensitiveExecutionError extends Error {
      override readonly name = environmentSecret;

      readonly code = password;
    }
    const executionError = new SensitiveExecutionError(
      `Inline hook failed with ${password} ${script} ${environmentSecret} ${nestedSecret}`
    );
    jest.spyOn(InlineHookLibrary, 'runScriptInLocalVm').mockRejectedValueOnce(executionError);
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script,
      environmentVariables: {
        API_TOKEN: environmentSecret,
      },
    });

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
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
      message: 'Inline hook failed with [redacted] [redacted] [redacted] [redacted]',
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
        hookType: 'PostFirstFactorVerification',
        runtimeLocation: 'local',
        outcome: 'executionError',
        action: 'noop',
      },
    });
    expect(JSON.stringify(trackException.mock.calls)).not.toContain(password);
    expect(JSON.stringify(trackException.mock.calls)).not.toContain(script);
    expect(JSON.stringify(trackException.mock.calls)).not.toContain(environmentSecret);
    expectInlineHookMetrics({
      hookType: 'PostFirstFactorVerification',
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
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: '',
    });

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
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
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: `
        const runInlineHook = () => {
          throw new Error('Broken');
        };
      `,
    });

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
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
    expectInlineHookMetrics({
      hookType: 'PostSignIn',
      runtimeLocation: 'local',
      outcome: 'executionError',
      action: 'noop',
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
/* eslint-enable max-lines */
