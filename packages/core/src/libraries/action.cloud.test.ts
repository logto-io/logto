import { appInsights } from '@logto/app-insights/node';
import { LogtoActionKey } from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import nock from 'nock';

import { EnvSet } from '#src/env-set/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';

import { actionMetricNames } from './action-telemetry.js';
import { ActionLibrary } from './action.js';
import type { LogtoConfigLibrary } from './logto-config.js';
import type { SubscriptionLibrary } from './subscription.js';

const { jest } = import.meta;

const getAction = jest.fn() as jest.MockedFunction<LogtoConfigLibrary['getAction']>;
const getSubscriptionData = jest.fn() as jest.MockedFunction<
  SubscriptionLibrary['getSubscriptionData']
>;
const trackMetric = jest.fn();
const originalAppInsightsClient = appInsights.client;

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

describe('ActionLibrary Cloud execution routing', () => {
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
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore the shared AppInsights singleton.
    appInsights.client = originalAppInsightsClient;
    setIsCloud(originalIsCloud);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after dev feature tests.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
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
  });

  it('runs the script through the regional untrusted runner endpoint', async () => {
    const endpoint = 'https://untrusted.example.com';
    const functionKey = 'function-key';
    const payload = {
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => ({ action: "continue" });',
      event: {
        key: LogtoActionKey.PostSignIn,
      },
    };
    const executionResult = { action: 'continue' };
    const matchLegacyRunnerPayload = jest.fn((_body: unknown) => true);
    const remoteRunner = nock(endpoint, {
      reqheaders: {
        'x-functions-key': functionKey,
      },
    })
      .post('/api/inline-hooks', matchLegacyRunnerPayload)
      .reply(200, executionResult);

    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue(endpoint);
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue(functionKey);

    await expect(library.runScriptRemotely(payload)).resolves.toEqual(executionResult);
    expect(remoteRunner.isDone()).toBe(true);
    const requestBody = matchLegacyRunnerPayload.mock.calls[0]?.[0];
    expect(requestBody).toMatchObject({
      hookType: payload.actionType,
      event: payload.event,
    });
    if (
      typeof requestBody !== 'object' ||
      requestBody === null ||
      !('script' in requestBody) ||
      typeof requestBody.script !== 'string'
    ) {
      throw new TypeError('Expected the legacy runner request body to contain a script');
    }
    expect(requestBody.script).toContain(payload.script);
    expect(requestBody.script).toContain('runInlineHook');
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
    expect(runScriptRemotely).toHaveBeenCalledWith(payload);
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
    expect(runScriptInLocalVm).toHaveBeenCalledWith(payload);
    expect(runScriptRemotely).not.toHaveBeenCalled();
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
    const matchLegacyRunnerPayload = jest.fn((_body: unknown) => true);
    const remoteRunner = nock(endpoint, {
      reqheaders: {
        'x-functions-key': functionKey,
      },
    })
      .post('/api/inline-hooks', matchLegacyRunnerPayload)
      .reply(200, executionResult);

    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue(endpoint);
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue(functionKey);
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
    expect(remoteRunner.isDone()).toBe(true);
    const requestBody = matchLegacyRunnerPayload.mock.calls[0]?.[0];
    expect(requestBody).toMatchObject({
      hookType: LogtoActionKey.PostSignIn,
      event,
      environmentVariables,
    });
    if (
      typeof requestBody !== 'object' ||
      requestBody === null ||
      !('script' in requestBody) ||
      typeof requestBody.script !== 'string'
    ) {
      throw new TypeError('Expected the legacy runner request body to contain a script');
    }
    expect(requestBody.script).toContain(script);
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
    expect(mockAppend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ actionType: LogtoActionKey.PostSignIn, runtimeLocation: 'remote' })
    );
    const metricProperties = {
      actionType: 'PostSignIn',
      runtimeLocation: 'azure',
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
    const endpoint = 'https://untrusted.example.com';
    const functionKey = 'function-key';
    const remoteRunner = nock(endpoint, {
      reqheaders: {
        'x-functions-key': functionKey,
      },
    })
      .post('/api/inline-hooks')
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

  it('blocks PostSignIn when Cloud remote execution fails by default', async () => {
    setIsCloud(true);
    jest.spyOn(library, 'runScriptRemotely').mockRejectedValueOnce(
      new ResponseError(
        new Response(JSON.stringify({ message: 'Remote runner failed' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      )
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
