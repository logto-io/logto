import nock from 'nock';

import { EnvSet } from '#src/env-set/index.js';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { parseCloudScriptFailure, runScriptOnCloud } from './cloud.js';

const { jest } = import.meta;

const workerEndpoint = 'http://script-runner.example.com';
const workerAccessToken = 'worker-access-token';

const getWorkerAccessToken = jest.fn(async () => workerAccessToken);
const post = jest.fn();

const cloudConnection = {
  getWorkerAccessToken,
  getClient: async () => ({ post }),
} as unknown as CloudConnectionLibrary;

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const run = async (isTest?: boolean) =>
  runScriptOnCloud({
    cloudConnection,
    tenantId: 'test-tenant',
    script: 'const runAction = () => ({ action: "continue" });',
    entry: 'runAction',
    payload: { event: {} },
    isTest,
  });

/** Intercept the direct Worker call, asserting the auth header the token mint produced. */
const mockWorkerCall = () =>
  nock(workerEndpoint, {
    reqheaders: { authorization: `Bearer ${workerAccessToken}` },
  }).post('/api/script-run');

describe('runScriptOnCloud on the direct Worker path', () => {
  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue(workerEndpoint);
  });

  afterEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
    jest.restoreAllMocks();
    jest.clearAllMocks();
    nock.cleanAll();
  });

  it('posts the run request and unwraps a success envelope', async () => {
    const interceptor = mockWorkerCall();
    interceptor.reply(200, { ok: true, value: { action: 'continue' } });

    await expect(run()).resolves.toEqual({ action: 'continue' });
    expect(post).not.toHaveBeenCalled();
  });

  it('sends tenantId and forwards isTest only when set', async () => {
    mockWorkerCall()
      .matchHeader('content-type', 'application/json')
      .reply(200, function (uri, body) {
        expect(body).toMatchObject({
          tenantId: 'test-tenant',
          entry: 'runAction',
          isTest: true,
        });

        return { ok: true, value: null };
      });

    await expect(run(true)).resolves.toBeNull();

    mockWorkerCall().reply(200, function (uri, body) {
      expect(body).not.toHaveProperty('isTest');

      return { ok: true, value: null };
    });

    await expect(run()).resolves.toBeNull();
  });

  it('reshapes a script failure into the cloud route error body', async () => {
    mockWorkerCall().reply(200, {
      ok: false,
      kind: 'denied',
      message: 'Access denied.',
    });

    const error = await run().then(
      () => {
        throw new Error('Expected the run to reject.');
      },
      (error: unknown) => error
    );

    expect(error).toMatchObject({ status: 403 });
    await expect(parseCloudScriptFailure(error)).resolves.toEqual({
      kind: 'denied',
      message: 'Access denied.',
    });
  });

  it('keeps the stack of a runtime failure through the reshaping', async () => {
    mockWorkerCall().reply(200, {
      ok: false,
      kind: 'runtime',
      name: 'TypeError',
      message: 'Boom.',
      stack: 'TypeError: Boom.\n  at <redacted>',
    });

    const error = await run().then(
      () => {
        throw new Error('Expected the run to reject.');
      },
      (error: unknown) => error
    );

    expect(error).toMatchObject({ status: 500 });
    await expect(parseCloudScriptFailure(error)).resolves.toEqual({
      kind: 'runtime',
      message: 'Boom.',
      stack: 'TypeError: Boom.\n  at <redacted>',
    });
  });

  it('maps a non-2xx response to a transport failure, not a script failure', async () => {
    mockWorkerCall().reply(401, { message: 'JWT verification failed.' });

    const error = await run().then(
      () => {
        throw new Error('Expected the run to reject.');
      },
      (error: unknown) => error
    );

    expect(error).toMatchObject({ status: 500 });
    await expect(parseCloudScriptFailure(error)).resolves.toBeUndefined();
  });

  it('maps an unrecognizable envelope to a transport failure', async () => {
    mockWorkerCall().reply(200, { unexpected: true });

    const error = await run().then(
      () => {
        throw new Error('Expected the run to reject.');
      },
      (error: unknown) => error
    );

    expect(error).toMatchObject({ status: 500 });
    await expect(parseCloudScriptFailure(error)).resolves.toBeUndefined();
  });

  it('stays on the cloud service hop when the Worker endpoint is not configured', async () => {
    jest.spyOn(EnvSet.values, 'scriptRunnerEndpoint', 'get').mockReturnValue('');
    post.mockResolvedValueOnce({ value: 'from-cloud' });

    await expect(run()).resolves.toBe('from-cloud');
    expect(getWorkerAccessToken).not.toHaveBeenCalled();
  });

  it('stays on the cloud service hop when dev features are disabled', async () => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
    post.mockResolvedValueOnce({ value: 'from-cloud' });

    await expect(run()).resolves.toBe('from-cloud');
    expect(getWorkerAccessToken).not.toHaveBeenCalled();
  });
});
