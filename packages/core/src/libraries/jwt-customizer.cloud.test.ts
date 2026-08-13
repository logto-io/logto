import { adminTenantId, CustomJwtErrorCode, LogtoJwtTokenKeyType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import nock from 'nock';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import { isAccessDeniedError, parseCustomJwtResponseError } from '#src/utils/custom-jwt/index.js';

import type { CloudConnectionLibrary } from './cloud-connection.js';
import { JwtCustomizerLibrary } from './jwt-customizer.js';
import type { LogtoConfigLibrary } from './logto-config.js';
import type { ScopeLibrary } from './scope.js';
import type { SubscriptionLibrary } from './subscription.js';
import type { UserLibrary } from './user.js';

const { jest } = import.meta;

const post = jest.fn();
const getSubscriptionData = jest.fn(async () => ({ quota: { customJwtEnabled: true } }));
const getWorkerAccessToken = jest.fn(async () => 'worker-access-token');

const scriptRunnerEndpoint = 'http://script-runner.example.com';

const cloudConnection = {
  getClient: async () => ({ post }),
  getWorkerAccessToken,
  invalidateWorkerAccessToken: jest.fn(),
} as unknown as CloudConnectionLibrary;

const createLibrary = (tenantId = 'test-tenant') =>
  new JwtCustomizerLibrary(
    tenantId,
    {} as Queries,
    {} as LogtoConfigLibrary,
    cloudConnection,
    { getSubscriptionData } as unknown as SubscriptionLibrary,
    {} as UserLibrary,
    {} as ScopeLibrary
  );

const library = createLibrary();

const payload = Object.freeze({
  script: 'const getCustomJwtClaims = () => ({ foo: "bar" });',
  tokenType: LogtoJwtTokenKeyType.AccessToken,
  token: { sub: 'foo' },
  context: { user: { id: 'foo' } },
  environmentVariables: { SECRET: 'secret' },
});

/** Intercept the script runner call, capturing the request body for assertions. */
const mockScriptRun = (reply: (body: unknown) => unknown) =>
  nock(scriptRunnerEndpoint)
    .post('/api/script-run')
    .reply(200, (uri, body) => reply(body));

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

describe('JwtCustomizerLibrary.runScriptRemotely', () => {
  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue(scriptRunnerEndpoint);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('runs the script on the Cloud script runner', async () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let requestBody: unknown;
    mockScriptRun((body) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      requestBody = body;

      return { ok: true, value: { foo: 'bar' } };
    });

    await expect(library.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
    expect(requestBody).toEqual({
      tenantId: 'test-tenant',
      entry: 'getCustomJwtClaims',
      script: payload.script,
      // `tokenType` selects the customizer on this side and must not reach the user script.
      payload: {
        token: payload.token,
        context: payload.context,
        environmentVariables: payload.environmentVariables,
      },
    });
    expect(post).not.toHaveBeenCalled();
  });

  it('marks a dry run as a test', async () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let requestBody: unknown;
    mockScriptRun((body) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      requestBody = body;

      return { ok: true, value: {} };
    });

    await library.runScriptRemotely(payload, true);
    expect(requestBody).toMatchObject({ isTest: true });
  });

  it('rejects a returned value that is not a record', async () => {
    mockScriptRun(() => ({ ok: true, value: 'not a record' }));

    await expect(library.runScriptRemotely(payload)).rejects.toMatchObject({ status: 400 });
  });

  it('converts a denial into a recognizable access denied error', async () => {
    mockScriptRun(() => ({ ok: false, kind: 'denied', message: 'Nope' }));

    const error: unknown = await library
      .runScriptRemotely(payload)
      .catch((error: unknown) => error);

    expect(error).toBeInstanceOf(ResponseError);
    assert(error instanceof ResponseError, new Error('Expected a `ResponseError`'));

    const body = await parseCustomJwtResponseError(error);
    expect(body.message).toBe('Nope');
    expect(isAccessDeniedError(body.error)).toBe(true);
    expect(body.error).toMatchObject({ code: CustomJwtErrorCode.AccessDenied, message: 'Nope' });
  });

  it.each([
    ['syntax', 422],
    ['type', 422],
    ['timeout', 500],
    ['oom', 500],
    ['runtime', 500],
  ])('maps a %s script failure to status %i', async (kind, status) => {
    mockScriptRun(() => ({ ok: false, kind, message: 'Script failed' }));

    await expect(library.runScriptRemotely(payload)).rejects.toMatchObject({ status });
  });

  it('surfaces a transport failure as a 500, not as a script failure', async () => {
    nock(scriptRunnerEndpoint).post('/api/script-run').reply(401, { message: 'Nope.' });

    await expect(library.runScriptRemotely(payload)).rejects.toMatchObject({ status: 500 });
  });
});

describe('JwtCustomizerLibrary.runScriptRemotely quota', () => {
  const originalIsCloud = EnvSet.values.isCloud;

  const setIsCloud = (isCloud: boolean) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for the Cloud-only quota check.
    (EnvSet.values as { isCloud: boolean }).isCloud = isCloud;
  };

  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue(scriptRunnerEndpoint);
    setIsCloud(true);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
    setIsCloud(originalIsCloud);
  });

  it('skips the run when the plan does not include custom JWT', async () => {
    getSubscriptionData.mockResolvedValueOnce({ quota: { customJwtEnabled: false } });

    await expect(library.runScriptRemotely(payload)).resolves.toBeUndefined();
    expect(getWorkerAccessToken).not.toHaveBeenCalled();
  });

  it('runs when the plan includes custom JWT', async () => {
    getSubscriptionData.mockResolvedValueOnce({ quota: { customJwtEnabled: true } });
    mockScriptRun(() => ({ ok: true, value: { foo: 'bar' } }));

    await expect(library.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
  });

  it('never meters the admin tenant', async () => {
    const adminLibrary = createLibrary(adminTenantId);
    mockScriptRun(() => ({ ok: true, value: { foo: 'bar' } }));

    await expect(adminLibrary.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
    expect(getSubscriptionData).not.toHaveBeenCalled();
  });
});

describe('JwtCustomizerLibrary.runScriptRemotely on the legacy remote paths', () => {
  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('falls back to the legacy path when the script runner endpoint is not injected', async () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue('');
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue('');
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue('');
    post.mockResolvedValueOnce({ foo: 'bar' });

    await expect(library.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
    expect(getWorkerAccessToken).not.toHaveBeenCalled();
  });

  it('runs the script through the regional untrusted Azure Function app when configured', async () => {
    const endpoint = 'https://untrusted.example.com';
    const functionKey = 'function-key';
    const remoteRunner = nock(endpoint, {
      reqheaders: { 'x-functions-key': functionKey },
    })
      .post('/api/custom-jwt')
      .reply(200, { foo: 'bar' });

    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue(endpoint);
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue(functionKey);

    await expect(library.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
    expect(remoteRunner.isDone()).toBe(true);
    expect(post).not.toHaveBeenCalled();
  });

  it('falls back to the deprecated custom-jwt cloud endpoint', async () => {
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppEndpoint', 'get').mockReturnValue('');
    jest.spyOn(EnvSet.values, 'azureFunctionUntrustedAppKey', 'get').mockReturnValue('');
    post.mockResolvedValueOnce({ foo: 'bar' });

    await expect(library.runScriptRemotely(payload, true)).resolves.toEqual({ foo: 'bar' });
    expect(post).toHaveBeenCalledWith('/api/services/custom-jwt', {
      body: payload,
      search: { isTest: 'true' },
    });
  });
});
