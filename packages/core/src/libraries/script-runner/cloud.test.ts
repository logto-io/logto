import nock from 'nock';

import { type CloudConnectionLibrary } from '../cloud-connection.js';

import { runScriptOnCloud } from './cloud.js';

const { jest } = import.meta;

const endpoint = 'http://script-runner.example.com';
const workerAccessToken = 'worker-access-token';

const getWorkerAccessToken = jest.fn(async () => workerAccessToken);
const invalidateWorkerAccessToken = jest.fn();

const cloudConnection = {
  getWorkerAccessToken,
  invalidateWorkerAccessToken,
} as unknown as CloudConnectionLibrary;

const script = 'const runAction = () => ({ action: "continue" });';

const run = async (isTest?: boolean) =>
  runScriptOnCloud({
    cloudConnection,
    endpoint,
    tenantId: 'test-tenant',
    script,
    entry: 'runAction',
    payload: { event: {} },
    isTest,
  });

/** Intercept the Worker call, asserting the auth header the token mint produced. */
const mockWorkerCall = (body?: nock.RequestBodyMatcher) =>
  nock(endpoint, {
    reqheaders: { authorization: `Bearer ${workerAccessToken}` },
  }).post('/api/script-run', body);

/** The rejection reason of a run that is expected to throw. */
const runAndCatch = async (): Promise<unknown> => expect(run()).rejects.toThrow();

describe('runScriptOnCloud', () => {
  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  it('posts the run request and returns a success result', async () => {
    mockWorkerCall({
      tenantId: 'test-tenant',
      entry: 'runAction',
      script,
      payload: { event: {} },
    }).reply(200, { ok: true, value: { action: 'continue' } });

    await expect(run()).resolves.toEqual({ ok: true, value: { action: 'continue' } });
  });

  it('forwards the dry-run flag', async () => {
    mockWorkerCall((body: Record<string, unknown>) => body.isTest === true).reply(200, {
      ok: true,
      value: null,
    });

    await expect(run(true)).resolves.toEqual({ ok: true, value: null });
  });

  it('returns a script failure as a result rather than throwing', async () => {
    mockWorkerCall().reply(200, {
      ok: false,
      kind: 'runtime',
      message: 'Boom.',
      stack: 'TypeError: Boom.\n  at <redacted>',
    });

    await expect(run()).resolves.toEqual({
      ok: false,
      kind: 'runtime',
      message: 'Boom.',
      stack: 'TypeError: Boom.\n  at <redacted>',
    });
  });

  it('keeps the upstream body out of the error on a non-2xx', async () => {
    mockWorkerCall().reply(502, 'x'.repeat(1000));

    const error = await run().catch((error: unknown) => error);
    const body: unknown = await (error as { response: Response }).response.json();

    // The status identifies the failure; the body reaches the audit log and the RP, so it is dropped.
    expect(body).toEqual({ message: 'Script runner error: 502' });
  });

  it('throws when the envelope drifts', async () => {
    mockWorkerCall().reply(200, { ok: false, kind: 'brandNewKind', message: 'Boom.' });

    const error = await run().catch((error: unknown) => error);
    const body: unknown = await (error as { response: Response }).response.json();

    expect(body).toEqual({ message: 'Script runner returned an unexpected response.' });
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
});
