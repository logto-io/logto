/* eslint-disable max-lines -- The dev-features-gated script-run path and the legacy Azure Functions path share one setup. */
import { appInsights } from '@logto/app-insights/node';
import { LogtoActionKey } from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import nock from 'nock';

import { EnvSet } from '#src/env-set/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';

import { actionMetricNames } from './action-telemetry.js';
import { ActionLibrary } from './action.js';
import type { CloudConnectionLibrary } from './cloud-connection.js';
import type { LogtoConfigLibrary } from './logto-config.js';
import type { SubscriptionLibrary } from './subscription.js';

const { jest } = import.meta;

const getAction = jest.fn() as jest.MockedFunction<LogtoConfigLibrary['getAction']>;
const getSubscriptionData = jest.fn() as jest.MockedFunction<
  SubscriptionLibrary['getSubscriptionData']
>;
const post = jest.fn();
const trackMetric = jest.fn();
const getWorkerAccessToken = jest.fn(async () => 'worker-access-token');
const originalAppInsightsClient = appInsights.client;

const scriptRunnerEndpoint = 'http://script-runner.example.com';

const cloudConnection = {
  getClient: async () => ({ post }),
  getWorkerAccessToken,
  invalidateWorkerAccessToken: jest.fn(),
} as unknown as CloudConnectionLibrary;

/** Intercept the script runner call, optionally asserting the request body via nock's matcher. */
const mockScriptRun = (body?: nock.RequestBodyMatcher) =>
  nock(scriptRunnerEndpoint).post('/api/script-run', body);

const createLibrary = (tenantId = 'tenant_id') =>
  new ActionLibrary(
    tenantId,
    { getAction } as unknown as LogtoConfigLibrary,
    { getSubscriptionData } as unknown as SubscriptionLibrary,
    cloudConnection
  );

const originalIsCloud = EnvSet.values.isCloud;
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const setIsCloud = (isCloud: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for Cloud/local selection tests.
  (EnvSet.values as { isCloud: boolean }).isCloud = isCloud;
};

/** The error body the legacy Azure Functions path produces for a failed run. */
const buildScriptFailureResponseError = (
  status: number,
  message: string,
  error: Record<string, unknown>
) =>
  new ResponseError(
    new Response(JSON.stringify({ message, error }), {
      status,
      headers: { 'content-type': 'application/json' },
    })
  );

type RunActionInput<Event> = {
  key: LogtoActionKey;
} & ({ event: Event } | { getEvent: () => Promise<Event> });

describe('ActionLibrary Cloud execution routing', () => {
  const library = createLibrary();
  const { createLog, mockAppend } = createMockLogContext();
  const runAction = async <Event>(input: RunActionInput<Event>) =>
    library.runAction({ ...input, auditContext: { createLog } });

  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue(scriptRunnerEndpoint);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Provide an AppInsights client for metric assertions.
    appInsights.client = {
      trackMetric,
      trackException: jest.fn(),
    } as unknown as NonNullable<typeof appInsights.client>;
    getSubscriptionData.mockResolvedValue({
      quota: {
        actionsEnabled: true,
      },
    } as Awaited<ReturnType<SubscriptionLibrary['getSubscriptionData']>>);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore the shared AppInsights singleton.
    appInsights.client = originalAppInsightsClient;
    setIsCloud(originalIsCloud);
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('runs the script on the Cloud script runner', async () => {
    const payload = {
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => ({ action: "continue" });',
      event: {
        key: LogtoActionKey.PostSignIn,
      },
      environmentVariables: { NAME_SUFFIX: ' updated' },
    };
    mockScriptRun({
      tenantId: 'tenant_id',
      entry: 'runAction',
      script: payload.script,
      // `actionType` selects the script on this side and must not reach the user script.
      payload: {
        event: payload.event,
        environmentVariables: payload.environmentVariables,
      },
    }).reply(200, { ok: true, value: { action: 'continue' } });

    await expect(library.runScriptRemotely(payload)).resolves.toEqual({ action: 'continue' });
    expect(post).not.toHaveBeenCalled();
  });

  it.each([
    ['denied', 403],
    ['syntax', 422],
    ['type', 422],
    ['timeout', 500],
    ['oom', 500],
    ['runtime', 500],
  ])('maps a %s script failure to status %i', async (kind, status) => {
    mockScriptRun().reply(200, { ok: false, kind, message: 'Script failed' });

    await expect(
      library.runScriptRemotely({
        actionType: LogtoActionKey.PostSignIn,
        script: 'const runAction = () => ({ action: "continue" });',
        event: {},
      })
    ).rejects.toMatchObject({ status });
  });

  it('marks a dry run as a test', async () => {
    const payload = {
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => ({ action: "continue" });',
      event: { key: LogtoActionKey.PostSignIn },
    };
    const scriptRunner = mockScriptRun(
      (body: Record<string, unknown>) => body.isTest === true
    ).reply(200, { ok: true, value: { action: 'continue' } });

    await library.runScriptRemotely(payload, true);
    expect(scriptRunner.isDone()).toBe(true);
  });

  it('forwards the dry-run flag from executeScript', async () => {
    setIsCloud(true);
    const payload = {
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => ({ action: "continue" });',
      event: { key: LogtoActionKey.PostSignIn },
    };
    const scriptRunner = mockScriptRun(
      (body: Record<string, unknown>) => body.isTest === true
    ).reply(200, { ok: true, value: { action: 'continue' } });

    await library.executeScript({ ...payload, isTest: true });
    expect(scriptRunner.isDone()).toBe(true);
  });

  it('surfaces a transport failure as a 500, not as a script failure', async () => {
    nock(scriptRunnerEndpoint).post('/api/script-run').reply(403, { message: 'Nope.' });

    await expect(
      library.runScriptRemotely({
        actionType: LogtoActionKey.PostSignIn,
        script: 'const runAction = () => ({ action: "continue" });',
        event: {},
      })
    ).rejects.toMatchObject({ status: 500 });
  });

  it('falls back to the legacy path when the script runner endpoint is not injected', async () => {
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue('');
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue('');
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue('');

    await expect(
      library.runScriptRemotely({
        actionType: LogtoActionKey.PostSignIn,
        script: 'const runAction = () => ({ action: "continue" });',
        event: {},
      })
    ).rejects.toMatchObject({ code: 'action.general', status: 422 });
    expect(getWorkerAccessToken).not.toHaveBeenCalled();
  });

  it('reports `azure` telemetry when the script runner endpoint is not injected', async () => {
    setIsCloud(true);
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue('');
    const azureEndpoint = 'https://untrusted.example.com';
    const executionResult = { action: 'updateUser', user: { name: 'Bar' } };
    nock(azureEndpoint).post('/api/actions').reply(200, executionResult);
    jest
      .spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get')
      .mockReturnValue(azureEndpoint);
    jest
      .spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get')
      .mockReturnValue('function-key');
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({ action: "updateUser", user: { name: "Bar" } });',
    });

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {
          key: LogtoActionKey.PostSignIn,
          interactionEvent: 'SignIn',
          user: { id: 'foo', name: 'Foo' },
        },
      })
    ).resolves.toEqual(executionResult);
    // Dev features alone must not label an Azure Functions run as `cloud`: the metric decides
    // when the gate can drop, so it has to read the same condition the gate does.
    expect(trackMetric).toHaveBeenNthCalledWith(1, {
      name: actionMetricNames.executionCount,
      value: 1,
      properties: {
        actionType: 'PostSignIn',
        runtimeLocation: 'azure',
        outcome: 'success',
        action: 'updateUser',
      },
    });
  });

  it('uses the remote runner for Cloud executeScript without falling back to local VM', async () => {
    setIsCloud(true);
    const payload = {
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => ({ action: "continue" });',
      event: {
        key: LogtoActionKey.PostSignIn,
      },
    };
    const runScriptRemotely = jest
      .spyOn(library, 'runScriptRemotely')
      .mockResolvedValueOnce({ action: 'continue' });
    const runScriptInLocalVm = jest.spyOn(ActionLibrary, 'runScriptInLocalVm');

    await expect(library.executeScript(payload)).resolves.toEqual({ action: 'continue' });
    expect(runScriptRemotely).toHaveBeenCalledWith(payload, undefined);
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
  });

  it('uses the local VM for non-Cloud executeScript', async () => {
    setIsCloud(false);
    const payload = {
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => ({ action: "continue" });',
      event: {
        key: LogtoActionKey.PostSignIn,
      },
    };
    const runScriptInLocalVm = jest
      .spyOn(ActionLibrary, 'runScriptInLocalVm')
      .mockResolvedValueOnce({ action: 'continue' });
    const runScriptRemotely = jest.spyOn(library, 'runScriptRemotely');

    await expect(library.executeScript(payload)).resolves.toEqual({ action: 'continue' });
    expect(runScriptInLocalVm).toHaveBeenCalledWith(payload, 'tenant_id');
    expect(runScriptRemotely).not.toHaveBeenCalled();
  });

  it('routes Cloud runAction through the script runner with the execution payload', async () => {
    setIsCloud(true);
    const script = 'const runAction = () => ({ action: "updateUser", user: { name: "Bar" } });';
    const event = {
      key: LogtoActionKey.PostSignIn,
      interactionEvent: 'SignIn',
      user: {
        id: 'foo',
        name: 'Foo',
      },
    };
    const environmentVariables = { NAME_SUFFIX: ' updated' };
    const executionResult = {
      action: 'updateUser',
      user: {
        name: 'Bar',
      },
    };
    mockScriptRun({
      tenantId: 'tenant_id',
      entry: 'runAction',
      script,
      payload: { event, environmentVariables },
    }).reply(200, { ok: true, value: executionResult });
    getAction.mockResolvedValueOnce({
      enabled: true,
      script,
      environmentVariables,
    });
    const runScriptInLocalVm = jest.spyOn(ActionLibrary, 'runScriptInLocalVm');

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        event,
      })
    ).resolves.toEqual(executionResult);
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
    expect(mockAppend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ actionType: LogtoActionKey.PostSignIn, runtimeLocation: 'remote' })
    );
    const metricProperties = {
      actionType: 'PostSignIn',
      // `cloud`, not `azure`: the metric distinguishes the two remote runtimes while both exist.
      runtimeLocation: 'cloud',
      outcome: 'success',
      action: 'updateUser',
    };
    expect(trackMetric).toHaveBeenCalledTimes(2);
    expect(trackMetric).toHaveBeenNthCalledWith(1, {
      name: actionMetricNames.executionCount,
      value: 1,
      properties: metricProperties,
    });
    expect(trackMetric).toHaveBeenNthCalledWith(2, {
      name: actionMetricNames.executionDuration,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
      value: expect.any(Number),
      properties: metricProperties,
    });
  });

  it('applies allow-mode policy when Cloud remote execution fails without local fallback', async () => {
    setIsCloud(true);
    const scriptRunner = mockScriptRun().reply(200, {
      ok: false,
      kind: 'runtime',
      message: 'Remote runner failed',
    });
    getAction.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: 'const runAction = () => ({ action: "continue" });',
    });
    const runScriptInLocalVm = jest.spyOn(ActionLibrary, 'runScriptInLocalVm');

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
    expect(scriptRunner.isDone()).toBe(true);
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
  });

  it('blocks PostSignIn when Cloud remote execution fails by default', async () => {
    setIsCloud(true);
    jest
      .spyOn(library, 'runScriptRemotely')
      .mockRejectedValueOnce(
        buildScriptFailureResponseError(500, 'Remote runner failed', { kind: 'runtime' })
      );
    getAction.mockResolvedValueOnce({
      enabled: true,
      script: 'const runAction = () => ({ action: "continue" });',
    });
    const runScriptInLocalVm = jest.spyOn(ActionLibrary, 'runScriptInLocalVm');

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).rejects.toMatchObject({
      code: 'session.verification_failed',
      status: 400,
    });
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
  });

  it('applies rejectInvalidCredentials when Cloud remote execution fails for P1 allow mode', async () => {
    setIsCloud(true);
    jest
      .spyOn(library, 'runScriptRemotely')
      .mockRejectedValueOnce(new Error('Remote runner timed out'));
    getAction.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: 'const runAction = () => ({ passwordVerified: true });',
    });
    const runScriptInLocalVm = jest.spyOn(ActionLibrary, 'runScriptInLocalVm');

    await expect(
      runAction({
        key: LogtoActionKey.PostFirstFactorVerification,
        event: {
          password: 'secret-password',
        },
      })
    ).resolves.toEqual({
      action: 'rejectInvalidCredentials',
    });
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
  });
});

describe('ActionLibrary Cloud execution routing without dev features', () => {
  const library = createLibrary();
  const { createLog } = createMockLogContext();
  const runAction = async <Event>(input: RunActionInput<Event>) =>
    library.runAction({ ...input, auditContext: { createLog } });

  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Provide an AppInsights client for metric assertions.
    appInsights.client = {
      trackMetric,
      trackException: jest.fn(),
    } as unknown as NonNullable<typeof appInsights.client>;
    getSubscriptionData.mockResolvedValue({
      quota: {
        actionsEnabled: true,
      },
    } as Awaited<ReturnType<SubscriptionLibrary['getSubscriptionData']>>);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore the shared AppInsights singleton.
    appInsights.client = originalAppInsightsClient;
    setIsCloud(originalIsCloud);
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('throws an action error when the remote runner is not configured', async () => {
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue('');
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue('');

    await expect(
      library.runScriptRemotely({
        actionType: LogtoActionKey.PostSignIn,
        script: 'const runAction = () => ({ action: "continue" });',
        event: {
          key: LogtoActionKey.PostSignIn,
        },
      })
    ).rejects.toMatchObject({
      code: 'action.general',
      status: 422,
      data: {
        message: 'Remote action runner is not configured.',
      },
    });
    expect(post).not.toHaveBeenCalled();
  });

  it('routes Cloud runAction through the Azure Function endpoint with the execution payload', async () => {
    setIsCloud(true);
    const endpoint = 'https://untrusted.example.com';
    const functionKey = 'function-key';
    const script = 'const runAction = () => ({ action: "updateUser", user: { name: "Bar" } });';
    const event = {
      key: LogtoActionKey.PostSignIn,
      interactionEvent: 'SignIn',
      user: {
        id: 'foo',
        name: 'Foo',
      },
    };
    const environmentVariables = { NAME_SUFFIX: ' updated' };
    const executionResult = {
      action: 'updateUser',
      user: {
        name: 'Bar',
      },
    };
    const matchRunnerPayload = jest.fn((_body: unknown) => true);
    const remoteRunner = nock(endpoint, {
      reqheaders: {
        'x-functions-key': functionKey,
      },
    })
      .post('/api/actions', matchRunnerPayload)
      .reply(200, executionResult);

    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue(endpoint);
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue(functionKey);
    getAction.mockResolvedValueOnce({
      enabled: true,
      script,
      environmentVariables,
    });

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        event,
      })
    ).resolves.toEqual(executionResult);
    expect(remoteRunner.isDone()).toBe(true);
    expect(post).not.toHaveBeenCalled();
    expect(matchRunnerPayload.mock.calls[0]?.[0]).toMatchObject({
      script,
      actionType: LogtoActionKey.PostSignIn,
      event,
      environmentVariables,
    });
    expect(trackMetric).toHaveBeenNthCalledWith(1, {
      name: actionMetricNames.executionCount,
      value: 1,
      properties: {
        actionType: 'PostSignIn',
        runtimeLocation: 'azure',
        outcome: 'success',
        action: 'updateUser',
      },
    });
  });

  it('applies allow-mode policy when the Azure Function run fails', async () => {
    setIsCloud(true);
    const endpoint = 'https://untrusted.example.com';
    const functionKey = 'function-key';
    const remoteRunner = nock(endpoint, {
      reqheaders: {
        'x-functions-key': functionKey,
      },
    })
      .post('/api/actions')
      .reply(500, {
        message: 'Remote runner failed',
      });

    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue(endpoint);
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue(functionKey);
    getAction.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: 'const runAction = () => ({ action: "continue" });',
    });
    const runScriptInLocalVm = jest.spyOn(ActionLibrary, 'runScriptInLocalVm');

    await expect(
      runAction({
        key: LogtoActionKey.PostSignIn,
        event: {},
      })
    ).resolves.toBeUndefined();
    expect(remoteRunner.isDone()).toBe(true);
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
  });
});
/* eslint-enable max-lines */
