import { CustomJwtErrorCode, LogtoJwtTokenKeyType } from '@logto/schemas';
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
import type { UserLibrary } from './user.js';

const { jest } = import.meta;

const post = jest.fn();

const library = new JwtCustomizerLibrary(
  'test-tenant',
  {} as Queries,
  {} as LogtoConfigLibrary,
  { getClient: async () => ({ post }) } as unknown as CloudConnectionLibrary,
  {} as UserLibrary,
  {} as ScopeLibrary
);

const payload = Object.freeze({
  script: 'const getCustomJwtClaims = () => ({ foo: "bar" });',
  tokenType: LogtoJwtTokenKeyType.AccessToken,
  token: { sub: 'foo' },
  context: { user: { id: 'foo' } },
  environmentVariables: { SECRET: 'secret' },
});

/** The body `POST /api/services/script-run` returns for a failed run, as withtyped shapes it. */
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

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

describe('JwtCustomizerLibrary.runScriptRemotely', () => {
  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('runs the script through the Cloud script-run endpoint', async () => {
    post.mockResolvedValueOnce({ value: { foo: 'bar' } });

    await expect(library.runScriptRemotely(payload)).resolves.toEqual({ foo: 'bar' });
    expect(post).toHaveBeenCalledWith('/api/services/script-run', {
      body: {
        entry: 'getCustomJwtClaims',
        script: payload.script,
        // `tokenType` selects the customizer on this side and must not reach the user script.
        payload: {
          token: payload.token,
          context: payload.context,
          environmentVariables: payload.environmentVariables,
        },
      },
    });
  });

  it('marks a dry run as a test', async () => {
    post.mockResolvedValueOnce({ value: {} });

    await library.runScriptRemotely(payload, true);
    expect(post).toHaveBeenCalledWith('/api/services/script-run', {
      body: {
        entry: 'getCustomJwtClaims',
        script: payload.script,
        payload: {
          token: payload.token,
          context: payload.context,
          environmentVariables: payload.environmentVariables,
        },
        isTest: true,
      },
    });
  });

  it('rejects a returned value that is not a record', async () => {
    post.mockResolvedValueOnce({ value: 'not a record' });

    await expect(library.runScriptRemotely(payload)).rejects.toMatchObject({ status: 400 });
  });

  it('converts a denial into a recognizable access denied error', async () => {
    post.mockRejectedValueOnce(buildScriptFailureResponseError(403, 'Nope', { kind: 'denied' }));

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
    post.mockRejectedValueOnce(buildScriptFailureResponseError(status, 'Script failed', { kind }));

    await expect(library.runScriptRemotely(payload)).rejects.toMatchObject({ status });
  });

  it('rethrows a non-script-failure error untouched', async () => {
    const error = buildScriptFailureResponseError(403, 'Custom JWT is not available.', {});
    post.mockRejectedValueOnce(error);

    await expect(library.runScriptRemotely(payload)).rejects.toBe(error);
  });
});

describe('JwtCustomizerLibrary.runScriptRemotely without dev features', () => {
  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
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
