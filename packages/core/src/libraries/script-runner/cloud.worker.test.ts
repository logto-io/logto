import { type Optional } from '@silverhand/essentials';
import nock from 'nock';

import { EnvSet } from '#src/env-set/index.js';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { parseCloudScriptFailure, runScriptOnCloud } from './cloud.js';

const { jest } = import.meta;

const workerEndpoint = 'http://script-runner.example.com';
const workerAccessToken = 'worker-access-token';

const getWorkerAccessToken = jest.fn(async () => workerAccessToken);
const invalidateWorkerAccessToken = jest.fn();
const post = jest.fn();

const cloudConnection = {
  getWorkerAccessToken,
  invalidateWorkerAccessToken,
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

/**
 * Run and return the rejection reason, failing loudly if the call resolves.
 *
 * Assertions must not be thrown from a nock reply callback: nock invokes it synchronously outside
 * its own error handling, so a `JestAssertionError` escapes as an uncaught exception and the
 * request is never answered — the run then only settles when the 5s deadline fires, reporting a
 * timeout instead of the real diff.
 */
const runAndCatch = async (isTest?: boolean): Promise<unknown> => {
  try {
    await run(isTest);
  } catch (error: unknown) {
    return error;
  }

  throw new Error('Expected the run to reject.');
};

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
    // Captured rather than asserted inline; see `runAndCatch`.
    // eslint-disable-next-line @silverhand/fp/no-let
    let testRunBody: Optional<unknown>;
    // eslint-disable-next-line @silverhand/fp/no-let
    let productionRunBody: Optional<unknown>;

    mockWorkerCall()
      .matchHeader('content-type', 'application/json')
      .reply(200, (uri, body) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        testRunBody = body;

        return { ok: true, value: null };
      });

    await expect(run(true)).resolves.toBeNull();

    expect(testRunBody).toMatchObject({
      tenantId: 'test-tenant',
      entry: 'runAction',
      isTest: true,
    });

    mockWorkerCall().reply(200, (uri, body) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      productionRunBody = body;

      return { ok: true, value: null };
    });

    await expect(run()).resolves.toBeNull();

    expect(productionRunBody).toMatchObject({ tenantId: 'test-tenant' });
    expect(productionRunBody).not.toHaveProperty('isTest');
  });

  it('reshapes a script failure into the cloud route error body', async () => {
    mockWorkerCall().reply(200, {
      ok: false,
      kind: 'denied',
      message: 'Access denied.',
    });

    const error = await runAndCatch();

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

    const error = await runAndCatch();

    expect(error).toMatchObject({ status: 500 });
    await expect(parseCloudScriptFailure(error)).resolves.toEqual({
      kind: 'runtime',
      message: 'Boom.',
      stack: 'TypeError: Boom.\n  at <redacted>',
    });
  });

  it('maps a non-2xx response to a transport failure, not a script failure', async () => {
    mockWorkerCall().reply(401, { message: 'JWT verification failed.' });

    const error = await runAndCatch();

    expect(error).toMatchObject({ status: 500 });
    await expect(parseCloudScriptFailure(error)).resolves.toBeUndefined();
  });

  it('keeps the upstream body out of the message and caps it', async () => {
    const longBody = 'x'.repeat(1000);
    mockWorkerCall().reply(502, longBody);

    const error = await runAndCatch();
    const body: unknown = await (error as { response: Response }).response.json();

    expect(body).toMatchObject({ message: 'Script runner error: 502' });
    // The body is carried in a structured field, capped to the prefix plus the ellipsis.
    expect((body as { responseBody: string }).responseBody).toHaveLength(257);
    expect((body as { message: string }).message).not.toContain('x');
  });

  it('carries the raw body when the envelope drifts', async () => {
    mockWorkerCall().reply(200, { ok: false, kind: 'brandNewKind', message: 'Boom.' });

    const error = await runAndCatch();
    const body: unknown = await (error as { response: Response }).response.json();

    expect(body).toMatchObject({
      message: 'Script runner returned an unexpected response.',
      responseBody: JSON.stringify({ ok: false, kind: 'brandNewKind', message: 'Boom.' }),
    });
    await expect(parseCloudScriptFailure(error)).resolves.toBeUndefined();
  });

  it('maps an unrecognizable envelope to a transport failure', async () => {
    mockWorkerCall().reply(200, { unexpected: true });

    const error = await runAndCatch();

    expect(error).toMatchObject({ status: 500 });
    await expect(parseCloudScriptFailure(error)).resolves.toBeUndefined();
  });

  it.each([401, 403])('drops the cached worker token on a %i', async (status) => {
    mockWorkerCall().reply(status, { message: 'Nope.' });

    await runAndCatch();

    expect(invalidateWorkerAccessToken).toHaveBeenCalledTimes(1);
  });

  it('keeps the cached worker token on a non-auth failure', async () => {
    mockWorkerCall().reply(500, { message: 'Nope.' });

    await runAndCatch();

    expect(invalidateWorkerAccessToken).not.toHaveBeenCalled();
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
