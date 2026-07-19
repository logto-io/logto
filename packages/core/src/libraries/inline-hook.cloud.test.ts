import { appInsights } from '@logto/app-insights/node';
import { LogtoInlineHookKey } from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import nock from 'nock';

import { EnvSet } from '#src/env-set/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';

import { inlineHookMetricNames } from './inline-hook-telemetry.js';
import { InlineHookLibrary } from './inline-hook.js';
import type { LogtoConfigLibrary } from './logto-config.js';
import type { SubscriptionLibrary } from './subscription.js';

const { jest } = import.meta;

const getInlineHook = jest.fn() as jest.MockedFunction<LogtoConfigLibrary['getInlineHook']>;
const getSubscriptionData = jest.fn() as jest.MockedFunction<
  SubscriptionLibrary['getSubscriptionData']
>;
const trackMetric = jest.fn();
const originalAppInsightsClient = appInsights.client;

const createLibrary = (tenantId = 'tenant_id') =>
  new InlineHookLibrary(
    tenantId,
    { getInlineHook } as unknown as LogtoConfigLibrary,
    { getSubscriptionData } as unknown as SubscriptionLibrary
  );

const originalIsCloud = EnvSet.values.isCloud;

const setIsCloud = (isCloud: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for Cloud/local selection tests.
  (EnvSet.values as { isCloud: boolean }).isCloud = isCloud;
};

type RunHookInput<Event> = {
  key: LogtoInlineHookKey;
} & ({ event: Event } | { getEvent: () => Promise<Event> });

describe('InlineHookLibrary Cloud execution routing', () => {
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
    getSubscriptionData.mockResolvedValue({
      quota: {
        inlineHooksEnabled: true,
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
  });

  it('throws an inline hook error when the remote runner is not configured', async () => {
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue('');
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue('');

    await expect(
      library.runScriptRemotely({
        hookType: LogtoInlineHookKey.PostSignIn,
        script: 'const runInlineHook = () => ({ action: "continue" });',
        event: {
          key: LogtoInlineHookKey.PostSignIn,
        },
      })
    ).rejects.toMatchObject({
      code: 'inline_hook.general',
      status: 422,
      data: {
        message: 'Remote inline hook runner is not configured.',
      },
    });
  });

  it('runs the script through the regional untrusted runner endpoint', async () => {
    const endpoint = 'https://untrusted.example.com';
    const functionKey = 'function-key';
    const payload = {
      hookType: LogtoInlineHookKey.PostSignIn,
      script: 'const runInlineHook = () => ({ action: "continue" });',
      event: {
        key: LogtoInlineHookKey.PostSignIn,
      },
    };
    const executionResult = { action: 'continue' };
    const remoteRunner = nock(endpoint, {
      reqheaders: {
        'x-functions-key': functionKey,
      },
    })
      .post('/api/inline-hooks', payload)
      .reply(200, executionResult);

    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue(endpoint);
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue(functionKey);

    await expect(library.runScriptRemotely(payload)).resolves.toEqual(executionResult);
    expect(remoteRunner.isDone()).toBe(true);
  });

  it('uses the remote runner for Cloud executeScript without falling back to local VM', async () => {
    setIsCloud(true);
    const payload = {
      hookType: LogtoInlineHookKey.PostSignIn,
      script: 'const runInlineHook = () => ({ action: "continue" });',
      event: {
        key: LogtoInlineHookKey.PostSignIn,
      },
    };
    const runScriptRemotely = jest
      .spyOn(library, 'runScriptRemotely')
      .mockResolvedValueOnce({ action: 'continue' });
    const runScriptInLocalVm = jest.spyOn(InlineHookLibrary, 'runScriptInLocalVm');

    await expect(library.executeScript(payload)).resolves.toEqual({ action: 'continue' });
    expect(runScriptRemotely).toHaveBeenCalledWith(payload);
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
  });

  it('uses the local VM for non-Cloud executeScript', async () => {
    setIsCloud(false);
    const payload = {
      hookType: LogtoInlineHookKey.PostSignIn,
      script: 'const runInlineHook = () => ({ action: "continue" });',
      event: {
        key: LogtoInlineHookKey.PostSignIn,
      },
    };
    const runScriptInLocalVm = jest
      .spyOn(InlineHookLibrary, 'runScriptInLocalVm')
      .mockResolvedValueOnce({ action: 'continue' });
    const runScriptRemotely = jest.spyOn(library, 'runScriptRemotely');

    await expect(library.executeScript(payload)).resolves.toEqual({ action: 'continue' });
    expect(runScriptInLocalVm).toHaveBeenCalledWith(payload);
    expect(runScriptRemotely).not.toHaveBeenCalled();
  });

  it('routes Cloud runHook through the Azure Function endpoint with the execution payload', async () => {
    setIsCloud(true);
    const endpoint = 'https://untrusted.example.com';
    const functionKey = 'function-key';
    const script = 'const runInlineHook = () => ({ action: "updateUser", user: { name: "Bar" } });';
    const event = {
      key: LogtoInlineHookKey.PostSignIn,
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
    const remoteRunner = nock(endpoint, {
      reqheaders: {
        'x-functions-key': functionKey,
      },
    })
      .post('/api/inline-hooks', {
        script,
        hookType: LogtoInlineHookKey.PostSignIn,
        event,
        environmentVariables,
      })
      .reply(200, executionResult);

    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue(endpoint);
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue(functionKey);
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script,
      environmentVariables,
    });
    const runScriptInLocalVm = jest.spyOn(InlineHookLibrary, 'runScriptInLocalVm');

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
        event,
      })
    ).resolves.toEqual(executionResult);
    expect(remoteRunner.isDone()).toBe(true);
    expect(runScriptInLocalVm).not.toHaveBeenCalled();
    expect(mockAppend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ runtimeLocation: 'remote' })
    );
    expect(trackMetric).toHaveBeenCalledTimes(2);
    expect(trackMetric).toHaveBeenCalledWith({
      name: inlineHookMetricNames.executionCount,
      value: 1,
      properties: {
        hookType: 'PostSignIn',
        runtimeLocation: 'azure',
        outcome: 'success',
        action: 'updateUser',
      },
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
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: 'const runInlineHook = () => ({ action: "continue" });',
    });
    const runScriptInLocalVm = jest.spyOn(InlineHookLibrary, 'runScriptInLocalVm');

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
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
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      script: 'const runInlineHook = () => ({ action: "continue" });',
    });
    const runScriptInLocalVm = jest.spyOn(InlineHookLibrary, 'runScriptInLocalVm');

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostSignIn,
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
    getInlineHook.mockResolvedValueOnce({
      enabled: true,
      onExecutionError: 'allow',
      script: 'const runInlineHook = () => ({ passwordVerified: true });',
    });
    const runScriptInLocalVm = jest.spyOn(InlineHookLibrary, 'runScriptInLocalVm');

    await expect(
      runHook({
        key: LogtoInlineHookKey.PostFirstFactorVerification,
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
