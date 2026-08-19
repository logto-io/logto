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

/** Intercept the script runner call, optionally asserting the request body via nock's matcher. */
const mockScriptRun = (body?: nock.RequestBodyMatcher) =>
  nock(scriptRunnerEndpoint).post('/api/script-run', body);

describe('JwtCustomizerLibrary.runScriptRemotely', () => {
  beforeEach(() => {
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue(scriptRunnerEndpoint);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('runs the script on the Cloud script runner', async () => {
    mockScriptRun({
      tenantId: 'test-tenant',
      entry: 'getCustomJwtClaims',
      script: payload.script,
      // `tokenType` selects the customizer on this side and must not reach the user script.
      payload: {
        token: payload.token,
        context: payload.context,
        environmentVariables: payload.environmentVariables,
      },
    }).reply(200, { ok: true, value: { foo: 'bar' } });

    await expect(library.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
    expect(post).not.toHaveBeenCalled();
  });

  it('marks a dry run as a test', async () => {
    const scriptRunner = mockScriptRun(
      (body: Record<string, unknown>) => body.isTest === true
    ).reply(200, { ok: true, value: {} });

    await library.runScriptRemotely(payload, true);
    expect(scriptRunner.isDone()).toBe(true);
  });

  it('rejects a returned value that is not a record', async () => {
    mockScriptRun().reply(200, { ok: true, value: 'not a record' });

    await expect(library.runScriptRemotely(payload)).rejects.toMatchObject({ status: 400 });
  });

  it('converts a denial into a recognizable access denied error', async () => {
    mockScriptRun().reply(200, { ok: false, kind: 'denied', message: 'Nope' });

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
    mockScriptRun().reply(200, { ok: false, kind, message: 'Script failed' });

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
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue(scriptRunnerEndpoint);
    setIsCloud(true);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    setIsCloud(originalIsCloud);
  });

  it('skips the run when the plan does not include custom JWT', async () => {
    getSubscriptionData.mockResolvedValueOnce({ quota: { customJwtEnabled: false } });

    await expect(library.runScriptRemotely(payload)).resolves.toBeUndefined();
    expect(getWorkerAccessToken).not.toHaveBeenCalled();
  });

  it('runs when the plan includes custom JWT', async () => {
    getSubscriptionData.mockResolvedValueOnce({ quota: { customJwtEnabled: true } });
    mockScriptRun().reply(200, { ok: true, value: { foo: 'bar' } });

    await expect(library.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
  });

  it('never meters the admin tenant', async () => {
    const adminLibrary = createLibrary(adminTenantId);
    mockScriptRun().reply(200, { ok: true, value: { foo: 'bar' } });

    await expect(adminLibrary.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
    expect(getSubscriptionData).not.toHaveBeenCalled();
  });
});

describe('JwtCustomizerLibrary.runScriptRemotely on the legacy remote paths', () => {
  beforeEach(() => {
    // An unset script runner endpoint is what selects the legacy remote paths.
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue('');
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
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
    expect(getWorkerAccessToken).not.toHaveBeenCalled();
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
    expect(getWorkerAccessToken).not.toHaveBeenCalled();
  });
});
